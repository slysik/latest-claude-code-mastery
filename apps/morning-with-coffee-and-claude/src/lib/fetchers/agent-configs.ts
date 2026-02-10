import type { EcosystemEntry, AgentConfigMeta } from '@/lib/types'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? ''
const DELAY_BETWEEN_QUERIES = 6_000 // 10 req/min limit for code search

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'morning-coffee-claude',
  }
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`
  }
  return headers
}

interface GitHubCodeSearchResult {
  items?: Array<{
    name: string
    path: string
    html_url: string
    repository: {
      full_name: string
      html_url: string
      description: string | null
      owner: { login: string }
      stargazers_count: number
      updated_at: string
    }
    url: string // API URL to fetch file content
  }>
}

function parseYamlFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}

  const kvPairs: Record<string, string> = {}
  const lines = match[1].split('\n')
  for (const line of lines) {
    const colonIdx = line.indexOf(':')
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim()
      const value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '')
      if (key && value) {
        kvPairs[key] = value
      }
    }
  }
  return kvPairs
}

function inferConfigType(path: string): AgentConfigMeta['configType'] {
  if (path.includes('/agents/')) return 'agent'
  if (path.includes('/commands/')) return 'command'
  if (path.includes('/hooks/')) return 'hook'
  return 'agent' // default
}

async function fetchFileContent(apiUrl: string): Promise<string | null> {
  try {
    const res = await fetch(apiUrl, {
      cache: 'no-store',
      headers: getHeaders(),
    })
    if (!res.ok) return null

    const data = (await res.json()) as {
      content?: string
      encoding?: string
    }
    if (data.encoding === 'base64' && data.content) {
      return Buffer.from(data.content, 'base64').toString('utf-8')
    }
    return null
  } catch {
    return null
  }
}

export async function fetchAgentConfigs(): Promise<EcosystemEntry[]> {
  // Code search requires auth
  if (!GITHUB_TOKEN) {
    console.log(
      '[agent-configs] Skipping — GITHUB_TOKEN not set (code search requires auth)',
    )
    return []
  }

  const queries = [
    'path:.claude/agents filename:*.md',
    'path:.claude/commands filename:*.md',
    'path:.claude/hooks filename:*.py',
  ]

  const seenRepos = new Set<string>()
  const entries: EcosystemEntry[] = []

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15_000)

  try {
    for (let qi = 0; qi < queries.length; qi++) {
      if (qi > 0) await sleep(DELAY_BETWEEN_QUERIES)

      const query = queries[qi]
      const url = `https://api.github.com/search/code?q=${encodeURIComponent(query)}&per_page=30`

      const res = await fetch(url, {
        cache: 'no-store',
        signal: controller.signal,
        headers: getHeaders(),
      })

      if (!res.ok) {
        console.error(
          `[agent-configs] Search HTTP ${res.status} for query: ${query}`,
        )
        continue
      }

      const data: GitHubCodeSearchResult = await res.json()
      const items = data.items ?? []

      // Fetch up to 10 file contents for YAML parsing
      let fetchCount = 0
      for (const item of items) {
        if (fetchCount >= 10) break

        const repoUrl = item.repository.html_url
        if (seenRepos.has(repoUrl)) continue
        seenRepos.add(repoUrl)

        // Fetch file content for YAML frontmatter
        const content = await fetchFileContent(item.url)
        const frontmatter = content ? parseYamlFrontmatter(content) : {}
        fetchCount++

        const configType = inferConfigType(item.path)
        const agentMeta: AgentConfigMeta = {
          configType,
          modelTier: frontmatter.model ?? null,
          toolRestrictions: frontmatter.tools
            ? frontmatter.tools
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean)
            : null,
        }

        entries.push({
          name: `${item.repository.full_name} — ${item.name}`,
          type: 'agent_config',
          author: item.repository.owner.login,
          description: item.repository.description ?? `${configType} configuration`,
          githubUrl: item.html_url,
          stars: item.repository.stargazers_count ?? 0,
          lastUpdated: item.repository.updated_at,
          categoryTags: [
            configType,
            ...(frontmatter.model ? [frontmatter.model] : []),
          ],
          mentionCount: 0,
          agentMeta,
        })
      }
    }
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      console.error('[agent-configs] Timeout — returning partial results')
    } else {
      console.error('[agent-configs] Fetch failed:', error)
    }
  } finally {
    clearTimeout(timeout)
  }

  console.log(
    `[agent-configs] Found ${entries.length} agent configs from ${seenRepos.size} repos`,
  )
  return entries
}

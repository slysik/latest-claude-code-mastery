import type { EcosystemEntry } from '@/lib/types'

/**
 * Scrape awesome lists via GitHub API to populate the ecosystem grid.
 * Returns EcosystemEntry[] directly (not FetchedItem[]).
 *
 * Sources:
 * - hesreallyhim/awesome-claude-code (hooks, skills, tools)
 * - punkpeye/awesome-mcp-servers (MCP servers)
 * - jqueryscript/awesome-claude-code (tools, frameworks)
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? ''

interface GitHubContents {
  content?: string
  encoding?: string
}

interface RepoInfo {
  owner: string
  repo: string
  /** Default type for entries from this list */
  defaultType: EcosystemEntry['type']
  /** File path within the repo */
  path: string
}

const AWESOME_REPOS: RepoInfo[] = [
  {
    owner: 'hesreallyhim',
    repo: 'awesome-claude-code',
    defaultType: 'hook',
    path: 'README.md',
  },
  {
    owner: 'punkpeye',
    repo: 'awesome-mcp-servers',
    defaultType: 'mcp_server',
    path: 'README.md',
  },
  {
    owner: 'jqueryscript',
    repo: 'awesome-claude-code',
    defaultType: 'plugin',
    path: 'README.md',
  },
]

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

/** Infer ecosystem type from entry name, description, or section context */
function inferType(
  name: string,
  description: string,
  defaultType: EcosystemEntry['type'],
): EcosystemEntry['type'] {
  const lower = `${name} ${description}`.toLowerCase()
  if (lower.includes('mcp') || lower.includes('model context protocol')) return 'mcp_server'
  if (lower.includes('hook') || lower.includes('lifecycle')) return 'hook'
  if (lower.includes('skill') || lower.includes('slash command')) return 'skill'
  return defaultType
}

/** Extract category tags from description keywords */
function extractTags(name: string, description: string): string[] {
  const lower = `${name} ${description}`.toLowerCase()
  const tags: string[] = []

  const tagMap: Record<string, string> = {
    'mcp': 'mcp',
    'hook': 'hooks',
    'skill': 'skills',
    'plugin': 'plugin',
    'cli': 'cli',
    'vscode': 'vscode',
    'ide': 'ide',
    'database': 'database',
    'api': 'api',
    'security': 'security',
    'testing': 'testing',
    'docker': 'docker',
    'git': 'git',
    'automation': 'automation',
    'browser': 'browser',
    'file': 'filesystem',
    'memory': 'memory',
    'search': 'search',
  }

  for (const [keyword, tag] of Object.entries(tagMap)) {
    if (lower.includes(keyword)) tags.push(tag)
  }

  return tags.slice(0, 5)
}

/**
 * Parse markdown to extract list entries.
 * Handles common awesome-list formats:
 * - [Name](url) by [Author](author_url) - Description
 * - [Name](url) - Description
 * - [Name](url) — Description
 * - **[Name](url)** - Description
 */
function parseMarkdownEntries(
  markdown: string,
  defaultType: EcosystemEntry['type'],
  repoSource: string,
): EcosystemEntry[] {
  const entries: EcosystemEntry[] = []
  const seen = new Set<string>()

  // Process line by line for more reliable parsing
  const lines = markdown.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('-') && !trimmed.startsWith('*')) continue

    // Extract the primary link: [Name](url)
    const linkMatch = trimmed.match(
      /^[-*]\s+(?:\*\*)?(?:\[([^\]]+)\]\(([^)]+)\))(?:\*\*)?/,
    )
    if (!linkMatch) continue

    const [fullLinkMatch, name, url] = linkMatch
    if (!name || !url) continue
    if (url.startsWith('#')) continue // skip anchors
    if (seen.has(url)) continue

    // Extract author if present: by [Author](url)
    let author: string | null = null
    const afterLink = trimmed.slice(fullLinkMatch.length)
    const authorMatch = afterLink.match(/\s*by\s+\[([^\]]+)\]\([^)]+\)/)
    if (authorMatch) {
      author = authorMatch[1]
    }

    // Extract description: everything after the last separator (- or — or :)
    // First strip the "by [Author](url)" part if present
    let rest = afterLink
    if (authorMatch) {
      rest = rest.slice(rest.indexOf(authorMatch[0]) + authorMatch[0].length)
    }

    // Find description after separator
    const descMatch = rest.match(/\s*[-–—:]\s*(.+)/)
    const description = descMatch
      ? descMatch[1]
          .replace(/\s*\(?\[.*?\]\(.*?\)\)?/g, '') // strip remaining links
          .trim()
          .slice(0, 200)
      : null

    if (!description || description.length < 5) continue

    seen.add(url)

    // Infer author from GitHub URL if not found in markdown
    if (!author) {
      const isGitHub = url.includes('github.com')
      author = isGitHub
        ? url.split('github.com/')[1]?.split('/')[0] ?? null
        : null
    }

    const type = inferType(name, description, defaultType)
    const isGitHub = url.includes('github.com')

    entries.push({
      name: name.trim().replace(/\*\*/g, ''),
      type,
      author,
      description,
      githubUrl: isGitHub ? url : null,
      stars: 0,
      lastUpdated: null,
      categoryTags: extractTags(name, description),
      mentionCount: 0,
      agentMeta: null,
    })
  }

  console.log(`[awesome] Parsed ${entries.length} entries from ${repoSource}`)
  return entries
}

async function fetchRepoReadme(
  repo: RepoInfo,
  signal: AbortSignal,
): Promise<EcosystemEntry[]> {
  const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/${repo.path}`

  try {
    const res = await fetch(url, {
      cache: 'no-store',
      signal,
      headers: getHeaders(),
    })

    if (!res.ok) {
      console.error(`[awesome] HTTP ${res.status} for ${repo.owner}/${repo.repo}`)
      return []
    }

    const remaining = res.headers.get('x-ratelimit-remaining')
    if (remaining === '0') {
      console.error('[awesome] GitHub rate limit exhausted')
      return []
    }

    const data: GitHubContents = await res.json()
    if (!data.content || data.encoding !== 'base64') {
      console.error(`[awesome] Unexpected format from ${repo.owner}/${repo.repo}`)
      return []
    }

    const markdown = Buffer.from(data.content, 'base64').toString('utf-8')
    return parseMarkdownEntries(
      markdown,
      repo.defaultType,
      `${repo.owner}/${repo.repo}`,
    )
  } catch (error) {
    console.error(`[awesome] Failed to fetch ${repo.owner}/${repo.repo}:`, error)
    return []
  }
}

/**
 * Enrich entries with star counts by batching GitHub API calls.
 * Only enriches entries with GitHub URLs. Skips on rate limit.
 */
async function enrichWithStars(
  entries: EcosystemEntry[],
  signal: AbortSignal,
): Promise<EcosystemEntry[]> {
  const githubEntries = entries.filter((e) => e.githubUrl?.includes('github.com'))
  // Only enrich a sample to stay within rate limits
  const toEnrich = githubEntries.slice(0, 30)

  const enriched = new Map<string, number>()

  for (const entry of toEnrich) {
    if (!entry.githubUrl) continue
    const match = entry.githubUrl.match(/github\.com\/([^/]+\/[^/]+)/)
    if (!match) continue

    try {
      const res = await fetch(
        `https://api.github.com/repos/${match[1]}`,
        { cache: 'no-store', signal, headers: getHeaders() },
      )

      if (res.status === 404) continue
      if (!res.ok) break // rate limit or other error, stop enriching

      const remaining = res.headers.get('x-ratelimit-remaining')
      if (remaining && parseInt(remaining) < 5) break

      const repo = await res.json()
      if (typeof repo.stargazers_count === 'number') {
        enriched.set(entry.githubUrl, repo.stargazers_count)
      }
    } catch {
      break // network error, stop enriching
    }
  }

  return entries.map((entry) => {
    if (entry.githubUrl && enriched.has(entry.githubUrl)) {
      return { ...entry, stars: enriched.get(entry.githubUrl)! }
    }
    return entry
  })
}

export async function fetchAwesomeLists(): Promise<EcosystemEntry[]> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15_000)

    // Fetch all repos in parallel
    const results = await Promise.allSettled(
      AWESOME_REPOS.map((repo) => fetchRepoReadme(repo, controller.signal)),
    )

    let allEntries: EcosystemEntry[] = []
    for (const result of results) {
      if (result.status === 'fulfilled') {
        allEntries.push(...result.value)
      }
    }

    // Deduplicate by GitHub URL (prefer entry with longer description)
    const byUrl = new Map<string, EcosystemEntry>()
    for (const entry of allEntries) {
      const key = entry.githubUrl ?? entry.name
      const existing = byUrl.get(key)
      if (
        !existing ||
        (entry.description?.length ?? 0) > (existing.description?.length ?? 0)
      ) {
        byUrl.set(key, entry)
      }
    }
    allEntries = Array.from(byUrl.values())

    // Enrich top entries with star counts
    allEntries = await enrichWithStars(allEntries, controller.signal)

    // Sort by stars (enriched ones first)
    allEntries.sort((a, b) => b.stars - a.stars)

    clearTimeout(timeout)
    console.log(`[awesome] Total unique ecosystem entries: ${allEntries.length}`)
    return allEntries
  } catch (error) {
    console.error('[awesome] Fetch failed:', error)
    return []
  }
}

import type { FetchedItem } from '@/lib/types'
import { stripTags } from '@/lib/sanitize'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? ''

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

function checkRateLimit(res: Response): boolean {
  const remaining = res.headers.get('x-ratelimit-remaining')
  if (remaining === '0') {
    console.error('[github] Rate limit exhausted, returning partial data')
    return false
  }
  return true
}

interface GitHubRelease {
  id: number
  name: string | null
  tag_name: string
  html_url: string
  body: string | null
  author: { login: string }
  published_at: string
  created_at: string
}

interface GitHubRepo {
  id: number
  full_name: string
  name: string
  html_url: string
  description: string | null
  owner: { login: string }
  stargazers_count: number
  created_at: string
  updated_at: string
}

interface GitHubSearchResponse {
  items?: GitHubRepo[]
}

interface GitHubContentsResponse {
  content?: string
  encoding?: string
}

async function fetchReleases(
  signal: AbortSignal,
): Promise<FetchedItem[]> {
  const url = 'https://api.github.com/repos/anthropics/claude-code/releases?per_page=10'
  const res = await fetch(url, {
    cache: 'no-store',
    signal,
    headers: getHeaders(),
  })

  if (!res.ok) {
    console.error(`[github] Releases HTTP ${res.status}`)
    return []
  }
  if (!checkRateLimit(res)) return []

  const releases: GitHubRelease[] = await res.json()
  const now = new Date().toISOString()

  return releases.map((rel) => ({
    date: (rel.published_at ?? rel.created_at).split('T')[0],
    source: 'github' as const,
    category: 'feature' as const,
    title: stripTags(rel.name ?? rel.tag_name) ?? rel.tag_name,
    url: rel.html_url,
    author: stripTags(rel.author?.login ?? null),
    excerpt: stripTags(rel.body?.slice(0, 300) ?? null),
    thumbnailUrl: null,
    engagementScore: 0,
    rawMetrics: {},
    fetchedAt: now,
    createdAt: rel.published_at ?? rel.created_at,
  }))
}

async function fetchTrending(
  signal: AbortSignal,
): Promise<FetchedItem[]> {
  const url =
    'https://api.github.com/search/repositories?q=topic:claude-code&sort=stars&per_page=20'
  const res = await fetch(url, {
    cache: 'no-store',
    signal,
    headers: getHeaders(),
  })

  if (!res.ok) {
    console.error(`[github] Trending HTTP ${res.status}`)
    return []
  }
  if (!checkRateLimit(res)) return []

  const data: GitHubSearchResponse = await res.json()
  const now = new Date().toISOString()

  return (data.items ?? []).map((repo) => ({
    date: repo.updated_at.split('T')[0],
    source: 'github' as const,
    category: 'plugin' as const,
    title: stripTags(repo.full_name) ?? repo.full_name,
    url: repo.html_url,
    author: stripTags(repo.owner?.login ?? null),
    excerpt: stripTags(repo.description),
    thumbnailUrl: null,
    engagementScore: 0,
    rawMetrics: { stars: repo.stargazers_count },
    fetchedAt: now,
    createdAt: repo.created_at,
  }))
}

async function fetchAwesomeList(
  signal: AbortSignal,
): Promise<FetchedItem[]> {
  try {
    const url =
      'https://api.github.com/repos/hesreallyhim/awesome-claude-code/contents/README.md'
    const res = await fetch(url, {
      cache: 'no-store',
      signal,
      headers: getHeaders(),
    })

    if (!res.ok) {
      console.error(`[github] Awesome list HTTP ${res.status}`)
      return []
    }

    const data: GitHubContentsResponse = await res.json()
    if (!data.content || data.encoding !== 'base64') {
      console.error('[github] Unexpected awesome list format')
      return []
    }

    const markdown = Buffer.from(data.content, 'base64').toString('utf-8')
    const now = new Date().toISOString()
    const items: FetchedItem[] = []

    // Parse markdown list items: - [Name](url) - Description
    const linkPattern = /^- \[([^\]]+)\]\(([^)]+)\)\s*[-–—]\s*(.+)$/gm
    let match
    while ((match = linkPattern.exec(markdown)) !== null) {
      const [, name, itemUrl, description] = match
      items.push({
        date: now.split('T')[0],
        source: 'github' as const,
        category: 'plugin' as const,
        title: stripTags(name) ?? name,
        url: itemUrl,
        author: null,
        excerpt: stripTags(description),
        thumbnailUrl: null,
        engagementScore: 0,
        rawMetrics: { stars: 0 },
        fetchedAt: now,
        createdAt: now,
      })
    }

    return items
  } catch (error) {
    console.error('[github] Awesome list fetch failed:', error)
    return []
  }
}

export async function fetchGitHub(): Promise<FetchedItem[]> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8_000)

    const [releases, trending, awesome] = await Promise.all([
      fetchReleases(controller.signal),
      fetchTrending(controller.signal),
      fetchAwesomeList(controller.signal),
    ])

    clearTimeout(timeout)
    return [...releases, ...trending, ...awesome]
  } catch (error) {
    console.error('[github] Fetch failed:', error)
    return []
  }
}

import type { FetchedItem } from '@/lib/types'
import { stripTags } from '@/lib/sanitize'

/**
 * Fetch Claude Code stories from Hacker News via the Algolia API.
 * Free, no auth needed. Returns top stories from the past week.
 */

const SEARCH_QUERIES = [
  '"Claude Code"',
  '"claude-code" anthropic',
]

interface HNHit {
  objectID: string
  title: string
  url: string | null
  author: string
  points: number
  num_comments: number
  created_at: string
  story_text?: string | null
  _tags?: string[]
}

interface HNSearchResponse {
  hits?: HNHit[]
}

export async function fetchHackerNews(): Promise<FetchedItem[]> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8_000)

    const allHits = new Map<string, HNHit>()

    for (const query of SEARCH_QUERIES) {
      const params = new URLSearchParams({
        query,
        tags: 'story',
        numericFilters: `created_at_i>${Math.floor(Date.now() / 1000) - 7 * 86400}`,
        hitsPerPage: '30',
      })

      const res = await fetch(
        `https://hn.algolia.com/api/v1/search?${params}`,
        { cache: 'no-store', signal: controller.signal },
      )

      if (!res.ok) {
        console.error(`[hackernews] HTTP ${res.status} for query: ${query}`)
        continue
      }

      const data: HNSearchResponse = await res.json()
      if (data.hits) {
        for (const hit of data.hits) {
          if (!allHits.has(hit.objectID)) {
            allHits.set(hit.objectID, hit)
          }
        }
      }
    }

    clearTimeout(timeout)
    const now = new Date().toISOString()

    return Array.from(allHits.values()).map((hit) => {
      const hnUrl = `https://news.ycombinator.com/item?id=${hit.objectID}`

      return {
        date: hit.created_at.split('T')[0],
        source: 'hackernews' as const,
        category: 'news' as const,
        title: stripTags(hit.title) ?? hit.title,
        url: hit.url ?? hnUrl,
        author: stripTags(hit.author),
        excerpt: stripTags(hit.story_text?.slice(0, 300) ?? null),
        thumbnailUrl: null,
        engagementScore: 0,
        rawMetrics: { points: hit.points, comments: hit.num_comments },
        fetchedAt: now,
        createdAt: hit.created_at,
      }
    })
  } catch (error) {
    console.error('[hackernews] Fetch failed:', error)
    return []
  }
}

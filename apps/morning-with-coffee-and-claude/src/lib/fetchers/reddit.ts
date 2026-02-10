import type { FetchedItem } from '@/lib/types'
import { stripTags } from '@/lib/sanitize'

const SUBREDDITS = ['ClaudeAI', 'ClaudeCode']
const TIP_FLAIRS = ['tip', 'tips', 'trick', 'tricks', 'how-to', 'howto', 'tutorial']
const USER_AGENT = 'morning-coffee-claude:v1.0'

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

interface RedditPost {
  data: {
    id: string
    title: string
    selftext: string
    url: string
    permalink: string
    author: string
    score: number
    num_comments: number
    created_utc: number
    link_flair_text?: string | null
    thumbnail?: string
  }
}

interface RedditListing {
  data: {
    children: RedditPost[]
  }
}

async function fetchSubreddit(
  subreddit: string,
  signal: AbortSignal,
): Promise<FetchedItem[]> {
  const url = `https://www.reddit.com/r/${subreddit}/top.json?limit=25&t=week`
  let res = await fetch(url, {
    cache: 'no-store',
    signal,
    headers: { 'User-Agent': USER_AGENT },
  })

  // Rate limit handling: wait 60s and retry once on 429
  if (res.status === 429) {
    console.error(`[reddit] Rate limited on r/${subreddit}, waiting 60s...`)
    await delay(60_000)
    res = await fetch(url, {
      cache: 'no-store',
      signal,
      headers: { 'User-Agent': USER_AGENT },
    })
    if (res.status === 429) {
      console.error(`[reddit] Still rate limited on r/${subreddit}, returning partial data`)
      return []
    }
  }

  if (!res.ok) {
    console.error(`[reddit] HTTP ${res.status} for r/${subreddit}`)
    return []
  }

  // Verify content type before parsing
  const contentType = res.headers.get('content-type')
  if (!contentType?.includes('application/json')) {
    console.error(`[reddit] Non-JSON response for r/${subreddit}: ${contentType}`)
    return []
  }

  const listing: RedditListing = await res.json()
  const now = new Date().toISOString()

  return listing.data.children.map((child) => {
    const post = child.data
    const flairLower = (post.link_flair_text ?? '').toLowerCase()
    const isTip = TIP_FLAIRS.some((f) => flairLower.includes(f))

    return {
      date: new Date(post.created_utc * 1000).toISOString().split('T')[0],
      source: 'reddit' as const,
      category: isTip ? ('tip' as const) : ('news' as const),
      title: stripTags(post.title) ?? post.title,
      url: `https://reddit.com${post.permalink}`,
      author: stripTags(post.author),
      excerpt: stripTags(post.selftext?.slice(0, 300) || null),
      thumbnailUrl: post.thumbnail?.startsWith('http') ? post.thumbnail : null,
      engagementScore: 0,
      rawMetrics: { upvotes: post.score, comments: post.num_comments },
      fetchedAt: now,
      createdAt: new Date(post.created_utc * 1000).toISOString(),
    }
  })
}

export async function fetchReddit(): Promise<FetchedItem[]> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8_000)

    const results: FetchedItem[] = []
    for (const sub of SUBREDDITS) {
      const items = await fetchSubreddit(sub, controller.signal)
      results.push(...items)
      // 2-second delay between subreddit requests
      if (sub !== SUBREDDITS[SUBREDDITS.length - 1]) {
        await delay(2_000)
      }
    }

    clearTimeout(timeout)
    return results
  } catch (error) {
    console.error('[reddit] Fetch failed:', error)
    return []
  }
}

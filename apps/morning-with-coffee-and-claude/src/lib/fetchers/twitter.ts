import type { FetchedItem } from '@/lib/types'
import { load } from 'cheerio'
import { stripTags } from '@/lib/sanitize'

/**
 * Fetch Claude Code tweets via DuckDuckGo HTML search.
 * Free, no API key needed. Searches for site:x.com results.
 */

const SEARCH_QUERIES = [
  'site:x.com "Claude Code"',
  'site:x.com "claude code" anthropic',
]

interface ParsedTweet {
  url: string
  author: string | null
  snippet: string
}

function parseDDGResults(html: string): ParsedTweet[] {
  const $ = load(html)
  const results: ParsedTweet[] = []
  const seen = new Set<string>()

  // DDG HTML results use .result class with links inside
  $('.result, .results_links').each((_, el) => {
    const link = $(el).find('a.result__a, a.result__url, a[href*="x.com"]').first()
    const href = link.attr('href') ?? ''
    const snippet = $(el).find('.result__snippet, .result__body').text().trim()

    // Extract the actual URL from DDG's redirect wrapper
    let tweetUrl = href
    if (href.includes('uddg=')) {
      try {
        const parsed = new URL(href, 'https://duckduckgo.com')
        tweetUrl = decodeURIComponent(parsed.searchParams.get('uddg') ?? href)
      } catch {
        // keep href as-is
      }
    }

    // Only keep x.com/twitter.com links that look like individual tweets
    if (!tweetUrl.match(/https?:\/\/(x\.com|twitter\.com)\/\w+\/status\/\d+/)) {
      // Also accept profile-level x.com links with snippets
      if (!tweetUrl.match(/https?:\/\/(x\.com|twitter\.com)\/\w+/) || !snippet) {
        return
      }
    }

    // Normalize to x.com
    tweetUrl = tweetUrl.replace('twitter.com', 'x.com')

    if (seen.has(tweetUrl)) return
    seen.add(tweetUrl)

    // Try to extract @handle from the URL
    const handleMatch = tweetUrl.match(/x\.com\/(@?\w+)/)
    const author = handleMatch ? `@${handleMatch[1].replace(/^@/, '')}` : null

    results.push({
      url: tweetUrl,
      author,
      snippet: snippet || link.text().trim(),
    })
  })

  return results
}

export async function fetchTwitter(): Promise<FetchedItem[]> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8_000)

    const allTweets = new Map<string, ParsedTweet>()

    for (const query of SEARCH_QUERIES) {
      const params = new URLSearchParams({ q: query })
      const res = await fetch(
        `https://html.duckduckgo.com/html/?${params}`,
        {
          cache: 'no-store',
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; MorningCoffeBot/1.0)',
          },
        },
      )

      if (!res.ok) {
        console.error(`[twitter] DDG HTTP ${res.status} for query: ${query}`)
        continue
      }

      const html = await res.text()
      const tweets = parseDDGResults(html)

      for (const tweet of tweets) {
        if (!allTweets.has(tweet.url)) {
          allTweets.set(tweet.url, tweet)
        }
      }
    }

    clearTimeout(timeout)
    const now = new Date().toISOString()
    const today = now.split('T')[0]

    return Array.from(allTweets.values()).map((tweet) => ({
      date: today,
      source: 'x' as const,
      category: 'news' as const,
      title: stripTags(tweet.snippet.slice(0, 120)) ?? 'Claude Code on X',
      url: tweet.url,
      author: tweet.author,
      excerpt: stripTags(tweet.snippet.slice(0, 300)),
      thumbnailUrl: null,
      engagementScore: 0,
      rawMetrics: {},
      fetchedAt: now,
      createdAt: now,
    }))
  } catch (error) {
    console.error('[twitter] Fetch failed:', error)
    return []
  }
}

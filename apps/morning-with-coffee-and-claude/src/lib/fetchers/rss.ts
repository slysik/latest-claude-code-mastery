import type { FetchedItem } from '@/lib/types'
import { stripTags } from '@/lib/sanitize'
import Parser from 'rss-parser'

const SUBSTACK_FEEDS = [
  'https://mays.co/feed',
  'https://creatoreconomy.so/feed',
]

const parser = new Parser()

async function parseFeedWithTimeout(feedUrl: string): Promise<Parser.Output<Parser.Item>> {
  return Promise.race([
    parser.parseURL(feedUrl),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('RSS timeout')), 8_000),
    ),
  ])
}

function matchesClaude(text: string): boolean {
  const lower = text.toLowerCase()
  return lower.includes('claude') || lower.includes('claude code')
}

export async function fetchRss(): Promise<FetchedItem[]> {
  try {
    const results: FetchedItem[] = []
    const now = new Date().toISOString()

    for (const feedUrl of SUBSTACK_FEEDS) {
      try {
        const feed = await parseFeedWithTimeout(feedUrl)

        for (const item of feed.items ?? []) {
          const title = item.title ?? ''
          const content = item.contentSnippet ?? item.content ?? ''

          // Filter for Claude-related content
          if (!matchesClaude(title) && !matchesClaude(content)) {
            continue
          }

          const pubDate = item.pubDate ? new Date(item.pubDate) : new Date()

          results.push({
            date: pubDate.toISOString().split('T')[0],
            source: 'substack' as const,
            category: 'news' as const,
            title: stripTags(title) ?? title,
            url: item.link ?? feedUrl,
            author: stripTags(item.creator ?? null),
            excerpt: stripTags(content.slice(0, 300) || null),
            thumbnailUrl: null,
            engagementScore: 0,
            rawMetrics: {},
            fetchedAt: now,
            createdAt: pubDate.toISOString(),
          })
        }
      } catch (error) {
        console.error(`[rss] Failed to parse ${feedUrl}:`, error)
        // Continue to next feed
      }
    }

    return results
  } catch (error) {
    console.error('[rss] Fetch failed:', error)
    return []
  }
}

import type { FetchedItem } from '@/lib/types'
import { stripTags } from '@/lib/sanitize'

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY ?? ''

interface FirecrawlResponse {
  success?: boolean
  data?: {
    markdown?: string
    metadata?: {
      title?: string
      description?: string
    }
  }
}

export async function fetchTwitter(): Promise<FetchedItem[]> {
  if (!FIRECRAWL_API_KEY) {
    return []
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8_000)

    const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify({
        url: 'https://x.com/search?q=Claude+Code&f=live',
        formats: ['markdown'],
      }),
    })

    clearTimeout(timeout)

    if (!res.ok) {
      console.error(`[twitter] Firecrawl HTTP ${res.status}`)
      return []
    }

    const data: FirecrawlResponse = await res.json()
    if (!data.success || !data.data?.markdown) {
      return []
    }

    const now = new Date().toISOString()
    const today = now.split('T')[0]

    // Parse whatever we can from the scraped markdown
    // X's anti-bot measures mean this often fails — that's fine
    const content = data.data.markdown
    if (!content || content.length < 100) {
      return []
    }

    return [
      {
        date: today,
        source: 'x' as const,
        category: 'news' as const,
        title: stripTags('Claude Code discussion on X') ?? 'Claude Code on X',
        url: 'https://x.com/search?q=Claude+Code',
        author: null,
        excerpt: stripTags(content.slice(0, 300)),
        thumbnailUrl: null,
        engagementScore: 0,
        rawMetrics: {},
        fetchedAt: now,
        createdAt: now,
      },
    ]
  } catch (error) {
    console.error('[twitter] Fetch failed:', error)
    return []
  }
}

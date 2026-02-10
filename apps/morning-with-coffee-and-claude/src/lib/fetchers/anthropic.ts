import type { FetchedItem } from '@/lib/types'
import { stripTags } from '@/lib/sanitize'
import { load } from 'cheerio'

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY ?? ''

const ANTHROPIC_URLS = [
  { url: 'https://docs.anthropic.com/en/changelog', category: 'feature' as const },
  { url: 'https://www.anthropic.com/news', category: 'news' as const },
]

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

async function scrapeWithFirecrawl(
  url: string,
  signal: AbortSignal,
): Promise<{ title: string; description: string; content: string } | null> {
  const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    cache: 'no-store',
    signal,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
    },
    body: JSON.stringify({ url, formats: ['markdown'] }),
  })

  if (!res.ok) {
    console.error(`[anthropic] Firecrawl HTTP ${res.status} for ${url}`)
    return null
  }

  const data: FirecrawlResponse = await res.json()
  if (!data.success || !data.data) return null

  return {
    title: data.data.metadata?.title ?? '',
    description: data.data.metadata?.description ?? '',
    content: data.data.markdown ?? '',
  }
}

async function scrapeWithCheerio(
  url: string,
  signal: AbortSignal,
): Promise<{ title: string; description: string; content: string } | null> {
  const res = await fetch(url, {
    cache: 'no-store',
    signal,
    headers: {
      'User-Agent': 'morning-coffee-claude/1.0',
    },
  })

  if (!res.ok) {
    console.error(`[anthropic] HTTP ${res.status} for ${url}`)
    return null
  }

  const html = await res.text()
  const $ = load(html)

  const title = $('title').first().text().trim()
  const description =
    $('meta[name="description"]').attr('content')?.trim() ??
    $('meta[property="og:description"]').attr('content')?.trim() ??
    ''

  // Extract article content from common selectors
  const contentSelectors = [
    'article',
    '[role="main"]',
    'main',
    '.content',
    '.post-content',
    '.entry-content',
  ]

  let content = ''
  for (const selector of contentSelectors) {
    const el = $(selector).first()
    if (el.length) {
      content = el.text().trim()
      break
    }
  }

  if (!content) {
    content = $('body').text().trim().slice(0, 2000)
  }

  return { title, description, content }
}

function parseContentToItems(
  content: string,
  sourceUrl: string,
  category: 'news' | 'feature',
  pageTitle: string,
  pageDescription: string,
): FetchedItem[] {
  const now = new Date().toISOString()
  const today = now.split('T')[0]

  return [
    {
      date: today,
      source: 'anthropic' as const,
      category,
      title: stripTags(pageTitle) ?? 'Anthropic Update',
      url: sourceUrl,
      author: null,
      excerpt: stripTags(pageDescription || content.slice(0, 300)),
      thumbnailUrl: null,
      engagementScore: 0,
      rawMetrics: {},
      fetchedAt: now,
      createdAt: now,
    },
  ]
}

export async function fetchAnthropic(): Promise<FetchedItem[]> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8_000)
    const results: FetchedItem[] = []

    const scrape = FIRECRAWL_API_KEY ? scrapeWithFirecrawl : scrapeWithCheerio

    for (const { url, category } of ANTHROPIC_URLS) {
      const data = await scrape(url, controller.signal)
      if (data) {
        const items = parseContentToItems(
          data.content,
          url,
          category,
          data.title,
          data.description,
        )
        results.push(...items)
      }
    }

    clearTimeout(timeout)
    return results
  } catch (error) {
    console.error('[anthropic] Fetch failed:', error)
    return []
  }
}

import type { FetchedItem } from '@/lib/types'
import { stripTags } from '@/lib/sanitize'

const SEARCH_QUERIES = [
  'Claude Code',
  'Claude Code hooks',
  'Claude Code plugins',
  'Claude Code tutorial',
]

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY ?? ''

interface YouTubeSearchItem {
  id: { videoId: string }
  snippet: {
    title: string
    description: string
    channelTitle: string
    publishedAt: string
    thumbnails: {
      high?: { url: string }
      medium?: { url: string }
      default?: { url: string }
    }
  }
}

interface YouTubeSearchResponse {
  items?: YouTubeSearchItem[]
  error?: { errors?: Array<{ reason?: string }> }
}

interface YouTubeStatsItem {
  id: string
  statistics: {
    viewCount?: string
    likeCount?: string
    commentCount?: string
  }
}

interface YouTubeStatsResponse {
  items?: YouTubeStatsItem[]
}

export async function fetchYouTube(): Promise<FetchedItem[]> {
  if (!YOUTUBE_API_KEY) {
    console.error('[youtube] No YOUTUBE_API_KEY set, skipping')
    return []
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8_000)

    const allItems: YouTubeSearchItem[] = []

    // Fetch search results for each query
    for (const query of SEARCH_QUERIES) {
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}`
      const res = await fetch(searchUrl, { cache: 'no-store', signal: controller.signal })
      const data: YouTubeSearchResponse = await res.json()

      if (data.error?.errors?.some((e) => e.reason === 'quotaExceeded')) {
        console.error('[youtube] Quota exceeded, returning what we have')
        clearTimeout(timeout)
        break
      }

      if (data.items) {
        allItems.push(...data.items)
      }
    }

    // Deduplicate by video ID
    const uniqueMap = new Map<string, YouTubeSearchItem>()
    for (const item of allItems) {
      if (!uniqueMap.has(item.id.videoId)) {
        uniqueMap.set(item.id.videoId, item)
      }
    }
    const uniqueItems = Array.from(uniqueMap.values())

    if (uniqueItems.length === 0) {
      clearTimeout(timeout)
      return []
    }

    // Fetch statistics in batch
    const videoIds = uniqueItems.map((item) => item.id.videoId).join(',')
    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    const statsRes = await fetch(statsUrl, { cache: 'no-store', signal: controller.signal })
    const statsData: YouTubeStatsResponse = await statsRes.json()

    const statsMap = new Map<string, YouTubeStatsItem>()
    if (statsData.items) {
      for (const stat of statsData.items) {
        statsMap.set(stat.id, stat)
      }
    }

    clearTimeout(timeout)
    const now = new Date().toISOString()

    return uniqueItems.map((item) => {
      const stats = statsMap.get(item.id.videoId)
      const views = parseInt(stats?.statistics?.viewCount ?? '0', 10)
      const likes = parseInt(stats?.statistics?.likeCount ?? '0', 10)
      const comments = parseInt(stats?.statistics?.commentCount ?? '0', 10)
      const thumbnail =
        item.snippet.thumbnails.high?.url ??
        item.snippet.thumbnails.medium?.url ??
        item.snippet.thumbnails.default?.url ??
        null

      return {
        date: item.snippet.publishedAt.split('T')[0],
        source: 'youtube' as const,
        category: 'video' as const,
        title: stripTags(item.snippet.title) ?? item.snippet.title,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        author: stripTags(item.snippet.channelTitle),
        excerpt: stripTags(item.snippet.description?.slice(0, 300) || null),
        thumbnailUrl: thumbnail,
        engagementScore: 0,
        rawMetrics: { views, likes, comments },
        fetchedAt: now,
        createdAt: item.snippet.publishedAt,
      }
    })
  } catch (error) {
    console.error('[youtube] Fetch failed:', error)
    return []
  }
}

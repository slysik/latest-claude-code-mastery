import { NextRequest } from 'next/server'
import {
  fetchReddit,
  fetchYouTube,
  fetchGitHub,
  fetchAnthropic,
  fetchTwitter,
  fetchRss,
} from '@/lib/fetchers'
import { classifyItems } from '@/lib/sentiment'
import { generateSummary } from '@/lib/summarizer'
import { rankItems } from '@/lib/ranker'
import { deduplicateItems } from '@/lib/deduper'
import {
  runPipelineTransaction,
  getSentimentSnapshot,
  upsertEcosystemEntries,
  pruneOldData,
} from '@/lib/db'
import type { FetchedItem, EcosystemEntry } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    // 1. Validate CRON_SECRET exists
    if (!process.env.CRON_SECRET) {
      console.error('CRON_SECRET not configured')
      return Response.json(
        { error: 'Server Configuration Error' },
        { status: 500 },
      )
    }

    // 2. Validate auth
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 3. Idempotency check (skip if ?force=true)
    const forceRun = request.nextUrl.searchParams.get('force') === 'true'
    const today = new Date().toISOString().split('T')[0]

    if (!forceRun) {
      const existing = await getSentimentSnapshot(today)
      if (existing) {
        return Response.json({
          message: 'Already aggregated today',
          date: today,
        })
      }
    }

    // 4. Fetch from all 6 sources in parallel
    const results = await Promise.allSettled([
      fetchReddit(),
      fetchYouTube(),
      fetchGitHub(),
      fetchAnthropic(),
      fetchTwitter(),
      fetchRss(),
    ])

    const sourceNames = [
      'reddit',
      'youtube',
      'github',
      'anthropic',
      'twitter',
      'rss',
    ]
    const allItems: FetchedItem[] = []
    const sourceCounts: Record<string, number> = {}
    const errors: string[] = []

    results.forEach((result, i) => {
      const name = sourceNames[i]
      if (result.status === 'fulfilled') {
        sourceCounts[name] = result.value.length
        allItems.push(...result.value)
      } else {
        sourceCounts[name] = 0
        errors.push(`${name}: ${result.reason?.message ?? 'Unknown error'}`)
        console.error(`Fetcher ${name} failed:`, result.reason)
      }
    })

    // 5. Dedup + rank
    const deduped = deduplicateItems(allItems)
    const ranked = rankItems(deduped)

    // 6. Classify sentiment
    const classified = await classifyItems(ranked)

    // 7. Generate summary
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split('T')[0]
    const prevSnapshot = await getSentimentSnapshot(yesterday)
    const summary = await generateSummary(
      classified.slice(0, 15),
      prevSnapshot?.summary,
    )

    // 8. Calculate sentiment percentages
    const withSentiment = classified.filter((i) => i.sentiment !== null)
    const sampleSize = withSentiment.length
    const posCount = withSentiment.filter(
      (i) => i.sentiment === 'positive',
    ).length
    const neuCount = withSentiment.filter(
      (i) => i.sentiment === 'neutral',
    ).length
    const negCount = withSentiment.filter(
      (i) => i.sentiment === 'negative',
    ).length
    const positivePct =
      sampleSize > 0 ? Math.round((posCount / sampleSize) * 100) : 0
    const neutralPct =
      sampleSize > 0 ? Math.round((neuCount / sampleSize) * 100) : 0
    const negativePct =
      sampleSize > 0 ? Math.round((negCount / sampleSize) * 100) : 0

    // Find top positive and negative items
    const topPositive = withSentiment
      .filter((i) => i.sentiment === 'positive')
      .sort((a, b) => b.engagementScore - a.engagementScore)[0]
    const topNegative = withSentiment
      .filter((i) => i.sentiment === 'negative')
      .sort((a, b) => b.engagementScore - a.engagementScore)[0]

    // 9. Transactional write
    await runPipelineTransaction(classified, {
      date: today,
      positivePct,
      neutralPct,
      negativePct,
      sampleSize,
      topPositiveUrl: topPositive?.url ?? null,
      topNegativeUrl: topNegative?.url ?? null,
      summary,
    })

    // 10. Ecosystem population from GitHub plugin results
    const pluginItems = classified.filter(
      (i) => i.source === 'github' && i.category === 'plugin',
    )
    if (pluginItems.length > 0) {
      const ecosystemEntries: EcosystemEntry[] = pluginItems.map((item) => ({
        name: item.title,
        type: 'plugin' as const,
        author: item.author,
        description: item.excerpt,
        githubUrl: item.url,
        stars: item.rawMetrics.stars ?? 0,
        lastUpdated: item.createdAt,
        categoryTags: [],
        mentionCount: 0,
      }))
      await upsertEcosystemEntries(ecosystemEntries)
    }

    // 11. Data retention
    const pruned = await pruneOldData(90, 365)

    const durationMs = Date.now() - startTime
    if (durationMs > 8000) {
      console.warn(
        `Pipeline took ${durationMs}ms — approaching timeout limit`,
      )
    }

    return Response.json({
      success: true,
      date: today,
      sources: sourceCounts,
      totalItems: classified.length,
      sentimentClassified: sampleSize,
      summaryGenerated: !!summary,
      ecosystemEntries: pluginItems.length,
      pruned,
      durationMs,
      errors,
    })
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Pipeline failed:', error.stack ?? error.message)
    return Response.json(
      {
        error: 'Pipeline failed',
        message: error.message,
        durationMs: Date.now() - startTime,
      },
      { status: 500 },
    )
  }
}

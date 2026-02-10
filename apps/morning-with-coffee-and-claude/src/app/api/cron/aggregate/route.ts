import { NextRequest } from 'next/server'
import {
  fetchReddit,
  fetchYouTube,
  fetchGitHub,
  fetchAnthropic,
  fetchTwitter,
  fetchRss,
  fetchHackerNews,
  fetchAwesomeLists,
  fetchAgentConfigs,
} from '@/lib/fetchers'
import { fetchReleasesRaw } from '@/lib/fetchers/github'
import { classifyChangelogs } from '@/lib/changelog-classifier'
import { classifyItems } from '@/lib/sentiment'
import { generateSummary } from '@/lib/summarizer'
import { rankItems } from '@/lib/ranker'
import { deduplicateItems } from '@/lib/deduper'
import {
  runPipelineTransaction,
  getSentimentSnapshot,
  upsertEcosystemEntries,
  upsertChangelogHighlights,
  upsertReviewTelemetry,
  pruneOldData,
} from '@/lib/db'
import { fetchReviewTelemetry } from '@/lib/fetchers/review-telemetry'
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

    // 4. Fetch from all 7 sources in parallel (+ ecosystem from awesome lists)
    const [itemResults, awesomeResult, agentConfigResult] = await Promise.all([
      Promise.allSettled([
        fetchReddit(),
        fetchYouTube(),
        fetchGitHub(),
        fetchAnthropic(),
        fetchTwitter(),
        fetchRss(),
        fetchHackerNews(),
      ]),
      fetchAwesomeLists().catch((err) => {
        console.error('[awesome] Failed:', err)
        return []
      }),
      fetchAgentConfigs().catch((err) => {
        console.error('[agent-configs] Failed:', err)
        return []
      }),
    ])

    const results = itemResults
    const sourceNames = [
      'reddit',
      'youtube',
      'github',
      'anthropic',
      'twitter',
      'rss',
      'hackernews',
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

    // 6b. Changelog analysis
    const rawReleases = await fetchReleasesRaw()
    const changelogHighlights = await classifyChangelogs(rawReleases.slice(0, 3))
    if (changelogHighlights.length > 0) {
      await upsertChangelogHighlights(changelogHighlights)
    }

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

    // 10. Ecosystem population from awesome lists + GitHub plugin results
    const allEcosystemEntries: EcosystemEntry[] = [...awesomeResult, ...agentConfigResult]

    // Also include GitHub trending repos classified as plugins
    const pluginItems = classified.filter(
      (i) => i.source === 'github' && i.category === 'plugin',
    )
    for (const item of pluginItems) {
      // Skip if already in awesome list results (by URL)
      if (allEcosystemEntries.some((e) => e.githubUrl === item.url)) continue
      allEcosystemEntries.push({
        name: item.title,
        type: 'plugin' as const,
        author: item.author,
        description: item.excerpt,
        githubUrl: item.url,
        stars: item.rawMetrics.stars ?? 0,
        lastUpdated: item.createdAt,
        categoryTags: [],
        mentionCount: 0,
        agentMeta: null,
      })
    }

    if (allEcosystemEntries.length > 0) {
      await upsertEcosystemEntries(allEcosystemEntries)
    }

    // 10b. Review telemetry
    const telemetryEntries = await fetchReviewTelemetry()
    if (telemetryEntries.length > 0) {
      await upsertReviewTelemetry(telemetryEntries)
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
      ecosystemEntries: allEcosystemEntries.length,
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

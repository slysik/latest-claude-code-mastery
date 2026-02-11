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
import { generateSummary, generateBriefingTldr } from '@/lib/summarizer'
import { rankItems } from '@/lib/ranker'
import { deduplicateItems } from '@/lib/deduper'
import {
  runPipelineTransaction,
  getBriefing,
  getSentimentSnapshot,
  upsertEcosystemEntries,
  upsertChangelogHighlights,
  upsertReviewTelemetry,
  pruneOldData,
} from '@/lib/db'
import { fetchReviewTelemetry } from '@/lib/fetchers/review-telemetry'
import type { FetchedItem, EcosystemEntry, BriefingSlot, BriefingTldr } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// ---------------------------------------------------------------------------
// Slot helpers
// ---------------------------------------------------------------------------

function getCurrentSlot(): BriefingSlot {
  const hour = new Date().getUTCHours()
  if (hour >= 10 && hour < 16) return 'morning'
  if (hour >= 16 && hour < 22) return 'midday'
  return 'evening'
}

function getEditorialDate(slot: BriefingSlot): string {
  const now = new Date()
  if (slot === 'evening' && now.getUTCHours() < 6) {
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    return yesterday.toISOString().split('T')[0]
  }
  return now.toISOString().split('T')[0]
}

// ---------------------------------------------------------------------------
// Fetcher-to-slot mapping
// ---------------------------------------------------------------------------

const SLOT_ITEM_FETCHERS: Record<BriefingSlot, (() => Promise<FetchedItem[]>)[]> = {
  morning: [fetchAnthropic, fetchGitHub, fetchRss, fetchHackerNews],
  midday:  [fetchGitHub],
  evening: [fetchReddit, fetchTwitter, fetchYouTube, fetchHackerNews],
}

const SLOT_ITEM_FETCHER_NAMES: Record<BriefingSlot, string[]> = {
  morning: ['anthropic', 'github', 'rss', 'hackernews'],
  midday:  ['github'],
  evening: ['reddit', 'twitter', 'youtube', 'hackernews'],
}

const SLOT_ECOSYSTEM_FETCHERS: Record<BriefingSlot, boolean> = {
  morning: false,
  midday: true,
  evening: false,
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

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

    // 3. Detect slot (allow override via query param)
    const slotParam = request.nextUrl.searchParams.get('slot')
    const validSlots: BriefingSlot[] = ['morning', 'midday', 'evening']
    const slot: BriefingSlot = slotParam && validSlots.includes(slotParam as BriefingSlot)
      ? (slotParam as BriefingSlot)
      : getCurrentSlot()

    const editorialDate = getEditorialDate(slot)
    const runAt = new Date().toISOString()

    // 4. Idempotency check (skip if ?force=true)
    const forceRun = request.nextUrl.searchParams.get('force') === 'true'
    if (!forceRun) {
      const existing = await getBriefing(editorialDate, slot)
      if (existing) {
        return Response.json({
          skipped: true,
          message: `Already ran ${slot} briefing for ${editorialDate}`,
          slot,
          editorialDate,
        })
      }
    }

    // 5. Fetch from slot-specific sources
    const fetchers = SLOT_ITEM_FETCHERS[slot]
    const fetcherNames = SLOT_ITEM_FETCHER_NAMES[slot]
    const fetcherStatus: Record<string, string> = {}

    const itemResults = await Promise.allSettled(fetchers.map((fn) => fn()))

    const allItems: FetchedItem[] = []
    const sourceCounts: Record<string, number> = {}
    const errors: string[] = []

    itemResults.forEach((result, i) => {
      const name = fetcherNames[i]
      if (result.status === 'fulfilled') {
        sourceCounts[name] = result.value.length
        fetcherStatus[name] = 'ok'
        allItems.push(...result.value)
      } else {
        sourceCounts[name] = 0
        fetcherStatus[name] = `error:${result.reason?.message ?? 'Unknown'}`
        errors.push(`${name}: ${result.reason?.message ?? 'Unknown error'}`)
        console.error(`Fetcher ${name} failed:`, result.reason)
      }
    })

    // 5b. Ecosystem fetchers (midday only)
    let ecosystemCount = 0
    if (SLOT_ECOSYSTEM_FETCHERS[slot]) {
      const [awesomeResult, agentConfigResult] = await Promise.all([
        fetchAwesomeLists().catch((err) => {
          console.error('[awesome] Failed:', err)
          fetcherStatus['awesome'] = `error:${err.message}`
          return [] as EcosystemEntry[]
        }),
        fetchAgentConfigs().catch((err) => {
          console.error('[agent-configs] Failed:', err)
          fetcherStatus['agent-configs'] = `error:${err.message}`
          return [] as EcosystemEntry[]
        }),
      ])

      const allEcosystemEntries: EcosystemEntry[] = [...awesomeResult, ...agentConfigResult]
      fetcherStatus['awesome'] = fetcherStatus['awesome'] ?? 'ok'
      fetcherStatus['agent-configs'] = fetcherStatus['agent-configs'] ?? 'ok'

      ecosystemCount = allEcosystemEntries.length

      if (allEcosystemEntries.length > 0) {
        await upsertEcosystemEntries(allEcosystemEntries)
      }
    }

    // 6. Dedup + rank
    const deduped = deduplicateItems(allItems)
    const ranked = rankItems(deduped)

    // 7. Classify sentiment
    const classified = await classifyItems(ranked)

    // 7b. Changelog analysis
    const rawReleases = await fetchReleasesRaw()
    const changelogHighlights = await classifyChangelogs(rawReleases.slice(0, 3))
    if (changelogHighlights.length > 0) {
      await upsertChangelogHighlights(changelogHighlights)
    }

    // 7c. Ecosystem enrichment from classified items (midday only)
    if (SLOT_ECOSYSTEM_FETCHERS[slot]) {
      const pluginItems = classified.filter(
        (i) => i.source === 'github' && i.category === 'plugin',
      )
      const pluginEcosystemEntries: EcosystemEntry[] = pluginItems.map((item) => ({
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
      }))
      if (pluginEcosystemEntries.length > 0) {
        await upsertEcosystemEntries(pluginEcosystemEntries)
        ecosystemCount += pluginEcosystemEntries.length
      }
    }

    // 8. Generate summary (keep existing editorial summary)
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split('T')[0]
    const prevSnapshot = await getSentimentSnapshot(yesterday)
    const summary = await generateSummary(
      classified.slice(0, 15),
      prevSnapshot?.summary,
    )

    // 9. Calculate sentiment percentages
    const withSentiment = classified.filter((i) => i.sentiment !== null)
    const sampleSize = withSentiment.length
    const posCount = withSentiment.filter((i) => i.sentiment === 'positive').length
    const neuCount = withSentiment.filter((i) => i.sentiment === 'neutral').length
    const negCount = withSentiment.filter((i) => i.sentiment === 'negative').length
    const positivePct = sampleSize > 0 ? Math.round((posCount / sampleSize) * 100) : 0
    const neutralPct = sampleSize > 0 ? Math.round((neuCount / sampleSize) * 100) : 0
    const negativePct = sampleSize > 0 ? Math.round((negCount / sampleSize) * 100) : 0

    const topPositive = withSentiment
      .filter((i) => i.sentiment === 'positive')
      .sort((a, b) => b.engagementScore - a.engagementScore)[0]
    const topNegative = withSentiment
      .filter((i) => i.sentiment === 'negative')
      .sort((a, b) => b.engagementScore - a.engagementScore)[0]

    // 10. Generate TL;DR (best-effort — items are more valuable than summaries)
    let tldr: BriefingTldr = { facts: [], tryToday: null, insight: null }
    try {
      tldr = await generateBriefingTldr(slot, classified)
    } catch (err) {
      console.error('[tldr] Generation failed, proceeding without TL;DR:', err)
    }

    // 11. Transactional write (items + sentiment + briefing — atomic)
    // Only write to sentiment_daily during evening slot (sentinel date for others)
    const snapshotInput = {
      date: editorialDate,
      positivePct,
      neutralPct,
      negativePct,
      sampleSize,
      topPositiveUrl: topPositive?.url ?? null,
      topNegativeUrl: topNegative?.url ?? null,
      summary,
    }

    await runPipelineTransaction(
      classified,
      slot === 'evening' ? snapshotInput : {
        ...snapshotInput,
        date: `${editorialDate}-${slot}`,
      },
      {
        slot,
        date: editorialDate,
        runAt,
        tldr,
        itemCount: classified.length,
        fetcherStatus,
      },
    )

    // 11b. Review telemetry
    const telemetryEntries = await fetchReviewTelemetry()
    if (telemetryEntries.length > 0) {
      await upsertReviewTelemetry(telemetryEntries)
    }

    // 12. Data retention
    const pruned = await pruneOldData(90, 365)

    const durationMs = Date.now() - startTime
    if (durationMs > 8000) {
      console.warn(`Pipeline took ${durationMs}ms — approaching timeout limit`)
    }

    return Response.json({
      success: true,
      slot,
      editorialDate,
      date: editorialDate,
      sources: sourceCounts,
      totalItems: classified.length,
      sentimentClassified: sampleSize,
      summaryGenerated: !!summary,
      tldrGenerated: tldr.facts.length > 0,
      ecosystemEntries: ecosystemCount,
      fetcherStatus,
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

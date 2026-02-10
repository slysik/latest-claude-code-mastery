import { NextRequest } from 'next/server'
import {
  getLatestItems,
  getSentimentSnapshot,
  getEcosystemEntries,
} from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Auth required
  if (!process.env.CRON_SECRET) {
    return Response.json(
      { error: 'Server Configuration Error' },
      { status: 500 },
    )
  }
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const today = new Date().toISOString().split('T')[0]

    // Query Turso for latest data — check connectivity and status
    const [items, sentiment, ecosystem] = await Promise.all([
      getLatestItems(today, 5),
      getSentimentSnapshot(today),
      getEcosystemEntries(),
    ])

    // Build per-source counts from today's items
    const sourceCounts: Record<string, number> = {}
    for (const item of items) {
      sourceCounts[item.source] = (sourceCounts[item.source] ?? 0) + 1
    }

    return Response.json({
      tursoConnected: true,
      lastAggregation: sentiment ? today : null,
      hasSummary: !!sentiment?.summary,
      sampleSize: sentiment?.sampleSize ?? 0,
      ecosystemEntries: ecosystem.length,
      sources: sourceCounts,
      itemsSampled: items.length,
    })
  } catch (err) {
    return Response.json(
      { tursoConnected: false, error: (err as Error).message },
      { status: 200 },
    )
  }
}

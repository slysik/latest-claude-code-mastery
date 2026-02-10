import { NextRequest } from 'next/server'
import { upsertReviewTelemetry } from '@/lib/db'
import { parseReviewMarkdown } from '@/lib/review-parser'
import type { ReviewTelemetryEntry } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Validate auth
    if (!process.env.CRON_SECRET) {
      return Response.json({ error: 'Server Configuration Error' }, { status: 500 })
    }

    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    if (!Array.isArray(body)) {
      return Response.json({ error: 'Expected array of entries' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const entries: ReviewTelemetryEntry[] = []

    for (const raw of body) {
      if (!raw.plan_id || !raw.review_id || !raw.model_name) continue

      const parsed = raw.raw_markdown
        ? parseReviewMarkdown(raw.raw_markdown)
        : { criticalIssues: 0, improvements: 0, suggestions: 0, strengths: 0, verdict: null, confidenceScore: null }

      entries.push({
        date: raw.timestamp ? raw.timestamp.split('T')[0] : now.split('T')[0],
        planId: raw.plan_id,
        reviewId: raw.review_id,
        modelName: raw.model_name,
        reviewType: raw.review_type ?? 'unknown',
        criticalIssues: raw.critical_issues ?? parsed.criticalIssues,
        improvements: raw.improvements ?? parsed.improvements,
        suggestions: raw.suggestions ?? parsed.suggestions,
        strengths: raw.strengths ?? parsed.strengths,
        verdict: raw.verdict ?? parsed.verdict,
        confidenceScore: raw.confidence_score ?? parsed.confidenceScore,
        durationMs: raw.duration_ms ?? null,
        fetchedAt: now,
      })
    }

    if (entries.length > 0) {
      await upsertReviewTelemetry(entries)
    }

    return Response.json({
      success: true,
      processed: entries.length,
    })
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('[telemetry] POST failed:', error.message)
    return Response.json({ error: 'Processing failed', message: error.message }, { status: 500 })
  }
}

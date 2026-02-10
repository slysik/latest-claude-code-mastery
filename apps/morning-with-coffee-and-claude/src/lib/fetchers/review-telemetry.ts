import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { parseReviewMarkdown } from '@/lib/review-parser'
import type { ReviewTelemetryEntry } from '@/lib/types'

const TELEMETRY_PATH =
  process.env.REVIEW_TELEMETRY_PATH ?? '../../logs/review_telemetry.jsonl'

interface RawTelemetryLine {
  plan_id?: string
  review_id?: string
  model_name?: string
  review_type?: string
  duration_ms?: number
  raw_markdown?: string
  timestamp?: string
}

export async function fetchReviewTelemetry(): Promise<ReviewTelemetryEntry[]> {
  try {
    if (!existsSync(TELEMETRY_PATH)) {
      console.log('[review-telemetry] No telemetry file found at', TELEMETRY_PATH)
      return []
    }

    const content = await readFile(TELEMETRY_PATH, 'utf-8')
    const lines = content.trim().split('\n').filter(Boolean)
    const entries: ReviewTelemetryEntry[] = []
    const now = new Date().toISOString()

    for (const line of lines) {
      try {
        const raw: RawTelemetryLine = JSON.parse(line)
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
          criticalIssues: parsed.criticalIssues,
          improvements: parsed.improvements,
          suggestions: parsed.suggestions,
          strengths: parsed.strengths,
          verdict: parsed.verdict,
          confidenceScore: parsed.confidenceScore,
          durationMs: raw.duration_ms ?? null,
          fetchedAt: now,
        })
      } catch {
        // Skip malformed lines
      }
    }

    console.log(`[review-telemetry] Parsed ${entries.length} entries from JSONL`)
    return entries
  } catch (error) {
    console.error('[review-telemetry] Failed to read telemetry:', error)
    return []
  }
}

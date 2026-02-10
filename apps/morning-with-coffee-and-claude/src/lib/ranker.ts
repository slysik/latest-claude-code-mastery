import type { FetchedItem } from '@/lib/types'

/**
 * Score = (normalized_engagement x 0.6) + (recency_score x 0.4)
 *
 * Engagement: normalized to 0-1 by dividing each item's max raw metric by the
 * global max across all items.
 *
 * Recency: exponential decay with 24h half-life: Math.exp(-hoursAgo / 24)
 */
export function rankItems(items: FetchedItem[]): FetchedItem[] {
  if (items.length === 0) return []

  const now = Date.now()

  // Find peak engagement across all items
  function getEngagement(item: FetchedItem): number {
    const values = Object.values(item.rawMetrics)
    if (values.length === 0) return 0
    return Math.max(...values)
  }

  const maxEngagement = Math.max(...items.map(getEngagement), 1)

  const scored = items.map((item) => {
    const normalizedEngagement = getEngagement(item) / maxEngagement
    const hoursAgo = (now - new Date(item.createdAt).getTime()) / (1000 * 60 * 60)
    const recencyScore = Math.exp(-hoursAgo / 24)

    const score = normalizedEngagement * 0.6 + recencyScore * 0.4

    return {
      ...item,
      engagementScore: Math.round(score * 1000) / 1000, // 3 decimal places
    }
  })

  // Sort descending by score
  scored.sort((a, b) => b.engagementScore - a.engagementScore)

  return scored
}

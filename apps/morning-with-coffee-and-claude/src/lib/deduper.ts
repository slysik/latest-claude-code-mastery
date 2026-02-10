import type { FetchedItem } from '@/lib/types'

/**
 * Two-pass deduplication:
 * 1. Group by URL — keep highest-scored per URL
 * 2. Normalize titles (lowercase, strip punctuation, first 10 words) —
 *    if two items share a normalized title, keep higher-scored
 */
export function deduplicateItems(items: FetchedItem[]): FetchedItem[] {
  if (items.length === 0) return []

  // Pass 1: Deduplicate by URL
  const byUrl = new Map<string, FetchedItem>()
  for (const item of items) {
    const existing = byUrl.get(item.url)
    if (!existing || item.engagementScore > existing.engagementScore) {
      byUrl.set(item.url, item)
    }
  }

  // Pass 2: Deduplicate by normalized title
  const byTitle = new Map<string, FetchedItem>()
  for (const item of byUrl.values()) {
    const normalizedTitle = normalizeTitle(item.title)
    const existing = byTitle.get(normalizedTitle)
    if (!existing || item.engagementScore > existing.engagementScore) {
      byTitle.set(normalizedTitle, item)
    }
  }

  return Array.from(byTitle.values())
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // strip punctuation
    .split(/\s+/)
    .slice(0, 10)
    .join(' ')
    .trim()
}

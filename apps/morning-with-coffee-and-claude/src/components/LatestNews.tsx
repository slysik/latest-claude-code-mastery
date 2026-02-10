'use client'

import { useState, useMemo } from 'react'
import type { ClassifiedItem } from '@/lib/types'
import { Badge } from './ui/Badge'
import SentimentBadge from './SentimentBadge'
import FilterChips from './FilterChips'

interface LatestNewsProps {
  items: ClassifiedItem[]
}

function relativeTime(isoDate: string): string {
  const now = Date.now()
  const then = new Date(isoDate).getTime()
  const diffMs = now - then
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

export default function LatestNews({ items }: LatestNewsProps) {
  const sources = useMemo(() => {
    const unique = Array.from(new Set(items.map((i) => i.source)))
    return ['All', ...unique]
  }, [items])

  const [selectedFilter, setSelectedFilter] = useState('All')

  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="font-body text-anthropic-dark/60 italic">
          No headlines yet — check back after the morning edition.
        </p>
      </div>
    )
  }

  const filtered =
    selectedFilter === 'All'
      ? items
      : items.filter((i) => i.source === selectedFilter)

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-h3 text-anthropic-dark">Headlines</h2>
      <FilterChips
        options={sources}
        selected={selectedFilter}
        onChange={setSelectedFilter}
      />
      <ul className="space-y-3" role="list">
        {filtered.map((item) => (
          <li key={item.url} className="flex items-start gap-2">
            <span className="text-anthropic-mid-gray mt-1 shrink-0" aria-hidden="true">&bull;</span>
            <div className="min-w-0 flex-1">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-small text-anthropic-dark hover:text-anthropic-blue transition-colors"
              >
                {item.title}
              </a>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge>{item.source}</Badge>
                <span className="text-xs text-anthropic-mid-gray">
                  {relativeTime(item.createdAt)}
                </span>
                {item.sentiment !== null && (
                  <SentimentBadge sentiment={item.sentiment} />
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

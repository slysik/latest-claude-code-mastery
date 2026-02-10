'use client'

import { useState, useMemo } from 'react'
import type { EcosystemEntry } from '@/lib/types'
import { Badge } from './ui/Badge'
import FilterChips from './FilterChips'

interface EcosystemGridProps {
  entries: EcosystemEntry[]
}

const typeVariants: Record<EcosystemEntry['type'], NonNullable<'default' | 'orange' | 'blue' | 'green'>> = {
  hook: 'orange',
  plugin: 'blue',
  skill: 'green',
  mcp_server: 'default',
  agent_config: 'orange',
}

function freshness(dateStr: string | null): string {
  if (!dateStr) return ''
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffDays = Math.floor((now - then) / (1000 * 60 * 60 * 24))
  if (diffDays < 7) return 'Updated this week'
  if (diffDays < 30) return 'Updated this month'
  if (diffDays < 90) return 'Updated recently'
  return 'Older'
}

export default function EcosystemGrid({ entries }: EcosystemGridProps) {
  const categories = useMemo(() => {
    const types = Array.from(new Set(entries.map((e) => e.type)))
    return ['All', ...types]
  }, [entries])

  const [selectedCategory, setSelectedCategory] = useState('All')

  if (entries.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="font-body text-anthropic-dark/60 italic">
          The ecosystem directory is being populated.
        </p>
      </div>
    )
  }

  const PER_CATEGORY_LIMIT = 10

  const filtered =
    selectedCategory === 'All'
      ? entries.slice(0, PER_CATEGORY_LIMIT * categories.length)
      : entries.filter((e) => e.type === selectedCategory).slice(0, PER_CATEGORY_LIMIT)

  return (
    <div className="space-y-6">
      <FilterChips
        options={categories}
        selected={selectedCategory}
        onChange={setSelectedCategory}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((entry, idx) => (
          <div
            key={entry.githubUrl ?? `${entry.name}-${idx}`}
            className="bg-anthropic-light-gray/30 border border-anthropic-light-gray rounded-lg p-5 flex flex-col gap-3"
          >
            <div className="flex items-center gap-2">
              <Badge variant={typeVariants[entry.type]}>{entry.type.replace('_', ' ')}</Badge>
            </div>
            <div>
              {entry.githubUrl ? (
                <a
                  href={entry.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-heading text-small font-semibold text-anthropic-dark hover:text-anthropic-blue transition-colors"
                >
                  {entry.name}
                </a>
              ) : (
                <span className="font-heading text-small font-semibold text-anthropic-dark">
                  {entry.name}
                </span>
              )}
              {entry.author && (
                <p className="font-body text-xs text-anthropic-mid-gray mt-0.5">
                  by {entry.author}
                </p>
              )}
            </div>
            {entry.description && (
              <p className="font-body text-xs text-anthropic-dark/70 line-clamp-2">
                {entry.description}
              </p>
            )}
            {entry.agentMeta && (
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="orange">{entry.agentMeta.configType}</Badge>
                {entry.agentMeta.modelTier && (
                  <Badge variant="default">{entry.agentMeta.modelTier}</Badge>
                )}
                {entry.agentMeta.toolRestrictions && entry.agentMeta.toolRestrictions.length > 0 && (
                  <Badge variant="default">
                    {entry.agentMeta.toolRestrictions.length} tools
                  </Badge>
                )}
              </div>
            )}
            <div className="flex items-center gap-3 mt-auto text-xs text-anthropic-mid-gray">
              {entry.stars > 0 && (
                <span className="flex items-center gap-1">
                  <span aria-hidden="true">&#9733;</span>
                  {entry.stars.toLocaleString()}
                </span>
              )}
              {entry.lastUpdated && (
                <span>{freshness(entry.lastUpdated)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import type { Briefing } from '@/lib/types'
import BriefingBadge from './BriefingBadge'
import TldrSection from './TldrSection'
import { SectionErrorFallback } from './SectionErrorFallback'
import LatestNews from './LatestNews'
import DiffOfTheDay from './DiffOfTheDay'
import SentimentGauge from './SentimentGauge'
import EcosystemGrid from './EcosystemGrid'
import PatternOfTheDay from './PatternOfTheDay'
import YouTubeCarousel from './YouTubeCarousel'
import ModelMixMonitor from './ModelMixMonitor'
import TopTips from './TopTips'

function renderSection(fn: () => React.ReactNode) {
  try {
    return fn()
  } catch {
    return <SectionErrorFallback />
  }
}

const SLOT_ACCENT: Record<string, string> = {
  morning: 'border-l-amber-400',
  midday: 'border-l-sky-400',
  evening: 'border-l-indigo-400',
}

interface BriefingCardProps {
  briefing: Briefing
  defaultExpanded?: boolean
}

export default function BriefingCard({ briefing, defaultExpanded = false }: BriefingCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  const timestamp = new Date(briefing.runAt).toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  })

  // Derive section data from briefing items
  const news = briefing.items.filter(
    (i) => i.category === 'news' || i.category === 'feature',
  )
  const videos = briefing.items
    .filter((i) => i.category === 'video')
    .sort((a, b) => (b.rawMetrics.likes ?? 0) - (a.rawMetrics.likes ?? 0))
    .slice(0, 10)
  const tips = briefing.items.filter(
    (i) => i.isTip && (i.tipConfidence ?? 0) > 0.8,
  )

  return (
    <article
      className={`bg-white border border-anthropic-light-gray rounded-lg border-l-4 ${SLOT_ACCENT[briefing.slot]} shadow-sm`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <BriefingBadge slot={briefing.slot} />
          <span className="font-body text-xs text-anthropic-mid-gray">
            {timestamp}
          </span>
        </div>
        <span className="font-body text-xs text-anthropic-mid-gray/70">
          {briefing.itemCount} items
        </span>
      </div>

      {/* TL;DR — always visible */}
      <div className="px-5">
        <TldrSection tldr={briefing.tldr} />
      </div>

      {/* Expand/Collapse toggle */}
      <div className="px-5 pb-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs font-medium text-anthropic-mid-gray hover:text-anthropic-dark transition-colors"
        >
          <span className={`transition-transform ${expanded ? 'rotate-90' : ''}`}>
            ▶
          </span>
          {expanded ? 'Hide details' : 'Show details'}
        </button>
      </div>

      {/* Detail sections — collapsible */}
      {expanded && (
        <div className="border-t border-anthropic-light-gray px-5 py-6 space-y-8">
          {/* Morning sections */}
          {briefing.slot === 'morning' && (
            <>
              {news.length > 0 && renderSection(() => (
                <LatestNews items={news} />
              ))}
              {briefing.changelog.length > 0 && renderSection(() => (
                <DiffOfTheDay changelog={briefing.changelog} />
              ))}
              {tips.length > 0 && renderSection(() => (
                <TopTips tips={tips} />
              ))}
            </>
          )}

          {/* Mid-day sections */}
          {briefing.slot === 'midday' && (
            <>
              {briefing.ecosystem.length > 0 && renderSection(() => (
                <EcosystemGrid entries={briefing.ecosystem} />
              ))}
              {briefing.patternOfTheDay && renderSection(() => (
                <PatternOfTheDay pattern={briefing.patternOfTheDay} />
              ))}
              {briefing.reviewTelemetry && renderSection(() => (
                <ModelMixMonitor telemetry={briefing.reviewTelemetry} />
              ))}
            </>
          )}

          {/* Evening sections */}
          {briefing.slot === 'evening' && (
            <>
              {news.length > 0 && renderSection(() => (
                <LatestNews items={news} />
              ))}
              {briefing.sentiment && renderSection(() => (
                <SentimentGauge
                  sentiment={briefing.sentiment}
                  history={[]}
                />
              ))}
              {videos.length > 0 && renderSection(() => (
                <YouTubeCarousel videos={videos} />
              ))}
            </>
          )}

          {/* Source links */}
          {briefing.items.length > 0 && (
            <div className="border-t border-anthropic-light-gray pt-4">
              <p className="font-heading text-anthropic-mid-gray text-xs uppercase tracking-[0.2em] mb-2">
                Sources
              </p>
              <div className="flex flex-wrap gap-2">
                {briefing.items.slice(0, 10).map((item) => (
                  <a
                    key={item.url}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-anthropic-orange hover:text-anthropic-dark underline underline-offset-2 transition-colors truncate max-w-[200px]"
                    title={item.title}
                  >
                    {item.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  )
}

import type { DashboardData } from '@/lib/types'
import { SectionErrorFallback } from './SectionErrorFallback'
import PulseSummary from './PulseSummary'
import LatestNews from './LatestNews'
import NewFeatures from './NewFeatures'
import SentimentGauge from './SentimentGauge'
import EcosystemGrid from './EcosystemGrid'
import YouTubeCarousel from './YouTubeCarousel'
import TopTips from './TopTips'

function renderSection(fn: () => React.ReactNode) {
  try {
    return fn()
  } catch {
    return <SectionErrorFallback />
  }
}

export default function DashboardLayout({ data }: { data: DashboardData }) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Derive section data
  const news = data.items.filter(
    (i) => i.category === 'news' || i.category === 'feature'
  )
  const releases = data.items.filter(
    (i) => i.source === 'github' && i.category === 'feature'
  )
  const tips = data.items.filter(
    (i) => i.isTip && (i.tipConfidence ?? 0) > 0.8
  )
  const videos = data.items.filter((i) => i.category === 'video')

  // Staleness check
  const isStale = data.lastUpdated
    ? Date.now() - new Date(data.lastUpdated).getTime() > 36 * 60 * 60 * 1000
    : true
  const neverUpdated = data.lastUpdated === null

  return (
    <main className="max-w-5xl mx-auto px-6 md:px-12 py-8">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="font-heading text-display text-anthropic-dark">
          Morning with Coffee &amp; Claude
        </h1>
        <p className="font-body text-anthropic-mid-gray mt-2">{today}</p>
      </header>

      {/* Staleness warning */}
      {isStale && (
        <div className="bg-anthropic-orange/10 border border-anthropic-orange/30 rounded-lg p-4 mb-8 text-center font-body text-sm text-anthropic-dark/70">
          {neverUpdated
            ? 'First edition coming soon \u2014 data pipeline has not run yet.'
            : `Last updated ${new Date(data.lastUpdated!).toLocaleDateString()} \u2014 pipeline may need attention.`}
        </div>
      )}

      {/* Section 1: Editorial */}
      {renderSection(() => (
        <PulseSummary summary={data.sentiment?.summary ?? ''} date={today} />
      ))}

      {/* Section divider + Headlines and Changelog */}
      <div className="border-t-2 border-anthropic-light-gray pt-12 mt-12">
        <p className="font-heading text-anthropic-mid-gray text-xs uppercase tracking-[0.2em] mb-6">
          ABOVE THE FOLD
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {renderSection(() => (
            <LatestNews items={news} />
          ))}
          {renderSection(() => (
            <NewFeatures releases={releases} />
          ))}
        </div>
      </div>

      {/* Section divider + Community Mood */}
      <div className="border-t-2 border-anthropic-light-gray pt-12 mt-12">
        <p className="font-heading text-anthropic-mid-gray text-xs uppercase tracking-[0.2em] mb-6">
          THE COMMUNITY
        </p>
        {renderSection(() => (
          <SentimentGauge
            sentiment={data.sentiment}
            history={data.sentimentHistory}
          />
        ))}
      </div>

      {/* Section divider + Ecosystem */}
      <div className="border-t-2 border-anthropic-light-gray pt-12 mt-12">
        <p className="font-heading text-anthropic-mid-gray text-xs uppercase tracking-[0.2em] mb-6">
          WHAT TO TRY
        </p>
        {renderSection(() => (
          <EcosystemGrid entries={data.ecosystem} />
        ))}
      </div>

      {/* Section divider + YouTube */}
      <div className="border-t-2 border-anthropic-light-gray pt-12 mt-12">
        <p className="font-heading text-anthropic-mid-gray text-xs uppercase tracking-[0.2em] mb-6">
          WATCH &amp; LEARN
        </p>
        {renderSection(() => (
          <YouTubeCarousel videos={videos} />
        ))}
      </div>

      {/* Section divider + Tips */}
      <div className="border-t-2 border-anthropic-light-gray pt-12 mt-12">
        <p className="font-heading text-anthropic-mid-gray text-xs uppercase tracking-[0.2em] mb-6">
          TIPS OF THE DAY
        </p>
        {renderSection(() => (
          <TopTips tips={tips} />
        ))}
      </div>

      {/* Footer */}
      <footer className="text-center font-body text-anthropic-mid-gray text-sm py-12 border-t border-anthropic-light-gray mt-16">
        <p>Morning with Coffee &amp; Claude &middot; Updated daily at 12:00 PM UTC</p>
        <p className="mt-1">
          Sources: Reddit &middot; YouTube &middot; GitHub &middot; Anthropic &middot; X &middot; Substack
        </p>
        <p className="mt-1">Curated by AI &middot; Built with Next.js + Claude Haiku</p>
      </footer>
    </main>
  )
}

import type { TimelineData, Briefing, BriefingSlot } from '@/lib/types'
import BriefingCard from './BriefingCard'

const SLOT_LABELS: Record<BriefingSlot, string> = {
  morning: 'Morning — 7 AM ET',
  midday: 'Mid-day — 1 PM ET',
  evening: 'Evening — 7 PM ET',
}

interface TimelineFeedProps {
  data: TimelineData
}

export default function TimelineFeed({ data }: TimelineFeedProps) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Group briefings by date
  const groupedByDate = new Map<string, Briefing[]>()
  for (const briefing of data.briefings) {
    const existing = groupedByDate.get(briefing.date) ?? []
    existing.push(briefing)
    groupedByDate.set(briefing.date, existing)
  }

  const dateGroups = Array.from(groupedByDate.entries())

  // Find the most recent briefing for default-expanded
  const newestBriefingId = data.briefings[0]?.id

  return (
    <main className="max-w-5xl mx-auto px-6 md:px-12 py-8">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="font-heading text-display text-anthropic-dark">
          Morning with Coffee &amp; Claude
        </h1>
        <p className="font-body text-anthropic-mid-gray mt-2">{today}</p>
        {data.lastUpdated && (
          <p className="font-body text-xs text-anthropic-mid-gray/70 mt-1">
            Last updated: {new Date(data.lastUpdated).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
              timeZoneName: 'short',
            })}
          </p>
        )}
      </header>

      {/* Upcoming slots */}
      {data.upcomingSlots.length > 0 && (
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {data.upcomingSlots.map((upcoming) => (
            <div
              key={upcoming.slot}
              className="bg-anthropic-light-gray/30 border border-dashed border-anthropic-light-gray rounded-lg px-4 py-2 text-center"
            >
              <p className="font-body text-xs text-anthropic-mid-gray/70">
                {SLOT_LABELS[upcoming.slot]}
              </p>
              <p className="font-body text-xs text-anthropic-mid-gray/50 mt-0.5">
                coming up
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Timeline */}
      {dateGroups.length > 0 ? (
        <div className="space-y-10">
          {dateGroups.map(([date, briefings]) => {
            const formattedDate = new Date(date + 'T12:00:00Z').toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })

            return (
              <section key={date}>
                {/* Date separator */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px flex-1 bg-anthropic-light-gray" />
                  <h2 className="font-heading text-sm font-medium text-anthropic-mid-gray whitespace-nowrap">
                    {formattedDate}
                  </h2>
                  <div className="h-px flex-1 bg-anthropic-light-gray" />
                </div>

                {/* Briefing cards with connector */}
                <div className="relative pl-6 space-y-4">
                  {/* Vertical connector line */}
                  {briefings.length > 1 && (
                    <div className="absolute left-2 top-4 bottom-4 w-px bg-anthropic-light-gray" />
                  )}

                  {briefings.map((briefing) => (
                    <div key={briefing.id} className="relative">
                      {/* Connector dot */}
                      {briefings.length > 1 && (
                        <div className="absolute -left-6 top-5 w-3 h-3 rounded-full border-2 border-anthropic-light-gray bg-white z-10" />
                      )}
                      <BriefingCard
                        briefing={briefing}
                        defaultExpanded={briefing.id === newestBriefingId}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      ) : (
        /* Empty state */
        <div className="bg-anthropic-light-gray/30 border border-anthropic-light-gray rounded-lg p-12 text-center">
          <p className="font-heading text-lg text-anthropic-dark mb-2">
            Your timeline is brewing
          </p>
          <p className="font-body text-sm text-anthropic-mid-gray">
            Briefings will appear here after the pipeline runs.
            Check back after the next scheduled run.
          </p>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center font-body text-anthropic-mid-gray text-sm py-12 border-t border-anthropic-light-gray mt-16">
        <p>Morning with Coffee &amp; Claude &middot; Updated 3&times; daily</p>
        <p className="mt-1">
          Morning 7 AM &middot; Mid-day 1 PM &middot; Evening 7 PM (US Eastern)
        </p>
        <p className="mt-1">
          Sources: Reddit &middot; YouTube &middot; GitHub &middot; Anthropic &middot; X &middot; Substack &middot; Hacker News
        </p>
        <p className="mt-1">Curated by AI &middot; Built with Next.js + Claude Haiku</p>
      </footer>
    </main>
  )
}

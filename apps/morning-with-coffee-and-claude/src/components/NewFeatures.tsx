import type { FetchedItem } from '@/lib/types'
import { Badge } from './ui/Badge'

interface NewFeaturesProps {
  releases: FetchedItem[]
}

export default function NewFeatures({ releases }: NewFeaturesProps) {
  if (releases.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="font-body text-anthropic-mid-gray italic">
          No recent releases to report.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-h3 text-anthropic-dark">Changelog</h2>
      <div className="space-y-4">
        {releases.map((release) => {
          const isBreaking =
            release.title.toLowerCase().includes('breaking') ||
            (release.excerpt?.toLowerCase().includes('breaking') ?? false)
          const dateStr = new Date(release.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })

          return (
            <div
              key={release.url}
              className={`border-l-4 rounded-lg p-4 ${
                isBreaking
                  ? 'border-l-anthropic-orange bg-anthropic-orange/5'
                  : 'border-l-anthropic-light-gray bg-anthropic-light-gray/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={isBreaking ? 'orange' : 'default'}>
                  {dateStr}
                </Badge>
                {isBreaking && (
                  <Badge variant="orange">Breaking</Badge>
                )}
              </div>
              <a
                href={release.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-heading text-small font-medium text-anthropic-dark hover:text-anthropic-blue transition-colors"
              >
                {release.title}
              </a>
              {release.excerpt && (
                <ul className="mt-2 space-y-1">
                  {release.excerpt.split('\n').filter(Boolean).slice(0, 4).map((line, i) => (
                    <li
                      key={i}
                      className="font-body text-xs text-anthropic-dark/70 flex items-start gap-2"
                    >
                      <span className="text-anthropic-mid-gray mt-0.5" aria-hidden="true">&bull;</span>
                      <span>{line.replace(/^[-*]\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

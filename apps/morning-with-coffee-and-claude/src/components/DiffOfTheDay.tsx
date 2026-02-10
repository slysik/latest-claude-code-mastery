import type { ChangelogHighlight } from '@/lib/types'
import { Badge } from './ui/Badge'

interface DiffOfTheDayProps {
  changelog: ChangelogHighlight[]
}

export default function DiffOfTheDay({ changelog }: DiffOfTheDayProps) {
  if (changelog.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="font-body text-anthropic-dark/60 italic">
          No recent release analysis available.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {changelog.map((entry) => {
        const hasBreaking = entry.breakingChanges.length > 0

        return (
          <div
            key={entry.releaseTag}
            className={`border-l-4 rounded-lg p-5 ${
              hasBreaking
                ? 'border-l-anthropic-orange bg-anthropic-orange/5'
                : 'border-l-anthropic-blue bg-anthropic-light-gray/30'
            } border border-anthropic-light-gray`}
          >
            <div className="flex items-center gap-2 mb-3">
              <a
                href={entry.releaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-heading text-body font-semibold text-anthropic-dark hover:text-anthropic-blue transition-colors"
              >
                {entry.releaseTag}
              </a>
              <span className="font-body text-xs text-anthropic-mid-gray">
                {new Date(entry.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            {entry.highlights.length > 0 && (
              <ul className="space-y-1 mb-3">
                {entry.highlights.map((h, i) => (
                  <li
                    key={i}
                    className="font-body text-sm text-anthropic-dark/80 flex items-start gap-2"
                  >
                    <span className="text-anthropic-mid-gray mt-0.5" aria-hidden="true">
                      &bull;
                    </span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            )}

            {hasBreaking && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {entry.breakingChanges.map((bc, i) => (
                  <Badge key={i} variant="orange">
                    {bc}
                  </Badge>
                ))}
              </div>
            )}

            {entry.hookRelevance.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="font-body text-xs text-anthropic-mid-gray mr-1">
                  Affects your hooks:
                </span>
                {entry.hookRelevance.map((hook) => (
                  <Badge key={hook} variant="blue">
                    {hook}
                  </Badge>
                ))}
              </div>
            )}

            {entry.diffStats && (
              <p className="font-body text-xs text-anthropic-mid-gray">
                {entry.diffStats.filesChanged} files changed &middot;{' '}
                <span className="text-green-600">+{entry.diffStats.additions}</span>{' '}
                <span className="text-red-500">-{entry.diffStats.deletions}</span>
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

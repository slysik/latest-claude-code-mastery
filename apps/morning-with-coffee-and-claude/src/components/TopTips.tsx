import type { ClassifiedItem } from '@/lib/types'

interface TopTipsProps {
  tips: ClassifiedItem[]
}

export default function TopTips({ tips }: TopTipsProps) {
  if (tips.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="font-body text-anthropic-mid-gray italic">
          Tips will be curated from the community after the first edition.
        </p>
      </div>
    )
  }

  const displayTips = tips.slice(0, 5)

  return (
    <div className="space-y-4">
      {displayTips.map((tip) => (
        <div
          key={tip.url}
          className="border-l-4 border-anthropic-orange/40 bg-anthropic-light-gray/30 border border-l-anthropic-orange/40 border-anthropic-light-gray rounded-lg p-6"
        >
          <p className="font-body text-body text-anthropic-dark mb-3">
            <span className="mr-2" aria-hidden="true">💡</span>
            {tip.oneLineQuote ?? tip.excerpt}
          </p>
          <div className="flex items-center gap-2 text-xs text-anthropic-mid-gray">
            {tip.author && (
              <span className="font-body">{tip.author}</span>
            )}
            {tip.author && <span aria-hidden="true">&middot;</span>}
            <span className="font-body capitalize">{tip.source}</span>
            <span aria-hidden="true">&middot;</span>
            <a
              href={tip.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-anthropic-blue hover:underline"
            >
              Source
            </a>
          </div>
        </div>
      ))}
    </div>
  )
}

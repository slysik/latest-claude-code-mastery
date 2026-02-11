import type { BriefingTldr } from '@/lib/types'
import { renderMarkdown } from '@/lib/render-markdown'

interface TldrSectionProps {
  tldr: BriefingTldr
}

export default function TldrSection({ tldr }: TldrSectionProps) {
  if (tldr.facts.length === 0 && !tldr.tryToday && !tldr.insight) {
    return (
      <div className="py-3">
        <p className="font-body text-sm text-anthropic-dark/50 italic">
          Summary being prepared...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 py-3">
      {/* Facts */}
      {tldr.facts.length > 0 && (
        <ul className="space-y-1.5">
          {tldr.facts.map((fact, i) => (
            <li key={i} className="flex gap-2 font-body text-sm text-anthropic-dark leading-relaxed">
              <span className="text-anthropic-mid-gray mt-0.5 shrink-0">•</span>
              <span>{renderMarkdown(fact)}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Try Today */}
      {tldr.tryToday && (
        <div className="flex gap-2 bg-anthropic-orange/5 border border-anthropic-orange/20 rounded-lg px-4 py-3">
          <span className="shrink-0 mt-0.5">🧪</span>
          <div>
            <p className="font-heading text-xs font-medium text-anthropic-orange uppercase tracking-wide mb-1">
              Try today
            </p>
            <p className="font-body text-sm text-anthropic-dark leading-relaxed">
              {renderMarkdown(tldr.tryToday)}
            </p>
          </div>
        </div>
      )}

      {/* Insight */}
      {tldr.insight && (
        <div className="flex gap-2 bg-anthropic-blue/5 border border-anthropic-blue/20 rounded-lg px-4 py-3">
          <span className="shrink-0 mt-0.5">💡</span>
          <div>
            <p className="font-heading text-xs font-medium text-anthropic-blue uppercase tracking-wide mb-1">
              Insight
            </p>
            <p className="font-body text-sm text-anthropic-dark leading-relaxed italic">
              {renderMarkdown(tldr.insight)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

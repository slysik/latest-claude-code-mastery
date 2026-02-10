import type { ClassifiedItem } from '@/lib/types'
import { Badge } from './ui/Badge'

const patternLabels: Record<string, string> = {
  workflow: 'Workflow',
  context_strategy: 'Context Strategy',
  model_mix: 'Model Mix',
  hook_pattern: 'Hook Pattern',
}

interface PatternOfTheDayProps {
  pattern: ClassifiedItem | null
}

export default function PatternOfTheDay({ pattern }: PatternOfTheDayProps) {
  if (!pattern) {
    return (
      <div className="py-12 text-center">
        <p className="font-body text-anthropic-dark/60 italic">
          No patterns detected today.
        </p>
      </div>
    )
  }

  const steps = pattern.patternRecipe
    ?.split('\n')
    .map((s) => s.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean) ?? []

  return (
    <div className="border-l-4 border-anthropic-blue/40 bg-anthropic-light-gray/30 border border-l-anthropic-blue/40 border-anthropic-light-gray rounded-lg p-6">
      <div className="flex items-center gap-2 mb-3">
        {pattern.patternType && (
          <Badge variant="blue">
            {patternLabels[pattern.patternType] ?? pattern.patternType}
          </Badge>
        )}
      </div>
      <a
        href={pattern.url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-heading text-body font-semibold text-anthropic-dark hover:text-anthropic-blue transition-colors"
      >
        {pattern.title}
      </a>
      {steps.length > 0 && (
        <ol className="mt-3 space-y-1.5 list-decimal list-inside">
          {steps.map((step, i) => (
            <li
              key={i}
              className="font-body text-sm text-anthropic-dark/80"
            >
              {step}
            </li>
          ))}
        </ol>
      )}
      <div className="flex items-center gap-2 text-xs text-anthropic-mid-gray mt-3">
        {pattern.author && (
          <span className="font-body">{pattern.author}</span>
        )}
        {pattern.author && <span aria-hidden="true">&middot;</span>}
        <span className="font-body capitalize">{pattern.source}</span>
      </div>
    </div>
  )
}

'use client'

import type { ReviewTelemetrySummary } from '@/lib/types'
import { Badge } from './ui/Badge'

interface ModelMixMonitorProps {
  telemetry: ReviewTelemetrySummary | null
}

const modelColors: Record<string, NonNullable<'default' | 'orange' | 'blue' | 'green'>> = {
  'llama3.2:3b': 'green',
  'codex-mini-latest': 'blue',
  'gemini-2.5-flash': 'orange',
}

function getModelVariant(name: string): NonNullable<'default' | 'orange' | 'blue' | 'green'> {
  if (modelColors[name]) return modelColors[name]
  if (name.includes('llama') || name.includes('ollama')) return 'green'
  if (name.includes('codex') || name.includes('gpt')) return 'blue'
  if (name.includes('gemini')) return 'orange'
  return 'default'
}

export default function ModelMixMonitor({ telemetry }: ModelMixMonitorProps) {
  if (!telemetry) {
    return (
      <div className="py-12 text-center">
        <p className="font-body text-anthropic-dark/60 italic">
          No review telemetry available. Run <code className="bg-anthropic-light-gray/50 px-1.5 py-0.5 rounded text-xs">/plan_w_team</code> to generate data.
        </p>
      </div>
    )
  }

  const recentReviews = telemetry.recentReviews.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Model Performance Table */}
      {telemetry.byModel.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-anthropic-light-gray">
                <th className="font-heading text-left py-2 text-anthropic-dark/70 text-xs uppercase tracking-wider">Model</th>
                <th className="font-heading text-right py-2 text-anthropic-dark/70 text-xs uppercase tracking-wider">Reviews</th>
                <th className="font-heading text-right py-2 text-anthropic-dark/70 text-xs uppercase tracking-wider">Avg Critical</th>
                <th className="font-heading text-right py-2 text-anthropic-dark/70 text-xs uppercase tracking-wider">Avg Improvements</th>
              </tr>
            </thead>
            <tbody>
              {telemetry.byModel.map((model) => (
                <tr
                  key={model.modelName}
                  className="border-b border-anthropic-light-gray/50"
                >
                  <td className="py-2.5">
                    <Badge variant={getModelVariant(model.modelName)}>
                      {model.modelName}
                    </Badge>
                  </td>
                  <td className="font-body text-right py-2.5 text-anthropic-dark">
                    {model.reviewCount}
                  </td>
                  <td className="font-body text-right py-2.5 text-anthropic-dark">
                    {model.avgCriticalIssues}
                  </td>
                  <td className="font-body text-right py-2.5 text-anthropic-dark">
                    {model.avgImprovements}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Recent Reviews */}
      {recentReviews.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-heading text-xs uppercase tracking-wider text-anthropic-dark/70">
            Recent Reviews
          </h3>
          {recentReviews.map((review) => (
            <div
              key={`${review.planId}-${review.reviewId}`}
              className="bg-anthropic-light-gray/30 border border-anthropic-light-gray rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Badge variant={getModelVariant(review.modelName)}>
                  {review.modelName}
                </Badge>
                <span className="font-body text-xs text-anthropic-mid-gray">
                  {review.reviewId}
                </span>
                <span className="font-body text-xs text-anthropic-mid-gray">
                  &middot; {review.reviewType}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                {review.criticalIssues > 0 && (
                  <span className="font-body text-anthropic-orange">
                    {review.criticalIssues} critical
                  </span>
                )}
                {review.improvements > 0 && (
                  <span className="font-body text-anthropic-blue">
                    {review.improvements} improvements
                  </span>
                )}
                {review.verdict && (
                  <Badge variant="default">{review.verdict}</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="font-body text-xs text-anthropic-mid-gray text-center">
        {telemetry.totalReviews} total reviews across {telemetry.byModel.length} models
      </p>
    </div>
  )
}

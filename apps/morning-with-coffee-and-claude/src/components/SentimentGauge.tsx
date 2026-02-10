import type { SentimentDailySnapshot } from '@/lib/types'
import { Sparkline } from './ui/Sparkline'

interface SentimentGaugeProps {
  sentiment: SentimentDailySnapshot | null
  history: SentimentDailySnapshot[]
}

function getMoodEmoji(positivePct: number): string {
  if (positivePct > 60) return '\u{1F60A}' // 😊
  if (positivePct >= 40) return '\u{1F610}' // 😐
  return '\u{1F61F}' // 😟
}

export default function SentimentGauge({ sentiment, history }: SentimentGaugeProps) {
  if (!sentiment) {
    return (
      <div className="py-12 text-center">
        <p className="font-body text-anthropic-mid-gray italic">
          Sentiment analysis will appear after the first edition.
        </p>
      </div>
    )
  }

  const { positivePct, neutralPct, negativePct, topPositive, topNegative } = sentiment
  const sparklineData = history.map((s) => s.positivePct)

  const quotes: Array<{ text: string; sentiment: 'positive' | 'negative' }> = []
  if (topPositive?.oneLineQuote) {
    quotes.push({ text: topPositive.oneLineQuote, sentiment: 'positive' })
  }
  if (topNegative?.oneLineQuote) {
    quotes.push({ text: topNegative.oneLineQuote, sentiment: 'negative' })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left: Gauge and bar */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <span
            className="font-heading text-display text-anthropic-dark"
            aria-label={`${Math.round(positivePct)}% positive sentiment`}
          >
            {Math.round(positivePct)}%
          </span>
          <span className="text-3xl" aria-hidden="true">{getMoodEmoji(positivePct)}</span>
          <div className="ml-auto">
            <Sparkline data={sparklineData} width={140} height={36} />
          </div>
        </div>

        {/* Stacked bar */}
        <div className="space-y-2">
          <div
            className="flex h-3 rounded-full overflow-hidden"
            role="img"
            aria-label={`Sentiment breakdown: ${Math.round(positivePct)}% positive, ${Math.round(neutralPct)}% neutral, ${Math.round(negativePct)}% negative`}
          >
            <div
              className="bg-anthropic-green transition-all"
              style={{ width: `${positivePct}%` }}
            />
            <div
              className="bg-anthropic-mid-gray/40 transition-all"
              style={{ width: `${neutralPct}%` }}
            />
            <div
              className="bg-anthropic-orange transition-all"
              style={{ width: `${negativePct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs font-body text-anthropic-mid-gray">
            <span>Positive {Math.round(positivePct)}%</span>
            <span>Neutral {Math.round(neutralPct)}%</span>
            <span>Negative {Math.round(negativePct)}%</span>
          </div>
        </div>

        <p className="font-body text-xs text-anthropic-mid-gray">
          Based on {sentiment.sampleSize} items analyzed
        </p>
      </div>

      {/* Right: Representative quotes */}
      <div className="space-y-4">
        <h3 className="font-heading text-h3 text-anthropic-dark">What people are saying</h3>
        {quotes.length === 0 ? (
          <p className="font-body text-small text-anthropic-mid-gray italic">
            No representative quotes available yet.
          </p>
        ) : (
          quotes.map((q, i) => (
            <blockquote
              key={i}
              className={`border-l-4 pl-4 py-2 font-body text-small text-anthropic-dark/80 italic ${
                q.sentiment === 'positive'
                  ? 'border-l-anthropic-green'
                  : 'border-l-anthropic-orange'
              }`}
            >
              &ldquo;{q.text}&rdquo;
            </blockquote>
          ))
        )}
      </div>
    </div>
  )
}

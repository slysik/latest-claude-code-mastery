interface SentimentBadgeProps {
  sentiment: 'positive' | 'neutral' | 'negative'
}

const sentimentStyles: Record<SentimentBadgeProps['sentiment'], string> = {
  positive: 'bg-anthropic-green/10 text-anthropic-green',
  neutral: 'bg-anthropic-mid-gray/10 text-anthropic-mid-gray',
  negative: 'bg-anthropic-orange/10 text-anthropic-orange',
}

const sentimentLabels: Record<SentimentBadgeProps['sentiment'], string> = {
  positive: 'Positive',
  neutral: 'Neutral',
  negative: 'Negative',
}

export default function SentimentBadge({ sentiment }: SentimentBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${sentimentStyles[sentiment]}`}
    >
      {sentimentLabels[sentiment]}
    </span>
  )
}

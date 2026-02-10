interface PulseSummaryProps {
  summary: string
  date: string
}

export default function PulseSummary({ summary, date }: PulseSummaryProps) {
  if (!summary) {
    return (
      <div className="bg-anthropic-light-gray/30 border border-anthropic-light-gray rounded-lg p-8 max-w-[65ch] mx-auto text-center">
        <p className="font-body text-anthropic-mid-gray italic">
          Your morning briefing will appear after the first edition runs.
        </p>
      </div>
    )
  }

  return (
    <section className="bg-anthropic-light-gray/30 border border-anthropic-light-gray rounded-lg p-8 max-w-[65ch] mx-auto">
      <p className="font-body text-small text-anthropic-mid-gray mb-4 text-center">{date}</p>
      <p className="font-body text-body text-anthropic-dark leading-relaxed text-center">
        {summary}
      </p>
    </section>
  )
}

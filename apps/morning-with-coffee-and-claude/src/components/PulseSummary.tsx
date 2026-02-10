interface PulseSummaryProps {
  summary: string
  date: string
}

/**
 * Render markdown-style links [text](url) and backtick code as HTML.
 */
function renderMarkdown(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  const pattern = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)|`([^`]+)`/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }

    if (match[1] && match[2]) {
      nodes.push(
        <a
          key={match.index}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-anthropic-orange hover:text-anthropic-dark underline underline-offset-2 transition-colors"
        >
          {match[1]}
        </a>
      )
    } else if (match[3]) {
      nodes.push(
        <code
          key={match.index}
          className="bg-anthropic-light-gray px-1.5 py-0.5 rounded text-sm font-mono"
        >
          {match[3]}
        </code>
      )
    }

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes
}

export default function PulseSummary({ summary, date }: PulseSummaryProps) {
  if (!summary) {
    return (
      <div className="bg-anthropic-light-gray/30 border border-anthropic-light-gray rounded-lg p-8 max-w-[65ch] mx-auto text-center">
        <p className="font-body text-anthropic-dark/60 italic">
          Your morning briefing will appear after the first edition runs.
        </p>
      </div>
    )
  }

  return (
    <section className="bg-anthropic-light-gray/30 border border-anthropic-light-gray rounded-lg p-8 max-w-[65ch] mx-auto">
      <p className="font-body text-small text-anthropic-mid-gray mb-4 text-center">{date}</p>
      <p className="font-body text-body text-anthropic-dark leading-relaxed text-center">
        {renderMarkdown(summary)}
      </p>
    </section>
  )
}

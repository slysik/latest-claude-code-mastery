/**
 * Render markdown-style links [text](url) and backtick code as React elements.
 * Uses JSX (not raw HTML) — XSS is prevented by React's built-in escaping.
 */
export function renderMarkdown(text: string): React.ReactNode[] {
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

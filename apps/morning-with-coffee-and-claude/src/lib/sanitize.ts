import { load } from 'cheerio'

/**
 * Strip HTML tags and decode entities for display normalization.
 * NOT a security boundary — React's JSX auto-escaping prevents XSS.
 * Uses Cheerio's .text() for robust parsing (handles malformed HTML,
 * nested tags, encoded entities like AT&T correctly).
 */
export function stripTags(input: string | null): string | null {
  if (!input) return null
  return load(input).text().trim()
}

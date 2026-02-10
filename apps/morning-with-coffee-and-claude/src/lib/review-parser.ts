export interface ParsedReview {
  criticalIssues: number
  improvements: number
  suggestions: number
  strengths: number
  verdict: string | null
  confidenceScore: number | null
}

function countBullets(markdown: string, headingPattern: RegExp): number {
  const lines = markdown.split('\n')
  let inSection = false
  let count = 0

  for (const line of lines) {
    if (headingPattern.test(line)) {
      inSection = true
      continue
    }
    if (inSection && /^#{1,4}\s/.test(line)) {
      inSection = false
      continue
    }
    if (inSection && /^[-*]\s/.test(line.trim())) {
      count++
    }
  }

  return count
}

export function parseReviewMarkdown(markdown: string): ParsedReview {
  const criticalIssues = countBullets(markdown, /^###?\s.*(?:Critical|MUST fix)/i)
  const improvements = countBullets(markdown, /^###?\s.*(?:Improvement|SHOULD fix|Hardening|Simplification)/i)
  const suggestions = countBullets(markdown, /^###?\s.*(?:Suggestion|NICE to have)/i)
  const strengths = countBullets(markdown, /^###?\s.*(?:Strength|DO NOT change|Already)/i)

  // Extract verdict
  let verdict: string | null = null
  const verdictMatch = markdown.match(/(?:VERDICT|Quality Gate)[:\s]*(\w[\w\s]*)/i)
  if (verdictMatch) {
    verdict = verdictMatch[1].trim()
  }

  // Extract confidence score
  let confidenceScore: number | null = null
  const confMatch = markdown.match(/Confidence\s*Score[:\s]*(\d+(?:\.\d+)?)/i)
  if (confMatch) {
    confidenceScore = parseFloat(confMatch[1])
  }

  return { criticalIssues, improvements, suggestions, strengths, verdict, confidenceScore }
}

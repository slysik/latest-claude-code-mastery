import Anthropic from '@anthropic-ai/sdk'
import type { ChangelogHighlight } from './types'
import { fetchCompareStats } from './fetchers/github'
import type { RawRelease } from './fetchers/github'

const MAX_RETRIES = 2
const RETRY_DELAY = 2000

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function parseJsonResponse(text: string): unknown | null {
  const stripped = text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')

  try {
    return JSON.parse(stripped)
  } catch {
    return null
  }
}

export async function classifyChangelogs(
  releases: RawRelease[],
): Promise<ChangelogHighlight[]> {
  if (releases.length === 0) return []

  const client = new Anthropic()
  const results: ChangelogHighlight[] = []
  const now = new Date().toISOString()

  // Process sequentially (max 3)
  for (const release of releases.slice(0, 3)) {
    const body = release.body.slice(0, 3000) // Limit body size

    const prompt = `Analyze this Claude Code release and extract structured data.

Release: ${release.tagName}
Body:
${body}

Return ONLY a JSON object (no markdown fences) with:
{
  "highlights": ["3-5 key changes as bullet points"],
  "breaking_changes": ["any breaking changes, or empty array"],
  "hook_relevance": ["names of the 13 Claude Code hooks that are affected: Setup, SessionStart, SessionEnd, UserPromptSubmit, PreToolUse, PermissionRequest, PostToolUse, PostToolUseFailure, Notification, Stop, SubagentStart, SubagentStop, PreCompact — only include relevant ones, empty array if none"]
}`

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await client.messages.create({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        })

        const textBlock = response.content.find((b) => b.type === 'text')
        if (!textBlock || textBlock.type !== 'text') continue

        const parsed = parseJsonResponse(textBlock.text) as {
          highlights?: string[]
          breaking_changes?: string[]
          hook_relevance?: string[]
        } | null

        if (!parsed) {
          if (attempt < MAX_RETRIES - 1) await sleep(RETRY_DELAY)
          continue
        }

        // Fetch diff stats if we have a previous tag
        let diffStats: ChangelogHighlight['diffStats'] = null
        if (release.prevTagName) {
          diffStats = await fetchCompareStats(release.prevTagName, release.tagName)
        }

        results.push({
          date: release.publishedAt.split('T')[0],
          releaseTag: release.tagName,
          prevReleaseTag: release.prevTagName,
          releaseUrl: release.htmlUrl,
          hookRelevance: Array.isArray(parsed.hook_relevance) ? parsed.hook_relevance : [],
          highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
          breakingChanges: Array.isArray(parsed.breaking_changes) ? parsed.breaking_changes : [],
          diffStats,
          rawBody: release.body,
          fetchedAt: now,
        })

        break // Success — move to next release
      } catch (error) {
        console.error(`[changelog] Classification error for ${release.tagName}:`, error)
        if (attempt < MAX_RETRIES - 1) await sleep(RETRY_DELAY)
      }
    }
  }

  return results
}

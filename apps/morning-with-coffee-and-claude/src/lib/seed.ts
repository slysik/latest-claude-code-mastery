import type { ClassifiedItem, EcosystemEntry } from './types'
import {
  insertItems,
  upsertSentimentSnapshot,
  upsertEcosystemEntries,
  getLatestItems,
} from './db'

let seeded = false

export async function seedDatabase(): Promise<void> {
  if (seeded) return

  // Check if data already exists
  const existing = await getLatestItems(undefined, 1)
  if (existing.length > 0) {
    seeded = true
    return
  }

  const today = new Date().toISOString().split('T')[0]
  const now = new Date().toISOString()

  const sampleItems: ClassifiedItem[] = [
    {
      date: today,
      source: 'reddit',
      category: 'tip',
      title: 'Claude Code hooks can auto-validate your Python on every save',
      url: 'https://reddit.com/r/ClaudeAI/sample-1',
      author: 'u/hooks_enthusiast',
      excerpt:
        'PostToolUse hooks with Ruff validators catch lint errors before they pile up. Game changer for large refactors.',
      thumbnailUrl: null,
      engagementScore: 0.92,
      rawMetrics: { upvotes: 847, comments: 156 },
      sentiment: 'positive',
      sentimentConfidence: 0.94,
      topicTags: ['hooks', 'validation', 'python'],
      oneLineQuote: 'Game changer for large refactors.',
      isTip: true,
      tipConfidence: 0.91,
      fetchedAt: now,
      createdAt: now,
    },
    {
      date: today,
      source: 'youtube',
      category: 'video',
      title: 'Building a Full MCP Server from Scratch with Claude Code',
      url: 'https://youtube.com/watch?v=sample-2',
      author: 'AI Engineering Daily',
      excerpt:
        'Step-by-step walkthrough of creating an MCP server that connects Claude to your internal APIs.',
      thumbnailUrl: null,
      engagementScore: 0.85,
      rawMetrics: { views: 42300, likes: 1890 },
      sentiment: 'positive',
      sentimentConfidence: 0.88,
      topicTags: ['mcp', 'tutorial', 'api'],
      oneLineQuote: null,
      isTip: false,
      tipConfidence: null,
      fetchedAt: now,
      createdAt: now,
    },
    {
      date: today,
      source: 'github',
      category: 'plugin',
      title: 'claude-code-memory: Persistent memory layer for Claude Code sessions',
      url: 'https://github.com/example/claude-code-memory',
      author: 'devtools-collective',
      excerpt:
        'Adds long-term memory to Claude Code via a local SQLite database and smart context injection.',
      thumbnailUrl: null,
      engagementScore: 0.78,
      rawMetrics: { stars: 1240, forks: 89 },
      sentiment: 'positive',
      sentimentConfidence: 0.82,
      topicTags: ['memory', 'context', 'plugin'],
      oneLineQuote: null,
      isTip: false,
      tipConfidence: null,
      fetchedAt: now,
      createdAt: now,
    },
    {
      date: today,
      source: 'anthropic',
      category: 'news',
      title: 'Claude Code 1.0.30: Agent Teams and Enhanced Hook Lifecycle',
      url: 'https://docs.anthropic.com/en/changelog/sample-4',
      author: 'Anthropic',
      excerpt:
        'New release adds experimental agent teams, improved context management, and 3 new hook events.',
      thumbnailUrl: null,
      engagementScore: 0.95,
      rawMetrics: {},
      sentiment: 'positive',
      sentimentConfidence: 0.96,
      topicTags: ['release', 'agent-teams', 'hooks'],
      oneLineQuote: 'Experimental agent teams are now available.',
      isTip: false,
      tipConfidence: null,
      fetchedAt: now,
      createdAt: now,
    },
    {
      date: today,
      source: 'x',
      category: 'tip',
      title: 'Tip: Use PreCompact hook to save transcripts before context overflow',
      url: 'https://x.com/sample-user/status/sample-5',
      author: '@claude_tips',
      excerpt:
        'The PreCompact hook fires right before Claude compresses your context. Perfect for backing up the full conversation.',
      thumbnailUrl: null,
      engagementScore: 0.71,
      rawMetrics: { likes: 234, retweets: 89 },
      sentiment: 'positive',
      sentimentConfidence: 0.85,
      topicTags: ['precompact', 'context', 'tip'],
      oneLineQuote: 'Perfect for backing up the full conversation.',
      isTip: true,
      tipConfidence: 0.88,
      fetchedAt: now,
      createdAt: now,
    },
    {
      date: today,
      source: 'substack',
      category: 'news',
      title: 'The State of AI Coding Assistants: Claude Code vs Cursor vs Copilot',
      url: 'https://ainews.substack.com/p/sample-6',
      author: 'AI Weekly Digest',
      excerpt:
        'Comprehensive comparison of agentic coding tools. Claude Code leads in autonomous task completion.',
      thumbnailUrl: null,
      engagementScore: 0.82,
      rawMetrics: { likes: 567 },
      sentiment: 'neutral',
      sentimentConfidence: 0.72,
      topicTags: ['comparison', 'coding-assistants', 'analysis'],
      oneLineQuote: 'Claude Code leads in autonomous task completion.',
      isTip: false,
      tipConfidence: null,
      fetchedAt: now,
      createdAt: now,
    },
    {
      date: today,
      source: 'reddit',
      category: 'feature',
      title: 'SubagentStart/SubagentStop hooks are incredibly useful for logging',
      url: 'https://reddit.com/r/ClaudeAI/sample-7',
      author: 'u/subagent_watcher',
      excerpt:
        'You can track every subagent spawn and completion with structured logs. Makes debugging team workflows way easier.',
      thumbnailUrl: null,
      engagementScore: 0.68,
      rawMetrics: { upvotes: 312, comments: 78 },
      sentiment: 'positive',
      sentimentConfidence: 0.89,
      topicTags: ['subagent', 'logging', 'debugging'],
      oneLineQuote: 'Makes debugging team workflows way easier.',
      isTip: false,
      tipConfidence: null,
      fetchedAt: now,
      createdAt: now,
    },
    {
      date: today,
      source: 'github',
      category: 'plugin',
      title: 'mcp-everything: Universal MCP server connecting 50+ services',
      url: 'https://github.com/example/mcp-everything',
      author: 'mcp-community',
      excerpt:
        'One MCP server to connect Claude Code to Slack, Linear, Notion, GitHub, and 47 other services.',
      thumbnailUrl: null,
      engagementScore: 0.88,
      rawMetrics: { stars: 3420, forks: 245 },
      sentiment: 'positive',
      sentimentConfidence: 0.79,
      topicTags: ['mcp', 'integrations', 'productivity'],
      oneLineQuote: null,
      isTip: false,
      tipConfidence: null,
      fetchedAt: now,
      createdAt: now,
    },
    {
      date: today,
      source: 'youtube',
      category: 'video',
      title: 'Claude Code Agent Teams Deep Dive: Builder/Validator Pattern',
      url: 'https://youtube.com/watch?v=sample-9',
      author: 'DevTools Weekly',
      excerpt:
        'How to set up builder and validator agents that work together for higher-quality code output.',
      thumbnailUrl: null,
      engagementScore: 0.74,
      rawMetrics: { views: 18700, likes: 892 },
      sentiment: 'positive',
      sentimentConfidence: 0.86,
      topicTags: ['agent-teams', 'builder-validator', 'tutorial'],
      oneLineQuote: null,
      isTip: false,
      tipConfidence: null,
      fetchedAt: now,
      createdAt: now,
    },
    {
      date: today,
      source: 'x',
      category: 'news',
      title: 'Anthropic API pricing update: Haiku gets 40% cheaper',
      url: 'https://x.com/AnthropicAI/status/sample-10',
      author: '@AnthropicAI',
      excerpt:
        'Haiku model pricing reduced by 40%, making AI-powered pipelines significantly more affordable.',
      thumbnailUrl: null,
      engagementScore: 0.91,
      rawMetrics: { likes: 2340, retweets: 890 },
      sentiment: 'positive',
      sentimentConfidence: 0.93,
      topicTags: ['pricing', 'haiku', 'api'],
      oneLineQuote: null,
      isTip: false,
      tipConfidence: null,
      fetchedAt: now,
      createdAt: now,
    },
    {
      date: today,
      source: 'reddit',
      category: 'tip',
      title: 'Use CLAUDE_ENV_FILE in setup hook to persist env vars across sessions',
      url: 'https://reddit.com/r/ClaudeAI/sample-11',
      author: 'u/env_hacker',
      excerpt:
        'The setup hook can write to CLAUDE_ENV_FILE and those variables persist for the entire session. No more re-exporting.',
      thumbnailUrl: null,
      engagementScore: 0.65,
      rawMetrics: { upvotes: 198, comments: 45 },
      sentiment: 'positive',
      sentimentConfidence: 0.87,
      topicTags: ['setup', 'environment', 'tip'],
      oneLineQuote: 'No more re-exporting.',
      isTip: true,
      tipConfidence: 0.93,
      fetchedAt: now,
      createdAt: now,
    },
    {
      date: today,
      source: 'substack',
      category: 'news',
      title: 'Why Claude Code hooks matter more than you think',
      url: 'https://devblog.substack.com/p/sample-12',
      author: 'The Pragmatic Engineer',
      excerpt:
        'Hooks turn Claude Code from a smart autocomplete into a programmable development platform.',
      thumbnailUrl: null,
      engagementScore: 0.79,
      rawMetrics: { likes: 423 },
      sentiment: 'positive',
      sentimentConfidence: 0.91,
      topicTags: ['hooks', 'opinion', 'platform'],
      oneLineQuote:
        'Hooks turn Claude Code from a smart autocomplete into a programmable development platform.',
      isTip: false,
      tipConfidence: null,
      fetchedAt: now,
      createdAt: now,
    },
  ]

  const ecosystemEntries: EcosystemEntry[] = [
    {
      name: 'claude-code-hooks-mastery',
      type: 'hook',
      author: 'slysik',
      description:
        'Production reference for all 13 Claude Code lifecycle hooks with agent orchestration.',
      githubUrl: 'https://github.com/slysik/claude-code-hooks-mastery',
      stars: 342,
      lastUpdated: now,
      categoryTags: ['hooks', 'reference', 'agents'],
      mentionCount: 28,
    },
    {
      name: 'mcp-server-sqlite',
      type: 'mcp_server',
      author: 'anthropics',
      description:
        'MCP server providing SQLite database access to Claude Code.',
      githubUrl: 'https://github.com/modelcontextprotocol/servers',
      stars: 8920,
      lastUpdated: now,
      categoryTags: ['mcp', 'database', 'sqlite'],
      mentionCount: 156,
    },
    {
      name: 'claude-code-action',
      type: 'plugin',
      author: 'anthropics',
      description:
        'GitHub Action to run Claude Code in CI/CD pipelines for automated code review.',
      githubUrl: 'https://github.com/anthropics/claude-code-action',
      stars: 2150,
      lastUpdated: now,
      categoryTags: ['ci-cd', 'github-actions', 'automation'],
      mentionCount: 89,
    },
    {
      name: 'claude-code-router',
      type: 'skill',
      author: 'ai-tools-lab',
      description:
        'Smart routing skill that delegates tasks to the best-fit Claude model tier.',
      githubUrl: 'https://github.com/ai-tools-lab/claude-code-router',
      stars: 567,
      lastUpdated: now,
      categoryTags: ['routing', 'optimization', 'skill'],
      mentionCount: 34,
    },
    {
      name: 'mcp-playwright',
      type: 'mcp_server',
      author: 'anthropics',
      description:
        'Browser automation MCP server enabling Claude Code to interact with web pages.',
      githubUrl: 'https://github.com/anthropics/mcp-playwright',
      stars: 4210,
      lastUpdated: now,
      categoryTags: ['mcp', 'browser', 'automation'],
      mentionCount: 112,
    },
  ]

  await insertItems(sampleItems)

  // Find the top positive item URL for the snapshot
  const topPositiveUrl = sampleItems.find(
    (i) => i.sentiment === 'positive' && i.engagementScore >= 0.9,
  )?.url ?? null

  await upsertSentimentSnapshot({
    date: today,
    positivePct: 75,
    neutralPct: 17,
    negativePct: 8,
    sampleSize: sampleItems.length,
    topPositiveId: null, // Will resolve from items table in actual pipeline
    topNegativeId: null,
    summary:
      'Strong positive sentiment across the Claude Code ecosystem today. New hook patterns and MCP integrations driving excitement. Pricing updates well received.',
  })

  await upsertEcosystemEntries(ecosystemEntries)

  seeded = true
}

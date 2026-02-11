# Coffee with Claude v2 — Implementation Plan

## Vision

Transform the single daily dashboard into a **3x-daily timeline feed** with layered depth, new sources, and repo-aware intelligence. The reading experience becomes a scrolling timeline where Morning, Mid-day, and Evening briefings stack as the day progresses — each with a TL;DR (facts + "try this today" + one insight), expandable detail sections, and raw source links.

## Current Architecture

| Layer | Tech | Files |
|-------|------|-------|
| Frontend | Next.js 15 + React 19 + Tailwind | `page.tsx` → `DashboardLayout.tsx` → 12 section components |
| Pipeline | Single cron (`0 12 * * *`) | `api/cron/aggregate/route.ts` → 9 fetchers → classify → summarize → rank → DB |
| Storage | Turso (libSQL) | `lib/db.ts` — items, sentiment_snapshots, ecosystem, changelog, review_telemetry |
| AI | Anthropic Haiku | `lib/sentiment.ts`, `lib/summarizer.ts`, `lib/changelog-classifier.ts` |
| Deploy | Vercel | `vercel.json` — one cron job |

## Priority 1: UI Overhaul — Timeline Feed + Layered Depth

**Goal**: Replace the static section-based dashboard with a scrolling timeline where each briefing is a collapsible card.

### 1A. New `BriefingCard` Component

**File**: `src/components/BriefingCard.tsx`

A single briefing entry in the timeline. Contains:
- **Header**: Briefing type badge (Morning/Mid-day/Evening) + timestamp
- **TL;DR section** (always visible): 3-5 fact bullets + one "try this today" experiment + one insight/opinion
- **Expand toggle**: Click to reveal full detail sections
- **Detail sections** (collapsed by default): The existing section components (LatestNews, SentimentGauge, etc.) rendered inside, appropriate to the briefing type
- **Source links**: Raw URLs at the bottom of expanded view

```
Morning Briefing — Feb 10, 2026 7:00 AM
─────────────────────────────────────────
TL;DR:
• Claude Code v1.0.42 released — adds new MCP tool validation
• Anthropic blog: "Building with Claude Code in Production"
• r/ClaudeAI sentiment shifted positive (+12% overnight)
🧪 Try today: Add the new `validate_tool_schema` hook to your pre_tool_use chain
💡 The community is converging on UV + PEP 723 as the standard hook packaging pattern

▼ Full Details
  [LatestNews component]
  [DiffOfTheDay component]
  [SentimentGauge component — mini version]

  Sources: [raw links]
```

### 1B. New `TimelineFeed` Component

**File**: `src/components/TimelineFeed.tsx`

Replaces `DashboardLayout.tsx` as the main layout. Features:
- Vertical timeline with date separators
- Most recent briefing at top, older ones scroll down
- Visual connector line between briefing cards
- "No briefing yet" placeholder for upcoming slots (e.g., evening not yet run)
- Keeps the existing header (title, date, staleness warning)
- Footer updated to reflect 3x daily cadence

### 1C. Data Model Changes

**New type**: `BriefingSlot`

```typescript
// src/lib/types.ts additions
export type BriefingSlot = 'morning' | 'midday' | 'evening'

export interface Briefing {
  slot: BriefingSlot
  date: string                    // YYYY-MM-DD
  runAt: string                   // ISO timestamp of when pipeline ran
  tldr: {
    facts: string[]               // 3-5 bullet points
    tryToday: string | null       // One actionable experiment
    insight: string | null        // One opinionated take
  }
  items: ClassifiedItem[]         // Items fetched in this slot
  sentiment: SentimentDailySnapshot | null
  changelog: ChangelogHighlight[]
  ecosystem: EcosystemEntry[]
  patternOfTheDay: ClassifiedItem | null
  reviewTelemetry: ReviewTelemetrySummary | null
}

export interface TimelineData {
  briefings: Briefing[]           // Ordered newest-first
  lastUpdated: string | null
}
```

**New DB table**: `briefings`

```sql
CREATE TABLE IF NOT EXISTS briefings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slot TEXT NOT NULL,              -- 'morning' | 'midday' | 'evening'
  date TEXT NOT NULL,              -- YYYY-MM-DD
  run_at TEXT NOT NULL,            -- ISO timestamp
  tldr_facts TEXT,                 -- JSON array
  tldr_try_today TEXT,
  tldr_insight TEXT,
  item_count INTEGER DEFAULT 0,
  sentiment_snapshot_id INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_briefings_slot_date ON briefings(slot, date);
```

### 1D. Updated `page.tsx`

```typescript
// Fetch timeline data instead of flat dashboard data
const data = await getTimelineData(7) // Last 7 days of briefings
return <TimelineFeed data={data} />
```

### 1E. Update `DashboardLayout.tsx`

Keep as a legacy component (or remove). The section components it uses (LatestNews, SentimentGauge, etc.) stay — they get embedded inside `BriefingCard` detail sections.

### Files to Create/Modify

| Action | File | Description |
|--------|------|-------------|
| Create | `src/components/BriefingCard.tsx` | Individual briefing card with TL;DR + expandable details |
| Create | `src/components/TimelineFeed.tsx` | Main timeline layout, replaces DashboardLayout |
| Create | `src/components/BriefingBadge.tsx` | Morning/Mid-day/Evening badge component |
| Create | `src/components/TldrSection.tsx` | TL;DR bullet rendering (facts + try + insight) |
| Modify | `src/lib/types.ts` | Add BriefingSlot, Briefing, TimelineData types |
| Modify | `src/lib/db.ts` | Add briefings table, getTimelineData(), saveBriefing() |
| Modify | `src/app/page.tsx` | Switch to TimelineFeed |
| Keep | `src/components/DashboardLayout.tsx` | Keep for fallback / legacy access |

---

## Priority 2: 3x Daily Pipeline

**Goal**: Run the cron 3 times/day with slot-appropriate logic.

### 2A. Cron Schedule (Single Job, 3 Runs)

**File**: `vercel.json`

Uses one cron entry with comma-separated hours to stay within Vercel Hobby's 2-job limit:

```json
{
  "crons": [
    {
      "path": "/api/cron/aggregate",
      "schedule": "0 0,12,18 * * *"
    }
  ]
}
```

The route handler auto-detects the slot from the current UTC hour:

```typescript
function getCurrentSlot(): BriefingSlot {
  const hour = new Date().getUTCHours()
  if (hour >= 10 && hour < 16) return 'morning'   // 12 UTC = 7am ET
  if (hour >= 16 && hour < 22) return 'midday'     // 18 UTC = 1pm ET
  return 'evening'                                  // 0 UTC = 7pm ET
}
```

Manual override via `?slot=morning&force=true` for testing. This leaves the second cron slot free for a future weekly digest or health check.

Times in US Eastern:
- Morning = 7 AM ET (12:00 UTC)
- Mid-day = 1 PM ET (18:00 UTC)
- Evening = 7 PM ET (00:00 UTC next day)

### 2B. Slot-Aware Pipeline

**File**: `src/app/api/cron/aggregate/route.ts`

Add `slot` query parameter. Each slot runs a subset of fetchers and generates a slot-specific TL;DR:

| Slot | Fetchers | TL;DR Focus |
|------|----------|-------------|
| **Morning** | Anthropic blog, GitHub (releases + trending), RSS, HN | What changed overnight. 3-5 bullets + "try this today" experiment |
| **Mid-day** | GitHub (repos + configs), Awesome Lists, Agent Configs | Patterns & configs. 1 config pattern, 1 workflow snippet, 1 prompt |
| **Evening** | Reddit, X/Twitter, YouTube, HN | Community + reflection. Field notes + "what worked / what to change" |

The pipeline still runs the full classify → rank → summarize flow, but:
1. Auto-detects slot from UTC hour (or accepts `?slot=` override)
2. Only invokes the fetchers for that slot
3. Generates a slot-specific TL;DR via `lib/summarizer.ts` (new `generateBriefingTldr()` function)
4. Saves a `briefings` row linking the slot, date, TL;DR, and items

### 2C. TL;DR Generation

**File**: `src/lib/summarizer.ts` — add `generateBriefingTldr()`

Prompt Haiku with the slot context + classified items to produce:
- `facts`: 3-5 key bullet points
- `tryToday`: One concrete experiment the user can try in their repo
- `insight`: One opinionated observation (newsletter-editor voice)

### Files to Create/Modify

| Action | File | Description |
|--------|------|-------------|
| Modify | `vercel.json` | Single cron with 3 run times (`0 0,12,18 * * *`) |
| Modify | `api/cron/aggregate/route.ts` | Auto-detect slot from UTC hour, conditional fetcher sets, briefing save |
| Modify | `src/lib/summarizer.ts` | Add `generateBriefingTldr()` |
| Modify | `src/lib/db.ts` | `saveBriefing()`, `getTimelineData()` |

---

## Priority 3: New Sources

**Goal**: Add Discord, Anthropic docs changelog, and deeper GitHub coverage.

### 3A. Anthropic Docs Changelog Fetcher

**File**: `src/lib/fetchers/anthropic-docs.ts`

Research needed first:
- Check `docs.anthropic.com` for changelog/RSS feed
- Check Anthropic's GitHub repos for release notes
- Fallback: scrape `docs.anthropic.com/en/docs/about-claude/models` or similar with cheerio

Returns `FetchedItem[]` with `source: 'anthropic'`, `category: 'feature'`.

### 3B. Discord Fetcher

**File**: `src/lib/fetchers/discord.ts`

Options (in priority order):
1. **Discord bot** reading specific channels (needs bot token + server access)
2. **Web scraping** of public Discord channels (fragile, ToS concerns)
3. **Third-party aggregators** like DiscordServers.com or similar
4. **Manual feed**: RSS bridges for Discord (e.g., discord.gg RSS services)

This one needs research to determine the viable approach. Likely a Phase 2 item that starts with manual channel monitoring + future bot integration.

### 3C. GitHub Discussions/Issues Fetcher

**File**: `src/lib/fetchers/github.ts` — extend existing

Add to existing GitHub fetcher:
- Search GitHub Discussions in `anthropics/claude-code` and related repos
- Search Issues with "claude code" mentions
- Use GitHub GraphQL API for discussions (REST for issues)

### Files to Create/Modify

| Action | File | Description |
|--------|------|-------------|
| Create | `src/lib/fetchers/anthropic-docs.ts` | Anthropic docs changelog scraper |
| Create | `src/lib/fetchers/discord.ts` | Discord content fetcher (approach TBD) |
| Modify | `src/lib/fetchers/github.ts` | Add discussions + issues search |
| Modify | `src/lib/fetchers/index.ts` | Export new fetchers |
| Modify | `src/lib/types.ts` | Add 'discord' to source union if needed |

---

## Priority 4: Repo Intelligence

**Goal**: Personalized insights based on Steve's hooks mastery repo.

### 4A. Codebase Scanner

**File**: `src/lib/repo-scanner.ts`

Runs locally (or as a pre-deploy step) to generate a repo profile:
- List of hooks used (by filename pattern matching)
- Agent configurations found
- MCP servers configured
- Slash commands available
- Dependencies and patterns

Outputs a `repo-profile.json` that the pipeline reads.

### 4B. Skill Gap Tagger

**File**: `src/lib/skill-gap.ts`

Compares `repo-profile.json` against a knowledge base of known Claude Code features:
- When a fetched item covers a feature not in the repo profile → tag as `skillGap: true`
- Surface these in the evening briefing's "What to change" section

### 4C. Similar Projects Discovery

**File**: `src/lib/fetchers/similar-projects.ts`

Searches GitHub for repos with:
- `.claude/` directory structure
- Agent markdown files
- Hook scripts
- Similar `settings.json` patterns

Weighted toward:
1. Recently active (pushed in last 30 days)
2. Architecture match (hooks, agents, MCP)
3. Rising stars (gaining stars this week)

### 4D. Weekly Skill Gap Digest

**File**: `src/lib/skill-gap-digest.ts`

Once per week (Sunday evening slot), generate a "You might be missing out on..." section:
- Top 2-3 features/patterns seen in the wild that aren't in the repo
- Links to relevant content from the past week
- Concrete steps to try each one

### Files to Create/Modify

| Action | File | Description |
|--------|------|-------------|
| Create | `src/lib/repo-scanner.ts` | Analyze local repo for feature usage |
| Create | `src/lib/skill-gap.ts` | Tag items as skill gap opportunities |
| Create | `src/lib/fetchers/similar-projects.ts` | GitHub search for similar CC repos |
| Create | `src/lib/skill-gap-digest.ts` | Weekly digest generation |
| Create | `repo-profile.json` | Generated repo profile (gitignored) |
| Modify | `src/lib/sentiment.ts` | Add skillGap field to classification |
| Modify | `src/lib/types.ts` | Add skillGap fields to ClassifiedItem |

---

## Implementation Sequence

```
Phase 1: UI Overhaul (Priority 1)
├── 1A. BriefingCard component
├── 1B. TimelineFeed layout
├── 1C. Types + DB schema for briefings
├── 1D. Updated page.tsx
└── 1E. Verify existing sections render inside cards

Phase 2: 3x Pipeline (Priority 2) — depends on Phase 1
├── 2A. vercel.json cron update
├── 2B. Slot-aware route handler
├── 2C. TL;DR generation
└── 2D. Integration test (all 3 slots)

Phase 3: New Sources (Priority 3) — independent of Phase 1-2
├── 3A. Research Anthropic docs feeds
├── 3B. Research Discord approach
├── 3C. GitHub discussions/issues
└── 3D. Wire into slot-appropriate fetcher sets

Phase 4: Repo Intelligence (Priority 4) — depends on Phase 2
├── 4A. Codebase scanner
├── 4B. Skill gap tagger
├── 4C. Similar projects fetcher
└── 4D. Weekly digest
```

## Non-Goals (for now)

- Audio briefing / TTS (future enhancement)
- Push notifications (email/Slack delivery)
- Sentiment as core feature (nice-to-have, already exists)
- Mobile-specific layout (Tailwind responsive should handle it)

## Risk & Open Questions

1. **Vercel Hobby plan cron limits**: Resolved — single cron entry with comma-separated hours (`0 0,12,18 * * *`) stays within the 2-job limit. Second slot reserved for future weekly digest.
2. **Discord data access**: Most viable approaches require a bot token. May need to defer or use an alternative (monitoring public channels via RSS bridge).
3. **Anthropic docs changelog**: No known RSS feed. May need to scrape or poll specific pages. Research required.
4. **Repo scanner locality**: Runs locally, not on Vercel. Need a mechanism to push `repo-profile.json` to the deployed app (env var, API endpoint, or commit to repo).

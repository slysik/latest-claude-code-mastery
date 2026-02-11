# Plan: Coffee with Claude v2 — Timeline Feed + 3x Daily Pipeline

## Task Description

Transform the Morning with Coffee & Claude app from a single-daily static dashboard into a 3x-daily timeline feed with layered depth. The current app runs one cron at noon UTC, fetches from 9 sources, classifies with Haiku, and renders a static section-based dashboard. The new version will:

1. **UI Overhaul**: Replace `DashboardLayout.tsx` with a `TimelineFeed` — a scrolling timeline where Morning, Mid-day, and Evening briefings stack as cards, newest-first. Each card has a TL;DR (facts + "try this today" + insight) always visible, with expandable detail sections containing the existing components.

2. **3x Pipeline**: A single Vercel cron (`0 0,12,18 * * *`) fires 3 times/day. The route handler auto-detects the slot from UTC hour and runs slot-specific fetcher subsets: Morning (what changed), Mid-day (patterns & configs), Evening (community & reflection).

3. **TL;DR Generation**: New `generateBriefingTldr()` in `summarizer.ts` produces structured JSON with `facts`, `tryToday`, and `insight` per briefing, using Haiku.

## Objective

When complete, the dashboard will show a vertical timeline of briefing cards (up to 3 per day, 7 days of history). Each card displays a concise TL;DR with one actionable experiment. Users can expand any card to see full detail sections. The pipeline runs 3 times daily on Vercel using a single cron job.

## Problem Statement

The current single-daily dashboard shows all content in fixed sections with no temporal context. Users can't tell what's new since their last visit, content feels stale by evening, and there's no actionable "try this today" synthesis. The monolithic pipeline also fetches all sources every run, making it impossible to tailor content to different times of day.

## Solution Approach

**Phase 1 — Data Model & DB**: Add a `briefings` table to Turso that stores per-slot metadata (slot, date, TL;DR JSON, item count). Add TypeScript types. New DB functions: `saveBriefing()`, `getTimelineData()`.

**Phase 2 — Pipeline**: Modify the cron route to accept slot auto-detection. Create a fetcher-mapping for each slot. Add `generateBriefingTldr()` to the summarizer. Save a briefing row after each pipeline run.

**Phase 3 — UI**: Build `BriefingCard` (collapsible card), `TldrSection` (bullet rendering), `BriefingBadge` (slot indicator), and `TimelineFeed` (timeline layout). Wire `page.tsx` to use the new layout.

This approach is additive — existing components (LatestNews, SentimentGauge, etc.) are reused inside briefing cards, not rewritten. The old `DashboardLayout` is preserved as a fallback.

## Relevant Files

### Existing Files to Modify

- **`src/lib/types.ts`** — Add `BriefingSlot`, `Briefing`, `BriefingTldr`, `TimelineData` types. Currently has `FetchedItem`, `ClassifiedItem`, `DashboardData`, etc.
- **`src/lib/db.ts`** — Add `briefings` table to `initSchema()`, add `saveBriefing()` and `getTimelineData()` functions. Currently 1070 lines with items, sentiment_daily, ecosystem, changelog_highlights, review_telemetry tables.
- **`src/lib/summarizer.ts`** — Add `generateBriefingTldr()` alongside existing `generateSummary()`. Uses Anthropic Haiku, 97 lines currently.
- **`src/app/api/cron/aggregate/route.ts`** — Add slot detection, conditional fetcher sets, briefing save. Currently 244 lines, runs all 9 fetchers unconditionally.
- **`src/app/page.tsx`** — Switch from `getDashboardData()` to `getTimelineData()`. Currently 9 lines.
- **`vercel.json`** — Change cron from `"0 12 * * *"` to `"0 0,12,18 * * *"`. Currently 8 lines.

### Existing Files to Reuse (No Changes)

- **`src/components/LatestNews.tsx`** — Rendered inside Morning & Evening briefing cards
- **`src/components/SentimentGauge.tsx`** — Rendered inside Evening briefing cards
- **`src/components/DiffOfTheDay.tsx`** — Rendered inside Morning briefing cards
- **`src/components/EcosystemGrid.tsx`** — Rendered inside Mid-day briefing cards
- **`src/components/PatternOfTheDay.tsx`** — Rendered inside Mid-day briefing cards
- **`src/components/YouTubeCarousel.tsx`** — Rendered inside Evening briefing cards
- **`src/components/TopTips.tsx`** — Rendered inside briefing cards as available
- **`src/components/ModelMixMonitor.tsx`** — Rendered inside Mid-day briefing cards
- **`src/components/PulseSummary.tsx`** — Replaced by TldrSection; kept for fallback
- **`src/components/ui/Card.tsx`**, **`Badge.tsx`**, **`Gauge.tsx`**, **`Sparkline.tsx`** — Reused in new components
- **`src/lib/sentiment.ts`**, **`src/lib/ranker.ts`**, **`src/lib/deduper.ts`** — Pipeline functions unchanged
- **All fetchers** — `src/lib/fetchers/*.ts` — No changes, just called conditionally

### New Files

- **`src/components/TimelineFeed.tsx`** — Main timeline layout, replaces DashboardLayout
- **`src/components/BriefingCard.tsx`** — Individual briefing card with TL;DR + expandable details
- **`src/components/BriefingBadge.tsx`** — Morning/Mid-day/Evening slot badge
- **`src/components/TldrSection.tsx`** — Renders TL;DR bullets (facts + try today + insight)

## Implementation Phases

### Phase 1: Foundation (Data Model + DB)

Add types and database schema for briefings. This is the foundation everything else depends on.

1. Add types to `src/lib/types.ts`: `BriefingSlot`, `BriefingTldr`, `Briefing`, `TimelineData`
2. Add `briefings` table to `initSchema()` in `src/lib/db.ts`
3. Add `saveBriefing()` function to `db.ts`
4. Add `getTimelineData(days: number)` function to `db.ts`
5. Add `getBriefingItemsBySlot(slot, date)` helper to `db.ts`

### Phase 2: Core Implementation (Pipeline + TL;DR)

Modify the pipeline to be slot-aware and generate structured TL;DRs.

1. Add `generateBriefingTldr()` to `src/lib/summarizer.ts`
2. Add `getCurrentSlot()` utility to the cron route
3. Add fetcher-to-slot mapping in the cron route
4. Modify the pipeline to save a briefing row after each run
5. Update `vercel.json` cron schedule

### Phase 3: Integration & Polish (UI Components + Wiring)

Build the timeline UI and wire everything together.

1. Create `BriefingBadge.tsx`
2. Create `TldrSection.tsx`
3. Create `BriefingCard.tsx` (uses BriefingBadge, TldrSection, and existing section components)
4. Create `TimelineFeed.tsx` (uses BriefingCard)
5. Update `page.tsx` to use TimelineFeed
6. Keep `DashboardLayout.tsx` as legacy fallback

## Team Orchestration

- You operate as the team lead and orchestrate the team to execute the plan.
- You NEVER operate directly on the codebase. You use Task and Task* tools.

### Team Members

- **Name**: foundation-worker
  - **Role**: Data model and database schema implementation
  - **Agent Type**: builder
  - **Resume**: No

- **Name**: pipeline-worker
  - **Role**: Cron route modifications, TL;DR generation, slot logic
  - **Agent Type**: builder
  - **Resume**: No

- **Name**: ui-worker
  - **Role**: Timeline feed UI components
  - **Agent Type**: builder
  - **Resume**: No

- **Name**: validator
  - **Role**: Read-only verification of all changes
  - **Agent Type**: validator
  - **Resume**: No

## Step by Step Tasks

### 1. Add Types for Briefings

- **Task ID**: add-types
- **Depends On**: none
- **Assigned To**: foundation-worker
- **Agent Type**: builder
- **Parallel**: true (can run alongside nothing — it's first)

Add the following types to `src/lib/types.ts`:

```typescript
export type BriefingSlot = 'morning' | 'midday' | 'evening'

export interface BriefingTldr {
  facts: string[]              // 3-5 bullet points
  tryToday: string | null      // One actionable experiment
  insight: string | null       // One opinionated take
}

export interface Briefing {
  id?: number
  slot: BriefingSlot
  date: string                 // YYYY-MM-DD
  runAt: string                // ISO timestamp
  tldr: BriefingTldr
  itemCount: number
  items: ClassifiedItem[]      // Hydrated from items table
  sentiment: SentimentDailySnapshot | null
  changelog: ChangelogHighlight[]
  ecosystem: EcosystemEntry[]
  patternOfTheDay: ClassifiedItem | null
  reviewTelemetry: ReviewTelemetrySummary | null
}

export interface TimelineData {
  briefings: Briefing[]        // Ordered newest-first
  lastUpdated: string | null
}
```

Also update `DashboardData` to keep the old interface working — do NOT remove it.

### 2. Add Briefings DB Schema and Functions

- **Task ID**: add-db
- **Depends On**: add-types
- **Assigned To**: foundation-worker
- **Agent Type**: builder
- **Parallel**: false

In `src/lib/db.ts`:

**2a. Add the `briefings` table to `initSchema()`:**

```sql
CREATE TABLE IF NOT EXISTS briefings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slot TEXT NOT NULL,
  date TEXT NOT NULL,
  run_at TEXT NOT NULL,
  tldr_facts TEXT DEFAULT '[]',
  tldr_try_today TEXT,
  tldr_insight TEXT,
  item_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_briefings_slot_date ON briefings(slot, date);
```

**2b. Add `saveBriefing()` function:**

```typescript
export async function saveBriefing(briefing: {
  slot: BriefingSlot
  date: string
  runAt: string
  tldr: BriefingTldr
  itemCount: number
}): Promise<void> {
  await initSchema()
  const db = getDb()
  await db.execute({
    sql: `
      INSERT INTO briefings (slot, date, run_at, tldr_facts, tldr_try_today, tldr_insight, item_count)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(slot, date) DO UPDATE SET
        run_at = excluded.run_at,
        tldr_facts = excluded.tldr_facts,
        tldr_try_today = excluded.tldr_try_today,
        tldr_insight = excluded.tldr_insight,
        item_count = excluded.item_count
    `,
    args: [
      briefing.slot,
      briefing.date,
      briefing.runAt,
      JSON.stringify(briefing.tldr.facts),
      briefing.tldr.tryToday,
      briefing.tldr.insight,
      briefing.itemCount,
    ],
  })
}
```

**2c. Add `getTimelineData(days)` function:**

Query the `briefings` table for the last N days, ordered by date DESC then slot order (evening > midday > morning). For each briefing row, hydrate its items from the `items` table by matching the briefing's date and the slot's fetcher sources. Also hydrate sentiment, changelog, ecosystem, etc. from their respective tables.

Return `TimelineData` with all briefings hydrated.

**2d. Add `getBriefingItems(slot, date)` helper:**

Returns items for a given slot+date by filtering the items table:
- Morning slot: source IN ('anthropic', 'github', 'hackernews') AND category IN ('news', 'feature')
- Mid-day slot: source IN ('github') AND category IN ('plugin', 'tip') + ecosystem items
- Evening slot: source IN ('reddit', 'x', 'youtube', 'hackernews')

Filter by date matching the briefing date.

### 3. Add TL;DR Generation

- **Task ID**: add-tldr
- **Depends On**: add-types
- **Assigned To**: pipeline-worker
- **Agent Type**: builder
- **Parallel**: true (can run in parallel with add-db)

In `src/lib/summarizer.ts`, add `generateBriefingTldr()`:

```typescript
export async function generateBriefingTldr(
  slot: BriefingSlot,
  items: ClassifiedItem[],
): Promise<BriefingTldr> {
  // Slot-specific prompts
  const slotContext = {
    morning: 'Focus on what changed overnight: new releases, announcements, breaking news. The "try today" should be a concrete experiment the user can run in their Claude Code repo.',
    midday: 'Focus on patterns, configurations, and workflows. The "try today" should be a specific config pattern or workflow snippet to paste into their setup.',
    evening: 'Focus on community discussion and reflection. The "try today" should be something to try tomorrow based on what the community learned today.',
  }

  // Call Haiku with structured output prompt
  // Return { facts: string[], tryToday: string | null, insight: string | null }
  // Fallback: extract facts from item titles if API fails
}
```

The prompt should instruct Haiku to return valid JSON with exactly the `BriefingTldr` shape. Use the same retry/fallback pattern as `generateSummary()`. Include the slot context in the system prompt.

**Fallback**: If API fails, generate facts from the top 3-5 item titles, set tryToday to null, set insight to null.

### 4. Modify Cron Route for Slot-Aware Pipeline

- **Task ID**: modify-cron
- **Depends On**: add-db, add-tldr
- **Assigned To**: pipeline-worker
- **Agent Type**: builder
- **Parallel**: false

In `src/app/api/cron/aggregate/route.ts`:

**4a. Add slot detection:**

```typescript
type BriefingSlot = 'morning' | 'midday' | 'evening'

function getCurrentSlot(): BriefingSlot {
  const hour = new Date().getUTCHours()
  if (hour >= 10 && hour < 16) return 'morning'
  if (hour >= 16 && hour < 22) return 'midday'
  return 'evening'
}
```

Allow `?slot=` query param override for testing. Fallback to `getCurrentSlot()`.

**4b. Define fetcher-to-slot mapping:**

```typescript
const SLOT_FETCHERS: Record<BriefingSlot, (() => Promise<FetchedItem[]>)[]> = {
  morning: [fetchAnthropic, fetchGitHub, fetchRss, fetchHackerNews],
  midday:  [fetchGitHub, fetchAwesomeLists, fetchAgentConfigs],
  evening: [fetchReddit, fetchTwitter, fetchYouTube, fetchHackerNews],
}
```

Note: `fetchGitHub` appears in morning and midday — morning focuses on releases, midday on trending repos/configs. The existing function returns both, so items get classified and filtered at the component level.

**4c. Replace the current hardcoded fetcher list** with `SLOT_FETCHERS[slot]`. Keep the same `Promise.allSettled()` pattern.

**4d. After classification and saving to DB**, call `generateBriefingTldr(slot, classified)` and then `saveBriefing()`.

**4e. Update the response JSON** to include `slot` and `briefingId`.

**4f. Update idempotency check**: Currently checks if a sentiment snapshot exists for today. Change to check if a briefing for this slot+date already exists (via a new `getBriefing(slot, date)` query).

### 5. Update Vercel Cron Schedule

- **Task ID**: update-cron
- **Depends On**: modify-cron
- **Assigned To**: pipeline-worker
- **Agent Type**: builder
- **Parallel**: false

Change `vercel.json` from:
```json
{ "path": "/api/cron/aggregate", "schedule": "0 12 * * *" }
```
to:
```json
{ "path": "/api/cron/aggregate", "schedule": "0 0,12,18 * * *" }
```

### 6. Create BriefingBadge Component

- **Task ID**: create-badge
- **Depends On**: add-types
- **Assigned To**: ui-worker
- **Agent Type**: builder
- **Parallel**: true (can run in parallel with pipeline tasks)

Create `src/components/BriefingBadge.tsx`:

A small badge/chip that displays the briefing slot name with an appropriate icon and color:
- Morning: sunrise icon (or text), warm orange (`bg-amber-100 text-amber-800`)
- Mid-day: sun icon, bright (`bg-sky-100 text-sky-800`)
- Evening: moon icon, cool (`bg-indigo-100 text-indigo-800`)

Use the same sizing and font patterns as the existing `Badge` component in `src/components/ui/Badge.tsx`.

```typescript
interface BriefingBadgeProps {
  slot: BriefingSlot
}
```

### 7. Create TldrSection Component

- **Task ID**: create-tldr
- **Depends On**: add-types
- **Assigned To**: ui-worker
- **Agent Type**: builder
- **Parallel**: true (can run in parallel with create-badge)

Create `src/components/TldrSection.tsx`:

Renders the TL;DR content for a briefing card:
- Bullet list of `facts` (3-5 items)
- "Try today" callout with a beaker/experiment icon and distinct styling
- "Insight" callout with a lightbulb icon and italicized text
- Handle null `tryToday` and `insight` gracefully (don't render if null)
- Extract the `renderMarkdown()` function from `PulseSummary.tsx` into a new shared util `src/lib/render-markdown.tsx` so both PulseSummary and TldrSection can import it. This function renders markdown links as React elements using JSX (not raw HTML injection), so XSS is prevented by React's built-in escaping. No additional sanitization needed.

```typescript
interface TldrSectionProps {
  tldr: BriefingTldr
}
```

Follow the existing Tailwind patterns: `font-body`, `text-anthropic-dark`, `text-small`, etc.

### 8. Create BriefingCard Component

- **Task ID**: create-card
- **Depends On**: create-badge, create-tldr, add-db
- **Assigned To**: ui-worker
- **Agent Type**: builder
- **Parallel**: false

Create `src/components/BriefingCard.tsx` as a client component (`'use client'`):

Structure:
```
<article> — Card wrapper with border-left accent color matching slot
  <header> — BriefingBadge + timestamp + item count
  <TldrSection> — Always visible
  <button> — "Show details" / "Hide details" toggle
  <div> — Collapsible detail section (hidden by default)
    Conditional section components based on slot:
    - Morning: LatestNews, DiffOfTheDay
    - Mid-day: EcosystemGrid, PatternOfTheDay, ModelMixMonitor
    - Evening: LatestNews, SentimentGauge, YouTubeCarousel
    Source links at bottom
  </div>
</article>
```

Use `useState` for expand/collapse. Default collapsed. The most recent briefing (first in list) should default to expanded.

Props:
```typescript
interface BriefingCardProps {
  briefing: Briefing
  defaultExpanded?: boolean
}
```

### 9. Create TimelineFeed Component

- **Task ID**: create-timeline
- **Depends On**: create-card
- **Assigned To**: ui-worker
- **Agent Type**: builder
- **Parallel**: false

Create `src/components/TimelineFeed.tsx`:

Structure:
```
<main> — max-w-5xl mx-auto px-6 md:px-12 py-8 (same as current DashboardLayout)
  <header> — Title, date, last-updated timestamp (reuse from DashboardLayout)
  <div> — Staleness warning if needed
  <div> — Timeline container
    For each day (grouped by date):
      <div> — Date separator with formatted date
      For each briefing in that day (evening → midday → morning):
        <BriefingCard> — With visual connector line between cards
    If no briefings:
      <div> — Empty state message
  <footer> — Updated footer mentioning 3x daily cadence
</main>
```

Group briefings by date. Within each date, order: evening → midday → morning (reverse chronological by slot). Show upcoming slot placeholders for today only (e.g., "Evening briefing coming at 7 PM ET").

Visual connector: A thin vertical line on the left side connecting briefing cards within a day.

Props:
```typescript
interface TimelineFeedProps {
  data: TimelineData
}
```

### 10. Update page.tsx and Imports

- **Task ID**: update-page
- **Depends On**: create-timeline, add-db
- **Assigned To**: ui-worker
- **Agent Type**: builder
- **Parallel**: false

Modify `src/app/page.tsx` (currently 9 lines):

1. Replace `import { getDashboardData } from '@/lib/db'` with `import { getTimelineData } from '@/lib/db'`
2. Replace `import DashboardLayout from '@/components/DashboardLayout'` with `import TimelineFeed from '@/components/TimelineFeed'`
3. Replace `const data = await getDashboardData()` with `const data = await getTimelineData(7)`
4. Replace `<DashboardLayout data={data} />` with `<TimelineFeed data={data} />`
5. Change `revalidate` from `86400` to `3600` (1 hour) since content now updates 3x/day

**Do NOT delete** the old `DashboardLayout.tsx` — keep it as a legacy fallback.

### 11. Final Validation

- **Task ID**: validate-all
- **Depends On**: update-page, update-cron
- **Assigned To**: validator
- **Agent Type**: validator
- **Parallel**: false

Run all validation commands. Verify acceptance criteria met.

## Acceptance Criteria

1. **TypeScript compiles** with zero errors (`npx tsc --noEmit`)
2. **Next.js builds** successfully (`npm run build`)
3. **`briefings` table** exists in Turso schema with columns: id, slot, date, run_at, tldr_facts, tldr_try_today, tldr_insight, item_count, created_at
4. **Unique index** on `(slot, date)` prevents duplicate briefings per slot per day
5. **Cron route** accepts `?slot=morning|midday|evening` override and auto-detects from UTC hour when not provided
6. **Morning slot** (12 UTC) fetches: Anthropic, GitHub, RSS, HN
7. **Mid-day slot** (18 UTC) fetches: GitHub, Awesome Lists, Agent Configs
8. **Evening slot** (0 UTC) fetches: Reddit, Twitter, YouTube, HN
9. **`generateBriefingTldr()`** returns `{ facts: string[], tryToday: string | null, insight: string | null }`
10. **`saveBriefing()`** upserts a row in the briefings table
11. **`getTimelineData(7)`** returns last 7 days of briefings with hydrated items
12. **`vercel.json`** has schedule `"0 0,12,18 * * *"` (single cron, 3 run times)
13. **TimelineFeed** renders briefings grouped by date, newest-first
14. **BriefingCard** shows TL;DR always visible, detail sections collapsible
15. **Most recent briefing** defaults to expanded
16. **Empty state** displays gracefully when no briefings exist
17. **DashboardLayout.tsx** is preserved (not deleted)
18. **Existing components** (LatestNews, SentimentGauge, etc.) render correctly inside BriefingCard detail sections

## Validation Commands

```bash
# TypeScript check
npx tsc --noEmit

# Production build
npm run build

# Dev server starts
npm run dev -- -p 3001

# Manual slot trigger (morning)
curl -s -H "Authorization: Bearer $CRON_SECRET" "http://localhost:3001/api/cron/aggregate?slot=morning&force=true" | jq '.slot, .success, .sources'

# Manual slot trigger (midday)
curl -s -H "Authorization: Bearer $CRON_SECRET" "http://localhost:3001/api/cron/aggregate?slot=midday&force=true" | jq '.slot, .success, .sources'

# Manual slot trigger (evening)
curl -s -H "Authorization: Bearer $CRON_SECRET" "http://localhost:3001/api/cron/aggregate?slot=evening&force=true" | jq '.slot, .success, .sources'

# Verify briefings in DB
curl -s "http://localhost:3001/api/health" | jq '.'

# Verify page renders
curl -s "http://localhost:3001/" | head -50
```

## Notes

- **Backward Compatibility**: The old `getDashboardData()` and `DashboardLayout` are preserved. If timeline rendering fails, a future fallback could re-enable the classic view.
- **Security Notes**: All DB queries use parameterized statements via `@libsql/client` (no string interpolation). The `?slot=` query param is validated against the `BriefingSlot` union type — invalid values fall back to auto-detection. The `renderMarkdown()` function uses React JSX elements (not raw HTML), preventing XSS. CRON_SECRET auth check is unchanged from the existing implementation.
- **Vercel Hobby Cron Limit**: Solved with single cron entry using comma-separated hours (`0 0,12,18 * * *`). Leaves one cron slot free.
- **Slot Overlap Sources**: HN appears in both morning and evening. GitHub appears in morning and midday. This is intentional — the items table deduplicates by URL, and different times of day surface different content.
- **Revalidation**: Consider reducing `revalidate` from 86400 (24h) to 21600 (6h) or even 3600 (1h) since content now updates 3x/day.
- **Future Enhancements**: New sources (Discord, Anthropic docs changelog), repo intelligence (skill gaps, similar projects), audio briefings. These are tracked in `specs/coffee-v2-plan.md` as Priorities 3-4. Deferred because: Discord requires bot token research, Anthropic docs has no known RSS feed, and repo intelligence depends on the 3x pipeline being stable first.
- **Task Dependency Graph**: `add-types` → (`add-db` | `add-tldr` | `create-badge` | `create-tldr`) → `modify-cron` → `update-cron` → `validate-all`. UI path: `create-badge` + `create-tldr` → `create-card` → `create-timeline` → `update-page` → `validate-all`.

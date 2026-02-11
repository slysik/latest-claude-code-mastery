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

This approach is additive — existing components (LatestNews, SentimentGauge, etc.) are wrapped inside briefing cards, not rewritten. The old `DashboardLayout` is preserved as a fallback. Each fetcher runs independently; a single fetcher failure does not block briefing creation. Briefing creation is idempotent — if a briefing for a given date+slot already exists, the pipeline exits without modification (unless `?force=true`).

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
2. Add `getCurrentSlot()` and `getEditorialDate()` utilities to the cron route
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
  date: string                 // YYYY-MM-DD (editorial date — see getEditorialDate())
  runAt: string                // ISO timestamp
  tldr: BriefingTldr
  itemCount: number
  items: ClassifiedItem[]      // Hydrated from items table via stored item_ids
  sentiment: SentimentDailySnapshot | null
  changelog: ChangelogHighlight[]
  ecosystem: EcosystemEntry[]  // Loaded from ecosystem table (NOT from item_ids)
  patternOfTheDay: ClassifiedItem | null
  reviewTelemetry: ReviewTelemetrySummary | null
}

export interface UpcomingSlot {
  slot: BriefingSlot
  scheduledAt: string          // ISO timestamp (e.g., "2026-02-10T18:00:00Z")
}

export interface TimelineData {
  briefings: Briefing[]        // Ordered newest-first
  upcomingSlots: UpcomingSlot[] // Slots not yet run today, server-computed
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
  item_ids TEXT DEFAULT '[]',          -- JSON array of item IDs snapshotted at pipeline time
  item_count INTEGER DEFAULT 0,
  sentiment_snapshot TEXT,             -- JSON snapshot of sentiment data at pipeline time
  fetcher_status TEXT DEFAULT '{}',    -- JSON: {"reddit":"ok","twitter":"error",...}
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_briefings_slot_date ON briefings(slot, date);
```

**Key design decision**: Store `item_ids` (JSON array) and `sentiment_snapshot` (JSON) directly in the briefings row. This ensures historical briefings always show the exact items that were present when the briefing ran, even if items are later pruned or re-classified. The `getTimelineData()` function fetches items by their stored IDs (`WHERE id IN (...)`) rather than re-deriving by source/date filtering.

**Important**: `item_ids` stores IDs from the `items` table only (ClassifiedItem). Ecosystem data (EcosystemEntry[]) is stored in the separate `ecosystem` table and fetched by date — it is NOT stored in `item_ids`. This means the midday briefing may have a small `item_ids` array (just GitHub items) but a rich `ecosystem` array loaded separately.

**2b. Add `saveBriefing()` function:**

```typescript
export async function saveBriefing(briefing: {
  slot: BriefingSlot
  date: string
  runAt: string
  tldr: BriefingTldr
  itemIds: number[]            // Snapshot of item IDs from this pipeline run
  itemCount: number
  sentimentSnapshot: SentimentDailySnapshot | null
  fetcherStatus: Record<string, string>
}): Promise<void> {
  await initSchema()
  const db = getDb()
  await db.execute({
    sql: `
      INSERT INTO briefings (slot, date, run_at, tldr_facts, tldr_try_today, tldr_insight, item_ids, item_count, sentiment_snapshot, fetcher_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(slot, date) DO UPDATE SET
        run_at = excluded.run_at,
        tldr_facts = excluded.tldr_facts,
        tldr_try_today = excluded.tldr_try_today,
        tldr_insight = excluded.tldr_insight,
        item_ids = excluded.item_ids,
        item_count = excluded.item_count,
        sentiment_snapshot = excluded.sentiment_snapshot,
        fetcher_status = excluded.fetcher_status
    `,
    args: [
      briefing.slot,
      briefing.date,
      briefing.runAt,
      JSON.stringify(briefing.tldr.facts),
      briefing.tldr.tryToday,
      briefing.tldr.insight,
      JSON.stringify(briefing.itemIds),
      briefing.itemCount,
      briefing.sentimentSnapshot ? JSON.stringify(briefing.sentimentSnapshot) : null,
      JSON.stringify(briefing.fetcherStatus),
    ],
  })
}
```

**2c. Add `getBriefing(date, slot)` function (for idempotency check):**

```typescript
export async function getBriefing(date: string, slot: BriefingSlot): Promise<Briefing | null>
```

Simple query: `SELECT * FROM briefings WHERE date = ? AND slot = ?`. Returns null if not found. Used by the cron route's idempotency guard (Task 4f).

**2d. Add `getItemsByIds(ids)` helper:**

```typescript
export async function getItemsByIds(ids: number[]): Promise<ClassifiedItem[]>
```

Batch-fetch items: `SELECT * FROM items WHERE id IN (...)`. Handle missing IDs gracefully — skip deleted items, don't error. This is important because `pruneOldData` may delete items referenced by older briefings.

**2e. Add `getTimelineData(days)` function:**

```typescript
export async function getTimelineData(days?: number): Promise<TimelineData>
```

Query the `briefings` table for the last N days (default 7), ordered by date DESC then slot order (evening > midday > morning). For each briefing row:
1. Parse `item_ids` JSON array from the row
2. Batch-fetch items using `getItemsByIds()` — gracefully handles missing IDs
3. Parse `sentiment_snapshot` JSON from the row (no separate query needed)
4. Fetch changelog data from `changelog_highlights` table by date
5. **Fetch ecosystem data from `ecosystem` table by date** — this is loaded separately from `item_ids` and populates the `ecosystem` field on the `Briefing` object. This is especially important for midday briefings where EcosystemGrid and PatternOfTheDay depend on this data.
6. Compute `upcomingSlots` via `getUpcomingSlots()`

Return `TimelineData` with all briefings hydrated.

**Important**: Items (ClassifiedItem[]) are fetched by their stored IDs via `getItemsByIds()`. Ecosystem data (EcosystemEntry[]) is fetched separately from the `ecosystem` table by date. These are two distinct data paths — `item_ids` never contains ecosystem entry references.

**2f. Add `getUpcomingSlots(date)` helper:**

```typescript
export async function getUpcomingSlots(date: string): Promise<UpcomingSlot[]>
```

For the given date, determine which slots haven't run yet by checking which (slot, date) combinations are missing from the briefings table. Return array with scheduled UTC times:
- morning: `${date}T12:00:00Z`
- midday: `${date}T18:00:00Z`
- evening: next day at `T00:00:00Z`

Used by the UI to show "coming at X PM" placeholders.

**2g. Extend `runPipelineTransaction()` with optional briefing parameter:**

Add an optional `briefingInput` parameter to the existing `runPipelineTransaction()` function signature. This is NOT a new overload — it's a single additional optional parameter with a default of `undefined`, so all existing call sites continue to work without changes.

```typescript
// Current signature (simplified):
export async function runPipelineTransaction(items: ClassifiedItem[], sentiment: ..., ...): Promise<void>

// New signature — SAME function, one new optional param:
export async function runPipelineTransaction(
  items: ClassifiedItem[],
  sentiment: ...,
  ...,
  briefingInput?: {           // <-- NEW optional param
    slot: BriefingSlot
    date: string
    runAt: string
    tldr: BriefingTldr
    itemCount: number
    fetcherStatus: Record<string, string>
  }
): Promise<void>
```

When `briefingInput` is provided, the function saves items to the `items` table, computes `sentimentSnapshot` from the current batch, collects the inserted item IDs, then inserts/upserts the briefings row — all within the same transaction. When `briefingInput` is `undefined`, behavior is identical to the current implementation.

**Why not a separate `saveBriefing()` call?** Atomicity. If `saveBriefing()` is called outside the transaction and fails, items exist but the briefing reference is lost. By including it in the transaction, either everything succeeds or nothing does.

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

**4a. Add slot detection and editorial date computation:**

```typescript
type BriefingSlot = 'morning' | 'midday' | 'evening'

function getCurrentSlot(): BriefingSlot {
  const hour = new Date().getUTCHours()
  if (hour >= 10 && hour < 16) return 'morning'
  if (hour >= 16 && hour < 22) return 'midday'
  return 'evening'
}

function getEditorialDate(slot: BriefingSlot): string {
  const now = new Date()
  // Evening slot fires at 0 UTC, which is the START of a new calendar day.
  // But the evening briefing content belongs to the PREVIOUS day (the day that just ended).
  // Without this adjustment, evening briefings would group with tomorrow's morning briefing.
  if (slot === 'evening' && now.getUTCHours() < 6) {
    // Subtract 1 day: the evening briefing at 2026-02-11T00:00:00Z belongs to 2026-02-10
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    return yesterday.toISOString().split('T')[0]
  }
  return now.toISOString().split('T')[0]
}
```

Allow `?slot=` query param override for testing. Fallback to `getCurrentSlot()`. The `getEditorialDate()` function computes the date used for grouping — this ensures evening briefings at 0 UTC group with that day's morning and midday briefings, not the next day's.

**4b. Define fetcher-to-slot mapping:**

```typescript
// Item fetchers (return FetchedItem[])
const SLOT_ITEM_FETCHERS: Record<BriefingSlot, (() => Promise<FetchedItem[]>)[]> = {
  morning: [fetchAnthropic, fetchGitHub, fetchRss, fetchHackerNews],
  midday:  [fetchGitHub],
  evening: [fetchReddit, fetchTwitter, fetchYouTube, fetchHackerNews],
}

// Ecosystem fetchers (return EcosystemEntry[], always run in midday only)
const SLOT_ECOSYSTEM_FETCHERS: Record<BriefingSlot, boolean> = {
  morning: false,
  midday: true,   // fetchAwesomeLists + fetchAgentConfigs
  evening: false,
}
```

**Important distinction**: `fetchAwesomeLists()` and `fetchAgentConfigs()` return `EcosystemEntry[]`, NOT `FetchedItem[]`. They populate the `ecosystem` table, not the `items` table. They only run during the mid-day slot. Item fetchers and ecosystem fetchers are handled in separate `Promise.allSettled()` blocks, matching the current pattern in the cron route (lines 67-85).

Note: `fetchGitHub` appears in morning and midday — morning focuses on releases, midday on trending repos/configs. The existing function returns both, so items get classified and filtered at the component level.

**4c. Replace the current hardcoded fetcher list** with `SLOT_ITEM_FETCHERS[slot]`. Keep the same `Promise.allSettled()` pattern. Only call ecosystem fetchers if `SLOT_ECOSYSTEM_FETCHERS[slot]` is true.

**4d. After classification and saving to DB**, call `generateBriefingTldr(slot, classified)` and pass the result along with item IDs to `runPipelineTransaction()` via the new optional `briefingInput` parameter.

**4e. Update the response JSON** to include `slot`, `editorialDate`, and `briefingId`.

**4f. Update idempotency check (mutex guard)**: Replace the existing `getSentimentSnapshot(today)` check with a new `getBriefing(editorialDate, slot)` query against the **briefings** table: `SELECT 1 FROM briefings WHERE slot = ? AND date = ?`. If it exists and `?force=true` is not set, return early. This is critical — the old check uses `sentiment_daily` which has a single row per date; with 3 slots/day, the midday and evening runs would incorrectly skip.

**4g. Resolve sentiment_daily multi-slot writes**: The existing `sentiment_daily` table has `date TEXT PRIMARY KEY` — only one row per day. With 3 slots/day, each slot's `runPipelineTransaction` would overwrite the previous slot's sentiment data. **Solution**: Keep writing to `sentiment_daily` ONLY during the evening slot (which has the community sources most relevant to overall sentiment). Morning and midday slots skip the sentiment_daily write. Per-slot sentiment is stored in the briefings table's `sentiment_snapshot` JSON field. The SentimentGauge history sparkline continues reading from `sentiment_daily` (one data point per day, from the evening run).

**4h. Atomic briefing write via extended `runPipelineTransaction()`**: Pass the new `briefingInput` parameter to `runPipelineTransaction()` so items + sentiment + briefing are saved atomically in a single transaction. The function collects inserted item IDs during the items write, computes `sentimentSnapshot` from the classified items, and upserts the briefing row — all within one transaction. Existing call sites that don't pass `briefingInput` behave identically to before.

**4i. Track fetcher status**: For each fetcher in the slot, record success/failure in a `fetcherStatus` object (e.g., `{"reddit":"ok","twitter":"error:timeout"}`). Pass this to the briefing save via `briefingInput.fetcherStatus`. The UI can optionally show a subtle indicator if a source failed.

**4j. TL;DR is best-effort**: If `generateBriefingTldr()` fails (Haiku rate limit, timeout, outage), still create the briefing with the fetched items. Store empty `facts: []` and `null` for tldr fields. The `TldrSection` component handles null gracefully (shows items without summary). Items are always more valuable than summaries.

**4k. Vercel maxDuration**: The midday slot runs ecosystem fetchers (AwesomeLists scraping, AgentConfigs) in addition to GitHub. These can be slow. Consider setting `export const maxDuration = 60` in the route file (Vercel Hobby allows up to 60s for serverless functions). The existing pipeline already runs in ~15-25s; the ecosystem enrichment may add 10-20s. Monitor actual timing after deployment.

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
- Handle empty `facts` array gracefully (show a "No summary available" message)
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
    - Morning: LatestNews(items), DiffOfTheDay(items)
    - Mid-day: EcosystemGrid(ecosystem), PatternOfTheDay(patternOfTheDay), ModelMixMonitor
    - Evening: LatestNews(items), SentimentGauge(sentiment), YouTubeCarousel(items)
    Source links at bottom
  </div>
</article>
```

**Data flow per slot:**
- Morning & Evening: Pass `briefing.items` (ClassifiedItem[]) to LatestNews, DiffOfTheDay, YouTubeCarousel
- Mid-day: Pass `briefing.ecosystem` (EcosystemEntry[]) to EcosystemGrid, pass `briefing.patternOfTheDay` to PatternOfTheDay. Note: `briefing.items` may be small (just GitHub items) — the mid-day slot's richness comes from ecosystem data, not items.
- Evening: Pass `briefing.sentiment` (SentimentDailySnapshot | null) to SentimentGauge

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
6. Add a fallback: if `getTimelineData()` returns zero briefings, render the legacy `DashboardLayout` using `getDashboardData()` instead. This handles the first-deployment scenario where no briefings exist yet.

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
3. **`briefings` table** exists in Turso schema with columns: id, slot, date, run_at, tldr_facts, tldr_try_today, tldr_insight, item_ids, item_count, sentiment_snapshot, fetcher_status, created_at
4. **Unique index** on `(slot, date)` prevents duplicate briefings per slot per day
5. **Cron route** accepts `?slot=morning|midday|evening` override and auto-detects from UTC hour when not provided
6. **Morning slot** (12 UTC) fetches: Anthropic, GitHub, RSS, HN
7. **Mid-day slot** (18 UTC) fetches: GitHub items + Awesome Lists + Agent Configs (ecosystem)
8. **Evening slot** (0 UTC) fetches: Reddit, Twitter, YouTube, HN
9. **`getEditorialDate('evening')`** at 0 UTC returns previous day's date (e.g., 2026-02-10, not 2026-02-11)
10. **`generateBriefingTldr()`** returns `{ facts: string[], tryToday: string | null, insight: string | null }`
11. **`saveBriefing()`** upserts a row in the briefings table
12. **`getTimelineData(7)`** returns last 7 days of briefings with hydrated items AND ecosystem data
13. **`vercel.json`** has schedule `"0 0,12,18 * * *"` (single cron, 3 run times)
14. **TimelineFeed** renders briefings grouped by date, newest-first
15. **BriefingCard** shows TL;DR always visible, detail sections collapsible
16. **Mid-day BriefingCard** passes `briefing.ecosystem` to EcosystemGrid (not items)
17. **Most recent briefing** defaults to expanded
18. **Empty state** displays gracefully when no briefings exist
19. **DashboardLayout.tsx** is preserved (not deleted)
20. **Existing components** (LatestNews, SentimentGauge, etc.) render correctly inside BriefingCard detail sections
21. **Idempotency check** queries the briefings table using editorial date (not sentiment_daily)
22. **sentiment_daily** is only written during the evening slot; morning/midday store per-slot sentiment in briefings.sentiment_snapshot
23. **Items + briefing saved atomically** via extended `runPipelineTransaction()`
24. **Ecosystem fetchers** (Awesome Lists, Agent Configs) only run during midday slot
25. **Missing item IDs** handled gracefully — `getItemsByIds()` skips deleted items
26. **First deployment** with zero briefings falls back to legacy DashboardLayout
27. **Idempotency verified** — running same slot+date twice without `?force=true` returns early
28. **Legacy fallback verified** — page renders DashboardLayout when briefings table is empty

## Validation Commands

```bash
# TypeScript check
npx tsc --noEmit

# Production build
npm run build

# Dev server starts
npm run dev -- -p 3001

# Manual slot trigger (morning)
curl -s -H "Authorization: Bearer $CRON_SECRET" "http://localhost:3001/api/cron/aggregate?slot=morning&force=true" | jq '.slot, .editorialDate, .success, .sources'

# Manual slot trigger (midday)
curl -s -H "Authorization: Bearer $CRON_SECRET" "http://localhost:3001/api/cron/aggregate?slot=midday&force=true" | jq '.slot, .editorialDate, .success, .sources'

# Manual slot trigger (evening)
curl -s -H "Authorization: Bearer $CRON_SECRET" "http://localhost:3001/api/cron/aggregate?slot=evening&force=true" | jq '.slot, .editorialDate, .success, .sources'

# Verify idempotency — re-running morning without force should exit early
curl -s -H "Authorization: Bearer $CRON_SECRET" "http://localhost:3001/api/cron/aggregate?slot=morning" | jq '.skipped'

# Verify page renders timeline
curl -s "http://localhost:3001/" | grep -c "TimelineFeed\|BriefingCard\|briefing-badge"

# Verify legacy fallback — before any cron runs, page should show DashboardLayout
# (Test by using a fresh DB or checking the fallback logic in page.tsx)

# Verify evening editorial date at 0 UTC
curl -s -H "Authorization: Bearer $CRON_SECRET" "http://localhost:3001/api/cron/aggregate?slot=evening&force=true" | jq '.editorialDate'
# Should return today's date (not tomorrow), even when run at 0 UTC
```

## Review History

This plan was refined through 7 review cycles (2 local + 2 cross-model + 3 Claude) before finalization.

### Review #0A: Kimi Simplicity Review (Local)
- **Model**: Kimi 2.5 (local via Ollama)
- **Reviewer Focus**: Simplicity, ease of use, over-engineering, dependency minimalism
- **Critical Complexity Found**: 0
- **Key Changes Made**: Clarified task dependencies, expanded the update-page task description, ensured task descriptions are self-contained for independent worker execution

### Review #0B: Ollama Security Review (Local)
- **Model**: llama3.2:3b (local via Ollama)
- **Reviewer Focus**: Security vulnerabilities, auth, input validation, data protection
- **Critical Security Issues Found**: 0 (existing patterns already use parameterized queries and JSX escaping)
- **Key Changes Made**: Added explicit security notes confirming parameterized SQL via `@libsql/client`, React JSX escaping for markdown rendering, and CRON_SECRET auth preservation

### Review #1A: Codex Architecture Review (Cross-Model)
- **Model**: codex-mini-latest (OpenAI Responses API)
- **Reviewer Focus**: Architecture blind spots, solution approach, completeness
- **Critical Issues Found**: 0 (Codex refused to review — API returned a policy refusal, not an architecture critique)
- **Key Changes Made**: Minimal — logged the refusal and proceeded per workflow instructions

### Review #1C: Gemini Architecture Review (Cross-Model)
- **Model**: gemini-2.5-flash (Google GenAI SDK)
- **Reviewer Focus**: Architecture blind spots, second cross-model perspective
- **Critical Issues Found**: 1 — Data model integrity: re-deriving items on page load from source/date filtering would show wrong items for historical briefings
- **Key Changes Made**: Added `item_ids` (JSON array) and `sentiment_snapshot` (JSON) columns to briefings table. Items are now fetched by stored IDs, not re-derived. Added `UpcomingSlot` type with `scheduledAt`. Added component data expectations.

### Review #1B: Claude Architecture Review
- **Reviewer Focus**: Solution approach, component design, technology choices
- **Critical Issues Found**: 0
- **Key Changes Made**: Added mutex guard (idempotency check on briefings table), fetcher_status JSON column, TL;DR best-effort policy (null graceful handling), UpcomingSlot type with scheduledAt

### Review #2: Implementation Feasibility
- **Reviewer Focus**: Task decomposition, edge cases, worker context
- **Critical Issues Found**: 4 — (1) Idempotency check used wrong table (sentiment_daily vs briefings), (2) sentiment_daily multi-slot conflict (one row per day, 3 writes would overwrite), (3) runPipelineTransaction atomicity needed for briefing write, (4) Ecosystem fetchers return EcosystemEntry[] not FetchedItem[]
- **Key Changes Made**: Idempotency queries briefings table; sentiment_daily written only in evening slot; extended runPipelineTransaction with optional briefingInput param; separated SLOT_ITEM_FETCHERS from SLOT_ECOSYSTEM_FETCHERS; added 6 explicitly enumerated DB functions; added first-deployment fallback; expanded acceptance criteria from 18 to 24

### Review #3: Quality Gate
- **Verdict**: CONDITIONAL PASS
- **Confidence Score**: 7/10
- **Final Adjustments**: (1) Clarified runPipelineTransaction evolution as optional param addition (not overload) with backward-compatible signature, (2) Added `getEditorialDate()` function resolving evening 0-UTC date grouping issue, (3) Documented ecosystem data flow in BriefingCard — mid-day passes ecosystem[] to EcosystemGrid separately from items, (4) Added validation commands for idempotency and legacy fallback, (5) Added maxDuration note for mid-day ecosystem enrichment, (6) Expanded acceptance criteria to 28 items
- **Top Risk**: Evening slot editorial date computation — if `getEditorialDate()` is not used consistently (e.g., in idempotency check vs briefing save), evening briefings could end up on the wrong day. Mitigation: compute editorial date once at the top of the route handler and pass it to all downstream functions.

### Draft History
- Draft 1: `specs/drafts/coffee-v2-timeline-draft-1.md` (initial)
- Draft 2: `specs/drafts/coffee-v2-timeline-draft-2.md` (post Kimi simplicity review)
- Draft 3: `specs/drafts/coffee-v2-timeline-draft-3.md` (post Ollama security review)
- Draft 4: `specs/drafts/coffee-v2-timeline-draft-4.md` (post Codex review)
- Draft 5: `specs/drafts/coffee-v2-timeline-draft-5.md` (post Gemini review)
- Draft 6: `specs/drafts/coffee-v2-timeline-draft-6.md` (post Claude architecture review)
- Draft 7: `specs/drafts/coffee-v2-timeline-draft-7.md` (post implementation review)
- Final: `specs/coffee-v2-timeline.md` (post quality gate)

## Notes

- **Backward Compatibility**: The old `getDashboardData()` and `DashboardLayout` are preserved. If timeline rendering fails, a future fallback could re-enable the classic view.
- **Security Notes**: All DB queries use parameterized statements via `@libsql/client` (no string interpolation). The `?slot=` query param is validated against the `BriefingSlot` union type — invalid values fall back to auto-detection. The `renderMarkdown()` function uses React JSX elements (not raw HTML), preventing XSS. CRON_SECRET auth check is unchanged from the existing implementation.
- **Vercel Hobby Cron Limit**: Solved with single cron entry using comma-separated hours (`0 0,12,18 * * *`). Leaves one cron slot free.
- **Vercel maxDuration**: The midday slot runs ecosystem fetchers that can be slow. Set `export const maxDuration = 60` in the route file. Vercel Hobby allows up to 60s.
- **Slot Overlap Sources**: HN appears in both morning and evening. GitHub appears in morning and midday. This is intentional — the items table deduplicates by URL, and different times of day surface different content.
- **Editorial Date Rule**: The evening cron fires at 0 UTC, which is technically the start of a new calendar day. `getEditorialDate('evening')` subtracts one day so the evening briefing groups with that day's morning and midday briefings in the timeline.
- **Revalidation**: Changed from 86400 (24h) to 3600 (1h) since content now updates 3x/day.
- **Task Dependency Graph**: `add-types` → (`add-db` | `add-tldr` | `create-badge` | `create-tldr`) → `modify-cron` → `update-cron` → `validate-all`. UI path: `create-badge` + `create-tldr` → `create-card` → `create-timeline` → `update-page` → `validate-all`.
- **Future Enhancements**: New sources (Discord, Anthropic docs changelog), repo intelligence (skill gaps, similar projects), audio briefings. These are tracked in `specs/coffee-v2-plan.md` as Priorities 3-4. Deferred because: Discord requires bot token research, Anthropic docs has no known RSS feed, and repo intelligence depends on the 3x pipeline being stable first.

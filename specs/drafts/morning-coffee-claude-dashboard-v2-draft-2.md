# Plan: Morning with Coffee & Claude Dashboard

## Task Description
Build "Morning with Coffee & Claude" — a resilient, observable Next.js 15 dashboard that ingests 6+ Claude Code ecosystem sources daily (Reddit, YouTube, GitHub, Anthropic, X/Twitter, Substack), applies AI-driven sentiment classification and editorial summarization via Claude Haiku, and serves a static ISR-rendered newspaper-style page. The data pipeline must complete within Vercel's serverless function timeout, use transactional writes to Turso (edge SQLite), and include data retention policies to stay within the free tier. Deployed on Vercel with Node.js runtime for production stability.

## Objective
When this plan is complete, there will be a fully functional Next.js 15 app at `apps/morning-with-coffee-and-claude/` that:
1. Fetches, deduplicates, ranks, and stores data from 6 sources daily with retry semantics and per-source error isolation
2. Classifies community sentiment and generates an editorial summary using Claude Haiku, with exponential backoff retries and graceful degradation
3. Renders all 7 dashboard sections with Anthropic's warm, newspaper-style design, with per-section error boundaries via try/catch in server components
4. Deploys to Vercel (Node.js runtime) with a secure daily cron-triggered data pipeline, backed by Turso for persistent edge storage
5. Uses transactional writes to guarantee pipeline atomicity — no partial state on crash
6. Includes database indexes on hot query paths and a 90-day data retention policy
7. Costs < $5/month to operate

## Problem Statement
The Claude Code ecosystem is exploding across 6+ scattered sources (Reddit 483k+96k members, YouTube tutorials, GitHub plugins, Anthropic docs, X, Substack). Keeping up requires checking all sources daily. There's no single curated view of what matters.

## Solution Approach
A Next.js 15 (App Router) static site with ISR (24hr revalidation matching daily cron cadence), using **Node.js runtime** (not Bun) for Vercel deployment stability. A server-side data pipeline fetches from all 6 sources in parallel using `Promise.allSettled`, Claude Haiku batch-classifies sentiment and generates the editorial (with exponential backoff retries), and Turso (edge SQLite via `@libsql/client`) stores daily snapshots with last-known-good fallback. The frontend renders 7 newspaper-style sections using Anthropic's design tokens. All data interfaces are defined in a shared `types.ts` contract that enables parallel builder work.

**Key architecture decisions (post-review):**
- **Turso over local SQLite**: Vercel's ephemeral serverless filesystem can't persist a local `.db` file. Turso provides SQLite-compatible edge storage (free tier: 9GB, 500M reads/mo).
- **Node.js runtime on Vercel**: Bun support in Next.js on Vercel is experimental. Use officially supported Node.js runtime for production stability. Bun is used only locally for development (`bun install`, `bun run dev`).
- **Tailwind 3.4.x**: Pinned over v4 because design system uses `tailwind.config.ts` style configuration. V4 uses incompatible CSS-first model.
- **`next/font/google`**: Self-hosts fonts at build time automatically — no CDN at runtime.
- **Server-side error handling via try/catch**: Not React ErrorBoundary classes (which don't work in Server Components). Each section wrapped in try/catch with fallback UI.
- **Client Components**: FilterChips, EcosystemGrid, LatestNews, YouTubeCarousel marked `'use client'` for interactivity. Data passed as serializable props from server parent.
- **Cron endpoint in integration task**: Prevents hidden dependency — the cron endpoint imports from all fetchers + AI layer, so it must be built after both.
- **`serverExternalPackages`**: `@libsql/client`, `rss-parser`, and `cheerio` excluded from Next.js bundling (native/CJS modules).
- **Sentiment snapshot JOIN strategy**: `topPositive`/`topNegative` stored as item IDs (integers) in `sentiment_daily` table; `getSentimentSnapshot()` performs a JOIN to hydrate full `ClassifiedItem` objects.
- **Items table includes AI columns**: `is_tip`, `tip_confidence`, `one_line_quote` columns in the `items` DDL.
- **Transactional pipeline writes**: `insertItems()` + `upsertSentimentSnapshot()` wrapped in a Turso batch/transaction to guarantee atomicity. No partial state on crash.
- **Database indexes**: `CREATE INDEX` on `items(date)`, `items(source)`, `items(created_at)` for fast query paths.
- **Data retention**: Automated cleanup in cron endpoint — delete items older than 90 days and sentiment snapshots older than 1 year. Keeps Turso within 9GB free tier.
- **Upsert for items**: `INSERT INTO ... ON CONFLICT(url) DO UPDATE SET` for engagement metrics and metadata, so re-fetched items get updated scores.
- **HTML parsing with Cheerio**: Anthropic blog/changelog fetcher uses `cheerio` for robust HTML parsing instead of brittle regex.
- **Content sanitization**: All user-generated content (excerpts, quotes) stripped of HTML tags before storage to prevent XSS.

## Relevant Files
Use these files to complete the task:

- `specs/claude-code-pulse-dashboard.md` — Full product spec with layout wireframes, design system, SQLite schema, data pipeline architecture, and API requirements
- `apps/task-manager/package.json` — Reference for Bun project conventions
- `apps/task-manager/tsconfig.json` — Reference for TypeScript config patterns

### New Files
- `apps/morning-with-coffee-and-claude/package.json`
- `apps/morning-with-coffee-and-claude/next.config.js`
- `apps/morning-with-coffee-and-claude/tailwind.config.ts`
- `apps/morning-with-coffee-and-claude/postcss.config.js`
- `apps/morning-with-coffee-and-claude/tsconfig.json`
- `apps/morning-with-coffee-and-claude/vercel.json`
- `apps/morning-with-coffee-and-claude/.env.local.example`
- `apps/morning-with-coffee-and-claude/src/app/layout.tsx`
- `apps/morning-with-coffee-and-claude/src/app/page.tsx`
- `apps/morning-with-coffee-and-claude/src/app/loading.tsx`
- `apps/morning-with-coffee-and-claude/src/app/api/cron/aggregate/route.ts`
- `apps/morning-with-coffee-and-claude/src/app/api/health/route.ts`
- `apps/morning-with-coffee-and-claude/src/lib/types.ts`
- `apps/morning-with-coffee-and-claude/src/lib/db.ts`
- `apps/morning-with-coffee-and-claude/src/lib/seed.ts`
- `apps/morning-with-coffee-and-claude/src/lib/sanitize.ts`
- `apps/morning-with-coffee-and-claude/src/lib/fetchers/index.ts`
- `apps/morning-with-coffee-and-claude/src/lib/fetchers/reddit.ts`
- `apps/morning-with-coffee-and-claude/src/lib/fetchers/youtube.ts`
- `apps/morning-with-coffee-and-claude/src/lib/fetchers/github.ts`
- `apps/morning-with-coffee-and-claude/src/lib/fetchers/anthropic.ts`
- `apps/morning-with-coffee-and-claude/src/lib/fetchers/twitter.ts`
- `apps/morning-with-coffee-and-claude/src/lib/fetchers/rss.ts`
- `apps/morning-with-coffee-and-claude/src/lib/sentiment.ts`
- `apps/morning-with-coffee-and-claude/src/lib/summarizer.ts`
- `apps/morning-with-coffee-and-claude/src/lib/ranker.ts`
- `apps/morning-with-coffee-and-claude/src/lib/deduper.ts`
- `apps/morning-with-coffee-and-claude/src/components/PulseSummary.tsx`
- `apps/morning-with-coffee-and-claude/src/components/LatestNews.tsx` — `'use client'`
- `apps/morning-with-coffee-and-claude/src/components/NewFeatures.tsx`
- `apps/morning-with-coffee-and-claude/src/components/SentimentGauge.tsx`
- `apps/morning-with-coffee-and-claude/src/components/EcosystemGrid.tsx` — `'use client'`
- `apps/morning-with-coffee-and-claude/src/components/YouTubeCarousel.tsx` — `'use client'`
- `apps/morning-with-coffee-and-claude/src/components/TopTips.tsx`
- `apps/morning-with-coffee-and-claude/src/components/FilterChips.tsx` — `'use client'`
- `apps/morning-with-coffee-and-claude/src/components/SentimentBadge.tsx`
- `apps/morning-with-coffee-and-claude/src/components/SectionErrorFallback.tsx`
- `apps/morning-with-coffee-and-claude/src/components/ui/Card.tsx`
- `apps/morning-with-coffee-and-claude/src/components/ui/Badge.tsx`
- `apps/morning-with-coffee-and-claude/src/components/ui/Sparkline.tsx`
- `apps/morning-with-coffee-and-claude/src/components/ui/Gauge.tsx`
- `apps/morning-with-coffee-and-claude/src/styles/globals.css`

## Implementation Phases

### Phase 1: Foundation
- Scaffold Next.js 15 app with Node.js runtime (Bun for local dev only)
- Create shared `types.ts` FIRST — this is the contract for all parallel builders
- Configure Tailwind CSS 3.4.x with Anthropic design tokens + PostCSS config
- Load fonts via `next/font/google` (auto self-hosted at build time)
- Set up Turso connection with lazy init + `CREATE TABLE IF NOT EXISTS` + indexes
- Items table DDL includes AI columns + indexes on `date`, `source`, `created_at`
- Transactional write helpers for atomic pipeline operations
- Define typed db query functions (getDashboardData, getLatestItems, etc.)
- `db.ts` imports ONLY from `types.ts` — no cross-imports
- Create seed.ts with idempotent seed data for development
- Create `sanitize.ts` — strip HTML tags from user-generated content
- Build base UI components, loading.tsx, and page skeleton

### Phase 2: Core Implementation (3 builders in parallel)
- **Fetchers**: All 6 data fetchers + barrel export (index.ts) + ranker + deduper, all returning `FetchedItem[]`. Anthropic fetcher uses Cheerio for HTML parsing.
- **AI Layer**: Haiku sentiment classifier + editorial summarizer with retries, health endpoint
- **Components**: All 7 dashboard sections + page.tsx with mock data, respecting server/client boundaries

### Phase 3: Integration & Polish
- Wire cron endpoint (imports all fetchers + AI layer)
- Transactional writes + idempotency check + data retention cleanup
- Connect components to real Turso data
- ISR revalidation, responsive layout, error handling, deployment config

## Team Orchestration

- You operate as the team lead and orchestrate the team to execute the plan.
- You NEVER operate directly on the codebase. You use Task and Task* tools.

### Team Members

- Builder
  - Name: builder-scaffold
  - Role: Project scaffolding, shared types, config files, design system, Turso setup (with AI columns, indexes, transaction helpers), sanitize.ts, base UI components, seed data, loading.tsx
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: builder-fetchers
  - Role: All 6 data source fetchers (Anthropic uses Cheerio) + barrel export (fetchers/index.ts) + ranking + dedup logic
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: builder-ai-layer
  - Role: Haiku sentiment classifier, editorial summarizer, tip detector, health check endpoint
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: builder-components
  - Role: All 7 dashboard section components + SectionErrorFallback + FilterChips + SentimentBadge + main page.tsx
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: builder-integration
  - Role: Cron endpoint (with transactional writes, retention cleanup), wire real data to components, ISR config, responsive layout, error handling, Vercel config
  - Agent Type: builder
  - Resume: true

- Validator
  - Name: validator-final
  - Role: Verify all acceptance criteria and run validation commands
  - Agent Type: validator
  - Resume: false

## Step by Step Tasks

### 1. Project Scaffolding, Shared Types & Design System
- **Task ID**: scaffold
- **Depends On**: none
- **Assigned To**: builder-scaffold
- **Agent Type**: builder
- **Parallel**: false
- **Priority order** (most critical first — types.ts enables all parallel work):

**Step 1a — Shared Types (CREATE FIRST)**:
- Create `src/lib/types.ts` — THE shared type contract for ALL builders:
  ```typescript
  // All types must be serializable (no Date objects, no functions) for server→client prop passing
  export interface FetchedItem {
    id?: number;
    date: string;                    // 'YYYY-MM-DD'
    source: 'reddit' | 'youtube' | 'github' | 'x' | 'anthropic' | 'substack';
    category: 'news' | 'feature' | 'tip' | 'plugin' | 'video';
    title: string;
    url: string;
    author: string | null;
    excerpt: string | null;
    thumbnailUrl: string | null;
    engagementScore: number;         // Normalized 0-1
    rawMetrics: Record<string, number>;  // {upvotes, views, stars, likes, comments}
    fetchedAt: string;               // ISO timestamp
    createdAt: string;               // Source publish date ISO
  }

  export interface ClassifiedItem extends FetchedItem {
    sentiment: 'positive' | 'neutral' | 'negative' | null;
    sentimentConfidence: number | null;
    topicTags: string[];
    oneLineQuote: string | null;
    isTip: boolean;
    tipConfidence: number | null;
  }

  export interface SentimentDailySnapshot {
    date: string;
    positivePct: number;
    neutralPct: number;
    negativePct: number;
    sampleSize: number;
    topPositive: ClassifiedItem | null;  // Hydrated via JOIN on item ID
    topNegative: ClassifiedItem | null;  // Hydrated via JOIN on item ID
    summary: string;
  }

  export interface EcosystemEntry {
    id?: number;
    name: string;
    type: 'hook' | 'plugin' | 'skill' | 'mcp_server';
    author: string | null;
    description: string | null;
    githubUrl: string | null;
    stars: number;
    lastUpdated: string | null;
    categoryTags: string[];
    mentionCount: number;
  }

  export interface DashboardData {
    items: ClassifiedItem[];
    sentiment: SentimentDailySnapshot | null;
    sentimentHistory: SentimentDailySnapshot[];  // Last 30 days
    ecosystem: EcosystemEntry[];
    lastUpdated: string | null;
  }
  ```

**Step 1b — Project Config**:
- Create directory structure for all ~40 files
- Create `package.json`:
  - Dependencies: `next@15`, `react@19`, `react-dom@19`, `tailwindcss@3.4`, `@libsql/client`, `@anthropic-ai/sdk`, `rss-parser`, `cheerio`
  - DevDependencies: `typescript`, `@types/react`, `@types/node`, `postcss`, `autoprefixer`
  - Scripts: `dev: next dev`, `build: next build`, `start: next start`
- Create `next.config.js`:
  ```javascript
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    serverExternalPackages: ['@libsql/client', 'rss-parser', 'cheerio'],
  }
  module.exports = nextConfig
  ```
- Create `tsconfig.json` with strict mode, ESNext target, bundler module resolution, path aliases (`@/*` → `src/*`)
- Create `tailwind.config.ts` (Tailwind 3.4.x) with full Anthropic design tokens:
  - Colors: dark (#141413), light (#faf9f5), mid-gray (#b0aea5), light-gray (#e8e6dc), orange (#d97757), blue (#6a9bcc), green (#788c5d)
  - Fonts: Poppins (heading), Lora (body), JetBrains Mono (mono)
  - Font sizes: display/h1/h2/h3/body/small/xs with line-height and weight
- Create `postcss.config.js`:
  ```javascript
  module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }
  ```
- Create `src/styles/globals.css` with `@tailwind base; @tailwind components; @tailwind utilities;`
- Create `vercel.json`:
  ```json
  { "crons": [{ "path": "/api/cron/aggregate", "schedule": "0 6 * * *" }] }
  ```

**Step 1c — Layout & Fonts**:
- Create `src/app/layout.tsx` — root layout using `next/font/google` for Poppins (400/500/600) + Lora (400/500/600). Add `generateMetadata()` with OG tags. Apply font CSS variables and theme wrapper with `bg-anthropic-light`.

**Step 1d — Database Layer**:
- Create `src/lib/db.ts` — Turso connection using `@libsql/client`:
  - **Imports only from `types.ts`** — no cross-imports from fetchers, sentiment, or other modules
  - Lazy init pattern: `getDb()` creates client on first call, caches in module scope
  - `CREATE TABLE IF NOT EXISTS` for items, sentiment_daily, ecosystem
  - **Items table DDL** with AI columns + indexes:
    ```sql
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      source TEXT NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      author TEXT,
      excerpt TEXT,
      thumbnail_url TEXT,
      engagement_score REAL DEFAULT 0,
      raw_metrics TEXT DEFAULT '{}',
      sentiment TEXT,
      sentiment_confidence REAL,
      topic_tags TEXT DEFAULT '[]',
      one_line_quote TEXT,
      is_tip INTEGER DEFAULT 0,
      tip_confidence REAL,
      fetched_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_items_date ON items(date);
    CREATE INDEX IF NOT EXISTS idx_items_source ON items(source);
    CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at);
    ```
  - **Sentiment daily table** stores top item IDs:
    ```sql
    CREATE TABLE IF NOT EXISTS sentiment_daily (
      date TEXT PRIMARY KEY,
      positive_pct REAL,
      neutral_pct REAL,
      negative_pct REAL,
      sample_size INTEGER,
      top_positive_id INTEGER REFERENCES items(id),
      top_negative_id INTEGER REFERENCES items(id),
      summary TEXT
    );
    ```
  - JSON columns parsed/stringified in query functions — consumers get typed objects
  - **Upsert for items**: `INSERT INTO items (...) VALUES (...) ON CONFLICT(url) DO UPDATE SET engagement_score=excluded.engagement_score, raw_metrics=excluded.raw_metrics, excerpt=excluded.excerpt` — keeps scores fresh on re-fetch
  - **Transactional write helper**: `runPipelineTransaction(items: ClassifiedItem[], snapshot: SentimentDailySnapshot): Promise<void>` — uses Turso batch mode (`db.batch([...])`) to execute insertItems + upsertSentimentSnapshot atomically. If any statement fails, the entire batch rolls back.
  - **Data retention helper**: `pruneOldData(itemDays: number, snapshotDays: number): Promise<{deletedItems: number, deletedSnapshots: number}>` — `DELETE FROM items WHERE date < date('now', '-N days')`, same for sentiment_daily. Called at the end of each cron run.
  - **Exported typed query functions**:
    - `getDashboardData(): Promise<DashboardData>`
    - `getLatestItems(date?: string, limit?: number): Promise<ClassifiedItem[]>`
    - `getSentimentSnapshot(date?: string): Promise<SentimentDailySnapshot | null>` — **JOINs** `sentiment_daily` with `items` on `top_positive_id` and `top_negative_id` to hydrate full `ClassifiedItem` objects
    - `getSentimentHistory(days?: number): Promise<SentimentDailySnapshot[]>` — defaults to 30 days; JOINs for top items
    - `getEcosystemEntries(type?: string): Promise<EcosystemEntry[]>`
    - `insertItems(items: ClassifiedItem[]): Promise<void>` — uses `ON CONFLICT(url) DO UPDATE` for engagement/metadata
    - `upsertSentimentSnapshot(snapshot: SentimentDailySnapshot): Promise<void>`
    - `upsertEcosystemEntries(entries: EcosystemEntry[]): Promise<void>`
    - `runPipelineTransaction(items, snapshot): Promise<void>` — atomic batch write
    - `pruneOldData(itemDays?, snapshotDays?): Promise<{deletedItems, deletedSnapshots}>`
  - On Turso connection failure: log error, return seed/fallback data

**Step 1d-2 — Sanitization Utility**:
- Create `src/lib/sanitize.ts` — strip HTML tags and XSS vectors from user-generated content:
  ```typescript
  export function stripHtml(input: string | null): string | null {
    if (!input) return null;
    return input.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
  }
  ```
  - Used by all fetchers before constructing `FetchedItem` objects
  - Strips HTML tags, decodes entities, trims whitespace

- Create `src/lib/seed.ts` — exports `seedDatabase()`: checks if data exists (idempotent), inserts 10-15 sample items, 1 sentiment snapshot, 5 ecosystem entries. Called from `getDb()` when `NODE_ENV === 'development'`.

**Step 1e — Base UI & Page Shell**:
- Create base UI components: `src/components/ui/Card.tsx`, `Badge.tsx`, `Sparkline.tsx` (lightweight SVG, handles arrays of 1-30 points gracefully — shows "Not enough data" for < 3 points), `Gauge.tsx` (circular SVG progress)
- Create `src/components/SectionErrorFallback.tsx` — renders "Section temporarily unavailable" with muted styling. Used in try/catch blocks.
- Create `src/app/loading.tsx` — full-page loading skeleton with pulse animation matching the 7-section layout
- Create `.env.local.example`:
  ```env
  # Local Development — copy to .env.local
  # For Vercel Production: Add these as Environment Variables in Project Settings > Environment Variables
  ANTHROPIC_API_KEY=sk-ant-...       # Required: Sentiment + summarization (Haiku)
  TURSO_DATABASE_URL=libsql://...    # Required: Edge SQLite database
  TURSO_AUTH_TOKEN=...               # Required: Turso auth
  YOUTUBE_API_KEY=AIza...            # Required: YouTube Data API v3
  GITHUB_TOKEN=ghp_...              # Optional: Increases GitHub API rate limit (60→5000 req/hr)
  FIRECRAWL_API_KEY=fc-...          # Optional: Anthropic blog + X scraping
  CRON_SECRET=...                   # Required (Vercel): Cron job authentication
  ```

### 2. Data Source Fetchers
- **Task ID**: fetchers
- **Depends On**: scaffold
- **Assigned To**: builder-fetchers
- **Agent Type**: builder
- **Parallel**: true (runs in parallel with ai-layer and components)
- **FIRST**: Read `src/lib/types.ts` — all fetchers MUST return `FetchedItem[]` matching the contract exactly
- **IMPORTANT**: Import and use `stripHtml()` from `@/lib/sanitize` on all user-generated text fields (title, excerpt, author) before constructing FetchedItem objects
- Create `src/lib/fetchers/reddit.ts`:
  - Fetch top 25 posts from r/ClaudeAI and r/ClaudeCode using JSON API (append `.json` to subreddit URLs)
  - Sort by `hot` and `top` (24h)
  - Extract: title, score, comment count, flair, URL, created_utc
  - **Rate limit handling**: 2-second delay between requests. On 429, wait 60s and retry once. On second 429, return partial data.
  - Sanitize all text fields via `stripHtml()`
  - Return `FetchedItem[]`
- Create `src/lib/fetchers/youtube.ts`:
  - Search YouTube Data API v3 with 4 queries: "Claude Code", "Claude Code hooks", "Claude Code plugins", "Claude Code tutorial"
  - Extract: title, channel, views, published date, thumbnail URL, video URL
  - **Quota handling**: Check for `quotaExceeded` error → log warning + return empty array (don't throw)
  - Return `FetchedItem[]`
- Create `src/lib/fetchers/github.ts`:
  - Fetch releases from `anthropics/claude-code` via GitHub API
  - Fetch trending repos with "claude-code" topic
  - Parse awesome-claude-code: fetch `https://api.github.com/repos/hesreallyhim/awesome-claude-code/contents/README.md`, decode base64, parse markdown list items (`- [Name](url) - Description`), extract name/url/description. If parsing fails, log and return empty.
  - Return `FetchedItem[]`
- Create `src/lib/fetchers/anthropic.ts`:
  - Scrape Anthropic changelog + blog for Claude Code mentions
  - **If `FIRECRAWL_API_KEY` is set**: use Firecrawl for scraping
  - **If missing**: fall back to `fetch()` + **Cheerio** for robust HTML parsing (extract `<title>`, `<meta name="description">`, article text). Do NOT use regex for HTML parsing.
  - Sanitize extracted text via `stripHtml()`
  - Return `FetchedItem[]`
- Create `src/lib/fetchers/twitter.ts`:
  - **Best-effort, non-blocking.** Search for "Claude Code" via Firecrawl scraping
  - If `FIRECRAWL_API_KEY` is missing or scraping fails → return `[]` immediately
  - This source is unreliable. DO NOT spend builder time debugging anti-bot issues.
  - Return `FetchedItem[]`
- Create `src/lib/fetchers/rss.ts`:
  - Parse RSS feeds from Substack newsletters using `rss-parser` library
  - Import with: `import Parser from 'rss-parser'` (CJS default import with esModuleInterop)
  - Convert Substack URLs to RSS (append `/feed`)
  - Sanitize extracted text via `stripHtml()`
  - Return `FetchedItem[]`
- Create `src/lib/fetchers/index.ts` — barrel file re-exporting all 6 fetchers **(owned by builder-fetchers)**:
  ```typescript
  export { fetchReddit } from './reddit'
  export { fetchYouTube } from './youtube'
  export { fetchGitHub } from './github'
  export { fetchAnthropic } from './anthropic'
  export { fetchTwitter } from './twitter'
  export { fetchRss } from './rss'
  ```
- Create `src/lib/ranker.ts`:
  - Scoring: `(normalized_engagement × 0.6) + (recency_score × 0.4)`
  - Normalize engagement to 0-1 across all items in the batch
  - Recency: exponential decay, half-life = 24h
  - Input/Output: `FetchedItem[]` → sorted `FetchedItem[]` with `engagementScore` populated
- Create `src/lib/deduper.ts`:
  - Step 1: Exact URL match (keep higher-scored item)
  - Step 2: Normalized title comparison (lowercase, strip punctuation, compare first 10 words — if identical, keep higher-scored)
  - Categorize: news | feature | tip | plugin | video
  - Input/Output: `FetchedItem[]` → deduplicated `FetchedItem[]`
- **All fetchers**: wrap in try/catch, log errors to console.error, return empty `FetchedItem[]` on failure. No fetcher should ever throw.

### 3. AI Classification Layer
- **Task ID**: ai-layer
- **Depends On**: scaffold
- **Assigned To**: builder-ai-layer
- **Agent Type**: builder
- **Parallel**: true (runs in parallel with fetchers and components)
- **FIRST**: Read `src/lib/types.ts` — functions must consume/produce types matching the contract
- Create `src/lib/sentiment.ts` — batch classify items using Claude Haiku via `@anthropic-ai/sdk`:
  - Input: `FetchedItem[]`
  - Prompt: "Classify this Claude Code community post sentiment: positive/neutral/negative. Extract the key topic. Return JSON: {sentiment, confidence, topic, one_line_quote}"
  - Process in batches of 10 for rate limit safety
  - **Exponential backoff retries**: 3 attempts, delays of 1s → 2s → 4s
  - **Tip detection**: secondary classification for tip-like items: "Is this an actionable Claude Code tip?" → only surface tips with confidence > 0.8
  - Output: `ClassifiedItem[]`
  - On total failure: log error, return items with null sentiment fields (dashboard shows items without sentiment badges — degraded but functional)
- Create `src/lib/summarizer.ts` — generate daily editorial summary:
  - Input: top 10 `ClassifiedItem[]` by engagement score
  - Prompt: generate 2-4 sentence conversational summary highlighting top 3 developments. Tone: tech newsletter intro.
  - **Exponential backoff retries**: 3 attempts
  - **Fallback**: on failure, query Turso for previous day's summary (last-known-good). If no previous summary exists, return "Today's briefing is being prepared. Check back shortly."
  - Output: `string`
- Create `src/app/api/health/route.ts` — health check endpoint:
  - Returns JSON: `{ lastAggregation: string | null, sources: { [name]: { lastSuccess: string, itemCount: number } }, tursoConnected: boolean }`
  - Queries Turso for latest item dates per source
  - Catches Turso connection errors gracefully

### 4. Dashboard Components
- **Task ID**: components
- **Depends On**: scaffold
- **Assigned To**: builder-components
- **Agent Type**: builder
- **Parallel**: true (runs in parallel with fetchers and ai-layer)
- **FIRST**: Read `src/lib/types.ts` for all prop types. Read `specs/claude-code-pulse-dashboard.md` for wireframes and design guidelines.
- **Data flow pattern**: `page.tsx` is a Server Component that queries Turso via `getDashboardData()`. It passes serializable data as props to Client Components. Client Components handle interactivity (filtering, scrolling).
- **Empty state**: Every section MUST handle `items.length === 0` gracefully with a meaningful message (e.g., "No news yet — check back after the morning edition").

**Server Components** (no `'use client'`):
- `PulseSummary.tsx` — AI editorial. Large Lora serif, centered, warm `bg-anthropic-light-gray/30` card, thin border, max-w-[65ch], full date. Props: `{ summary: string; date: string }`.
- `NewFeatures.tsx` — Changelog timeline. Version badges, bullet lists, orange left border for breaking changes. Props: `{ releases: FetchedItem[] }`.
- `SentimentGauge.tsx` — Community mood. Large percentage + emoji + Sparkline (handles 1-30 points, "Not enough data" for < 3). Stacked bar. 2-3 quotes. Props: `{ sentiment: SentimentDailySnapshot | null; history: SentimentDailySnapshot[] }`.
- `TopTips.tsx` — 3-5 stacked quote cards. Lightbulb, tip text, attribution, orange left border. Props: `{ tips: ClassifiedItem[] }`.
- `SentimentBadge.tsx` — Colored pill. Props: `{ sentiment: 'positive' | 'neutral' | 'negative' }`.
- `SectionErrorFallback.tsx` — already created in scaffold.

**Client Components** (need `'use client'` directive):
- `LatestNews.tsx` — Headlines with client-side filter chips. Props: `{ items: ClassifiedItem[] }`.
- `EcosystemGrid.tsx` — Plugin grid with category tabs. Props: `{ entries: EcosystemEntry[] }`.
- `YouTubeCarousel.tsx` — Horizontal scrollable video cards. Props: `{ videos: FetchedItem[] }`.
- `FilterChips.tsx` — Reusable filter. Props: `{ options: string[]; selected: string; onChange: (value: string) => void }`.

**Main Page**:
- `src/app/page.tsx` — Server Component. Calls `getDashboardData()` from `db.ts`. Passes data as props to sections. Each section wrapped in try/catch with `<SectionErrorFallback />` on error. Section dividers with ALL-CAPS labels and `═══` style borders. `py-16` spacing. Footer with sources + update time. ISR: `export const revalidate = 86400`.
- All components: semantic HTML, ARIA attributes on interactive elements, follow Anthropic design system.

### 5. Integration & Polish
- **Task ID**: integration
- **Depends On**: components, ai-layer, fetchers
- **Assigned To**: builder-integration
- **Agent Type**: builder
- **Parallel**: false

**Step 5a — Cron Endpoint** (moved here from ai-layer to resolve hidden dependency):
- Create `src/app/api/cron/aggregate/route.ts`:
  1. Validate auth: `const authHeader = request.headers.get('authorization'); if (authHeader !== \`Bearer ${process.env.CRON_SECRET}\`) return new Response('Unauthorized', { status: 401 });`
  2. Add `export const dynamic = 'force-dynamic'` to prevent Next.js caching
  3. Add `export const maxDuration = 60` to extend Vercel function timeout (Pro plan) — if on Hobby, the pipeline must complete in 10s which is tight; log a warning if execution exceeds 8s
  4. **Idempotency check**: query `sentiment_daily` for today's date. If exists, return early ("Already aggregated today")
  5. Fetch from all 6 sources via barrel import: `import { fetchReddit, fetchYouTube, ... } from '@/lib/fetchers'`
  6. Run `Promise.allSettled([fetchReddit(), fetchYouTube(), ...])`
  7. Log per-source success/failure/item-count
  8. Deduplicate via `deduper.ts`, rank via `ranker.ts`
  9. Batch classify sentiment via `sentiment.ts` (with retries)
  10. Generate editorial summary via `summarizer.ts` (with retries)
  11. **Transactional write**: call `runPipelineTransaction(classifiedItems, sentimentSnapshot)` — atomic batch, rolls back on any failure
  12. **Data retention**: call `pruneOldData(90, 365)` — delete items > 90 days, snapshots > 1 year
  13. Return JSON: `{ sources: {reddit: 15, ...}, totalItems: N, sentimentClassified: N, summaryGenerated: boolean, pruned: {items: N, snapshots: N}, durationMs: N, errors: [...] }`

**Step 5b — Data Wiring**:
- Verify all 7 components read from Turso via `getDashboardData()` (should already work from step 4, but confirm with real data)
- Confirm ISR revalidation set to `86400` in page.tsx

**Step 5c — Responsive & Polish**:
- Responsive breakpoints: desktop (max-w-5xl centered, 2-col layout for headlines/changelog), tablet (2-col → 1-col at md breakpoint), mobile (single column, stacked cards, YouTubeCarousel scrollable horizontal)
- Loading skeletons in `loading.tsx` (animated pulse matching section layout)
- Verify error handling: each section's try/catch renders `<SectionErrorFallback />` on failure
- Add `generateMetadata()` in layout.tsx with OG tags (title, description, date snippet for social sharing)
- Verify `.env.local.example` complete with all keys + Vercel deployment instructions
- Run `cd apps/morning-with-coffee-and-claude && bun install && bunx tsc --noEmit` — must compile clean

### 6. Final Validation
- **Task ID**: validate-all
- **Depends On**: scaffold, fetchers, ai-layer, components, integration
- **Assigned To**: validator-final
- **Agent Type**: validator
- **Parallel**: false
- Run all validation commands
- Verify all acceptance criteria met

## Acceptance Criteria
1. `apps/morning-with-coffee-and-claude/package.json` exists with `next@15`, `@libsql/client`, `@anthropic-ai/sdk`, `rss-parser`, `cheerio`
2. `apps/morning-with-coffee-and-claude/tsconfig.json` exists with strict mode enabled
3. All ~40 new files exist (check file list above)
4. `cd apps/morning-with-coffee-and-claude && bun install && bunx tsc --noEmit` compiles without errors
5. `tailwind.config.ts` contains all 7 Anthropic color tokens
6. `postcss.config.js` exists with tailwindcss + autoprefixer plugins
7. `src/lib/types.ts` exports `FetchedItem`, `ClassifiedItem`, `SentimentDailySnapshot`, `EcosystemEntry`, `DashboardData`
8. `src/lib/db.ts` connects to Turso, creates 3 tables (with AI columns + indexes), exports typed query functions including `getDashboardData()`
9. `next.config.js` includes `serverExternalPackages: ['@libsql/client', 'rss-parser', 'cheerio']`
10. All 6 fetchers in `src/lib/fetchers/` export async functions returning `FetchedItem[]`
11. `src/lib/fetchers/index.ts` barrel re-exports all 6 fetchers
12. Sentiment classifier (`sentiment.ts`) implements exponential backoff retries (3 attempts)
13. Summarizer (`summarizer.ts`) implements retries with last-known-good fallback
14. Cron endpoint validates `Authorization: Bearer {CRON_SECRET}` header and includes `export const dynamic = 'force-dynamic'`
15. Health endpoint returns last aggregation status + per-source health
16. All 7 dashboard sections render (PulseSummary, LatestNews, NewFeatures, SentimentGauge, EcosystemGrid, YouTubeCarousel, TopTips)
17. Client Components (LatestNews, EcosystemGrid, YouTubeCarousel, FilterChips) include `'use client'` directive
18. Page uses Anthropic design: warm background (#faf9f5), Lora body, Poppins headings, no pure white/black
19. Each section in page.tsx wrapped in try/catch with `<SectionErrorFallback />` (not React ErrorBoundary class)
20. Responsive layout: desktop (max-w-5xl, 2-col), tablet (2→1 col), mobile (single col)
21. `vercel.json` has `{ "crons": [{ "path": "/api/cron/aggregate", "schedule": "0 6 * * *" }] }`
22. `.env.local.example` documents all required API keys with Vercel env var setup instructions
23. Items table DDL includes `is_tip`, `tip_confidence`, `one_line_quote` columns
24. `sentiment_daily` table stores `top_positive_id`/`top_negative_id` as foreign keys to items table
25. `getSentimentSnapshot()` JOINs sentiment_daily with items to hydrate `topPositive`/`topNegative`
26. `db.ts` imports only from `types.ts` — no cross-module imports
27. Database has indexes on `items(date)`, `items(source)`, `items(created_at)`
28. `insertItems()` uses `ON CONFLICT(url) DO UPDATE` for engagement metrics (upsert, not ignore)
29. `runPipelineTransaction()` exists and uses Turso batch mode for atomic writes
30. `pruneOldData()` exists and deletes items > 90 days, snapshots > 1 year
31. Cron endpoint calls `pruneOldData()` after successful pipeline completion
32. `src/lib/sanitize.ts` exists with `stripHtml()` function
33. Anthropic fetcher uses Cheerio for HTML parsing (not regex)
34. Cron endpoint includes `export const maxDuration = 60`

## Validation Commands
- `ls apps/morning-with-coffee-and-claude/src/lib/` — Verify lib directory structure
- `ls apps/morning-with-coffee-and-claude/src/lib/fetchers/` — Verify all 6 fetcher files + index.ts
- `ls apps/morning-with-coffee-and-claude/src/components/` — Verify all component files
- `cd apps/morning-with-coffee-and-claude && bun install && bunx tsc --noEmit` — TypeScript compiles clean
- `grep "serverExternalPackages" apps/morning-with-coffee-and-claude/next.config.js` — External packages configured (should include cheerio)
- `grep "anthropic" apps/morning-with-coffee-and-claude/tailwind.config.ts` — Design tokens present
- `grep "FetchedItem" apps/morning-with-coffee-and-claude/src/lib/types.ts` — Shared types exist
- `grep "getDashboardData" apps/morning-with-coffee-and-claude/src/lib/db.ts` — Typed query functions exist
- `grep "revalidate" apps/morning-with-coffee-and-claude/src/app/page.tsx` — ISR configured
- `grep "Authorization" apps/morning-with-coffee-and-claude/src/app/api/cron/aggregate/route.ts` — Cron auth present
- `grep "'use client'" apps/morning-with-coffee-and-claude/src/components/FilterChips.tsx` — Client component directive
- `cat apps/morning-with-coffee-and-claude/vercel.json` — Cron job configured
- `cat apps/morning-with-coffee-and-claude/postcss.config.js` — PostCSS configured
- `grep "is_tip" apps/morning-with-coffee-and-claude/src/lib/db.ts` — AI columns in items DDL
- `grep "top_positive_id" apps/morning-with-coffee-and-claude/src/lib/db.ts` — Sentiment JOIN strategy
- `grep "from.*types" apps/morning-with-coffee-and-claude/src/lib/db.ts` — db.ts imports only types
- `grep "CREATE INDEX" apps/morning-with-coffee-and-claude/src/lib/db.ts` — Database indexes present
- `grep "ON CONFLICT" apps/morning-with-coffee-and-claude/src/lib/db.ts` — Upsert strategy for items
- `grep "runPipelineTransaction\|batch" apps/morning-with-coffee-and-claude/src/lib/db.ts` — Transactional writes
- `grep "pruneOldData\|DELETE.*date" apps/morning-with-coffee-and-claude/src/lib/db.ts` — Data retention
- `grep "stripHtml" apps/morning-with-coffee-and-claude/src/lib/sanitize.ts` — Content sanitization
- `grep "cheerio\|load" apps/morning-with-coffee-and-claude/src/lib/fetchers/anthropic.ts` — Cheerio HTML parsing
- `grep "maxDuration" apps/morning-with-coffee-and-claude/src/app/api/cron/aggregate/route.ts` — Function timeout config

## Notes
- **Architecture changes from original spec**: Turso replaces local SQLite (Vercel compatibility). Tailwind 3.4.x replaces v4 (config model compatibility). `next/font/google` replaces manual font downloads. `@libsql/client` replaces `better-sqlite3` (native addon compatibility).
- **Node.js runtime on Vercel**: Bun is experimental on Vercel for Next.js. Use Node.js for production deployment. Bun is used locally for speed (`bun install`, `bun run dev`).
- **Server/Client boundary**: page.tsx is a Server Component. Interactive components (LatestNews, EcosystemGrid, YouTubeCarousel, FilterChips) are Client Components receiving serializable props.
- **Error handling**: Server-side try/catch with SectionErrorFallback (not React ErrorBoundary classes, which don't work in Server Components).
- **Cron endpoint in integration**: Prevents hidden dependency — it imports from all fetchers + AI layer.
- **Transactional writes**: Pipeline uses `db.batch()` for atomic insertItems + upsertSentimentSnapshot. Partial state is impossible.
- **Data retention**: 90-day item retention, 1-year snapshot retention. Automated in cron. Prevents Turso free tier overflow.
- **Upsert strategy**: Items use `ON CONFLICT(url) DO UPDATE` so re-fetched items get updated engagement metrics.
- **Content sanitization**: All user-generated text (excerpts, quotes, titles from RSS/Reddit) stripped of HTML via `sanitize.ts` before storage.
- **Cheerio for HTML parsing**: Anthropic blog/changelog fetcher uses Cheerio instead of brittle regex. Included in `serverExternalPackages`.
- **X/Twitter**: Best-effort only. If Firecrawl fails, returns empty array. Never blocks the pipeline.
- **Dedup simplified**: Normalized first-10-words comparison, not Levenshtein.
- **ISR = 86400s**: Daily publication, not live feed.
- **JSON columns**: db.ts handles JSON.parse/stringify internally — consumers always get typed objects.
- **Sentiment JOIN strategy**: `sentiment_daily` stores `top_positive_id`/`top_negative_id` as integer foreign keys. Query functions JOIN with items table to return hydrated `ClassifiedItem` objects.
- **Function timeout**: Cron endpoint sets `maxDuration = 60` for Vercel Pro. On Hobby (10s limit), the pipeline may be too slow — consider upgrading or splitting into phases.
- Read the full product spec at `specs/claude-code-pulse-dashboard.md` for wireframes, schema, design tokens, and editorial guidelines.

# Plan: Morning with Coffee & Claude Dashboard

## Task Description
Build "Morning with Coffee & Claude" — a single-page daily newspaper-style dashboard that curates Claude Code ecosystem news from 6+ sources (Reddit, YouTube, GitHub, Anthropic, X/Twitter, Substack) into a beautiful, readable layout modeled after Anthropic's design language. The dashboard features an AI-generated editorial summary, headlines, changelog, community sentiment analysis, trending plugins/hooks/skills, YouTube recommendations, and curated tips — all powered by a daily cron-based data pipeline with Claude Haiku for sentiment classification and editorial generation, deployed on Vercel with Turso (edge SQLite) for persistent storage.

## Objective
When this plan is complete, there will be a fully functional Next.js 15 app at `apps/morning-with-coffee-and-claude/` that:
1. Aggregates, deduplicates, and ranks data daily from Reddit, YouTube, GitHub, Anthropic docs, X/Twitter, and Substack
2. Classifies community sentiment and generates an editorial summary using Claude Haiku, with error handling and retries
3. Renders all 7 dashboard sections with Anthropic's warm, newspaper-style design, with per-section error boundaries
4. Deploys to Vercel with a secure daily cron-triggered data pipeline, backed by Turso for persistent storage
5. Costs < $5/month to operate

## Problem Statement
The Claude Code ecosystem is exploding across 6+ scattered sources (Reddit 483k+96k members, YouTube tutorials, GitHub plugins, Anthropic docs, X, Substack). Keeping up requires checking all sources daily. There's no single curated view of what matters.

## Solution Approach
A Next.js 15 (App Router) static site with ISR that rebuilds daily via cron. A server-side data pipeline fetches from all 6 sources in parallel using `Promise.allSettled`, Claude Haiku batch-classifies sentiment and generates the editorial (with exponential backoff retries), and Turso (edge SQLite via `@libsql/client`) stores daily snapshots with last-known-good fallback. The frontend renders 7 newspaper-style sections using Anthropic's design tokens. All data interfaces are defined in a shared `types.ts` contract that enables parallel builder work.

**Key architecture change (post-review):** Replaced local SQLite (`better-sqlite3`) with Turso — Vercel's ephemeral serverless filesystem cannot persist a local `.db` file across cron invocations. Turso provides SQLite-compatible edge storage with a generous free tier (9GB, 500M reads/month). The schema and queries remain identical; only the client library changes from `better-sqlite3` to `@libsql/client`.

## Relevant Files
Use these files to complete the task:

- `specs/claude-code-pulse-dashboard.md` — Full product spec with layout wireframes, design system, SQLite schema, data pipeline architecture, and API requirements
- `apps/task-manager/package.json` — Reference for Bun project conventions
- `apps/task-manager/tsconfig.json` — Reference for TypeScript config patterns

### New Files
- `apps/morning-with-coffee-and-claude/package.json` — Next.js 15 + Bun project config
- `apps/morning-with-coffee-and-claude/next.config.js` — Next.js config with ISR settings
- `apps/morning-with-coffee-and-claude/tailwind.config.ts` — Anthropic design tokens (Tailwind 3.4.x)
- `apps/morning-with-coffee-and-claude/tsconfig.json` — TypeScript strict config
- `apps/morning-with-coffee-and-claude/vercel.json` — Cron job config
- `apps/morning-with-coffee-and-claude/.env.local.example` — API key template (local + Vercel env var docs)
- `apps/morning-with-coffee-and-claude/src/app/layout.tsx` — Root layout with fonts + theme
- `apps/morning-with-coffee-and-claude/src/app/page.tsx` — Dashboard page (SSG with ISR)
- `apps/morning-with-coffee-and-claude/src/app/api/cron/aggregate/route.ts` — Daily aggregation endpoint
- `apps/morning-with-coffee-and-claude/src/app/api/health/route.ts` — Health check endpoint (last aggregation status)
- `apps/morning-with-coffee-and-claude/src/lib/types.ts` — Shared type definitions (FetchedItem, ClassifiedItem, DashboardData, etc.)
- `apps/morning-with-coffee-and-claude/src/lib/db.ts` — Turso connection + typed query functions
- `apps/morning-with-coffee-and-claude/src/lib/fetchers/reddit.ts` — Reddit JSON API fetcher
- `apps/morning-with-coffee-and-claude/src/lib/fetchers/youtube.ts` — YouTube Data API fetcher
- `apps/morning-with-coffee-and-claude/src/lib/fetchers/github.ts` — GitHub releases + repos
- `apps/morning-with-coffee-and-claude/src/lib/fetchers/anthropic.ts` — Changelog + blog scraper
- `apps/morning-with-coffee-and-claude/src/lib/fetchers/twitter.ts` — X/Twitter search (best-effort, non-blocking)
- `apps/morning-with-coffee-and-claude/src/lib/fetchers/rss.ts` — Substack RSS parser
- `apps/morning-with-coffee-and-claude/src/lib/sentiment.ts` — Haiku batch classifier with retries
- `apps/morning-with-coffee-and-claude/src/lib/summarizer.ts` — Daily brief generator with retries
- `apps/morning-with-coffee-and-claude/src/lib/ranker.ts` — Engagement x recency scoring
- `apps/morning-with-coffee-and-claude/src/lib/deduper.ts` — URL + normalized title dedup
- `apps/morning-with-coffee-and-claude/src/components/PulseSummary.tsx` — AI editorial brief
- `apps/morning-with-coffee-and-claude/src/components/LatestNews.tsx` — Headlines feed
- `apps/morning-with-coffee-and-claude/src/components/NewFeatures.tsx` — Changelog timeline
- `apps/morning-with-coffee-and-claude/src/components/SentimentGauge.tsx` — Sentiment dashboard
- `apps/morning-with-coffee-and-claude/src/components/EcosystemGrid.tsx` — Plugins/hooks/skills grid
- `apps/morning-with-coffee-and-claude/src/components/YouTubeCarousel.tsx` — Video cards
- `apps/morning-with-coffee-and-claude/src/components/TopTips.tsx` — Quote cards
- `apps/morning-with-coffee-and-claude/src/components/FilterChips.tsx` — Source filter component
- `apps/morning-with-coffee-and-claude/src/components/SentimentBadge.tsx` — Colored pill
- `apps/morning-with-coffee-and-claude/src/components/ui/Card.tsx` — Base card component
- `apps/morning-with-coffee-and-claude/src/components/ui/Badge.tsx` — Base badge component
- `apps/morning-with-coffee-and-claude/src/components/ui/Sparkline.tsx` — SVG sparkline
- `apps/morning-with-coffee-and-claude/src/components/ui/Gauge.tsx` — Circular progress gauge
- `apps/morning-with-coffee-and-claude/src/styles/globals.css` — Tailwind imports + custom props

## Implementation Phases

### Phase 1: Foundation
- Scaffold Next.js 15 app with Bun runtime
- Configure Tailwind CSS 3.4.x with Anthropic design tokens
- Load Poppins + Lora fonts via `next/font/google` (auto self-hosted at build time)
- Create shared `types.ts` with all interfaces (FetchedItem, ClassifiedItem, DashboardData, etc.)
- Create base UI components (Card, Badge, Sparkline, Gauge)
- Set up Turso database with schema (items, sentiment_daily, ecosystem tables)
- Seed database with sample/mock data for development
- Build static dashboard page rendering all 7 sections with mock data

### Phase 2: Core Implementation
- Implement all 6 data fetchers (Reddit, YouTube, GitHub, Anthropic, Twitter, RSS)
- All fetchers return `FetchedItem[]` matching the shared type contract
- Build ranking engine (engagement x recency_decay scoring)
- Build deduplication logic (URL exact match + normalized first-10-words title match)
- Implement Haiku sentiment batch classifier with exponential backoff retries
- Implement Haiku daily editorial summary generator with retries
- Implement tip detection classifier
- Wire the aggregation cron endpoint with comprehensive logging
- Add health check endpoint for monitoring

### Phase 3: Integration & Polish
- Connect real data to all 7 dashboard components (replace mock data)
- Set ISR revalidation to 86400s (24 hours — matches daily cron cadence)
- Responsive layout (mobile single-column, tablet 2-col)
- Loading skeletons for ISR transitions
- Error boundaries per section
- Vercel deployment configuration with cron jobs + env var documentation
- Create .env.local.example with all API keys + Vercel env var setup instructions

## Team Orchestration

- You operate as the team lead and orchestrate the team to execute the plan.
- You NEVER operate directly on the codebase. You use Task and Task* tools.

### Team Members

- Builder
  - Name: builder-scaffold
  - Role: Project scaffolding, config files, shared types, design system, base UI components, Turso schema + seed data
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: builder-fetchers
  - Role: All 6 data source fetchers + ranking + dedup logic
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: builder-ai-layer
  - Role: Haiku sentiment classifier, editorial summarizer, tip detector, aggregation cron endpoint, health check
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: builder-components
  - Role: All 7 dashboard section components + FilterChips + SentimentBadge + main page.tsx
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: builder-integration
  - Role: Wire real data to components, ISR config, responsive layout, error boundaries, Vercel config
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
- Create `apps/morning-with-coffee-and-claude/` directory structure matching the file list above
- Create `package.json` with:
  - Dependencies: `next@15`, `react@19`, `react-dom@19`, `tailwindcss@3.4`, `@libsql/client`, `@anthropic-ai/sdk`, `rss-parser`
  - DevDependencies: `typescript`, `@types/react`, `@types/node`, `postcss`, `autoprefixer`
  - Scripts: `dev`, `build`, `start`
- Create `next.config.js` with output settings for Vercel
- Create `tsconfig.json` with strict mode, ESNext target, bundler module resolution, path aliases (`@/` → `src/`)
- Create `tailwind.config.ts` (Tailwind 3.4.x) with full Anthropic design tokens:
  - Colors: dark (#141413), light (#faf9f5), mid-gray (#b0aea5), light-gray (#e8e6dc), orange (#d97757), blue (#6a9bcc), green (#788c5d)
  - Fonts: Poppins (heading), Lora (body), JetBrains Mono (mono)
  - Font sizes: display, h1, h2, h3, body, small, xs (with line-height and weight)
- Create `src/styles/globals.css` with Tailwind imports (`@tailwind base/components/utilities`)
- Create `src/app/layout.tsx` — root layout using `next/font/google` for Poppins + Lora (automatically self-hosted at build time), metadata with OG tags, theme wrapper
- **Create `src/lib/types.ts`** — THE shared type contract for all builders:
  - `FetchedItem`: id, date, source, category, title, url, author, excerpt, thumbnailUrl, engagementScore, rawMetrics, fetchedAt, createdAt
  - `ClassifiedItem`: extends FetchedItem with sentiment, sentimentConfidence, topicTags, oneLineQuote
  - `SentimentDailySnapshot`: date, positivePct, neutralPct, negativePct, sampleSize, topPositive, topNegative, summary
  - `EcosystemEntry`: name, type (hook|plugin|skill|mcp_server), author, description, githubUrl, stars, lastUpdated, categoryTags, mentionCount
  - `DashboardData`: items, sentiment, ecosystem, lastUpdated
  - Component prop types for each section
- Create base UI components: `src/components/ui/Card.tsx`, `Badge.tsx`, `Sparkline.tsx` (lightweight SVG), `Gauge.tsx` (circular SVG progress)
- Create `src/lib/db.ts` — Turso connection using `@libsql/client`, table creation SQL (items, sentiment_daily, ecosystem), typed query functions matching `types.ts` interfaces
- Seed Turso with development data (10-15 sample items across sources, 1 sentiment_daily entry, 5 ecosystem entries)
- Create `.env.local.example` documenting all required keys with notes about Vercel env var setup:
  ```
  # Local Development — copy to .env.local
  # For Vercel: Add these as Environment Variables in Project Settings
  ANTHROPIC_API_KEY=sk-ant-...
  TURSO_DATABASE_URL=libsql://...
  TURSO_AUTH_TOKEN=...
  YOUTUBE_API_KEY=AIza...
  GITHUB_TOKEN=ghp_...              # optional, increases rate limit
  FIRECRAWL_API_KEY=fc-...          # optional, for blog scraping
  CRON_SECRET=...                   # Vercel cron auth
  ```

### 2. Data Source Fetchers
- **Task ID**: fetchers
- **Depends On**: scaffold
- **Assigned To**: builder-fetchers
- **Agent Type**: builder
- **Parallel**: true (can start as soon as scaffold completes; runs in parallel with ai-layer and components)
- Read `src/lib/types.ts` first — all fetchers MUST return `FetchedItem[]` matching the contract
- Create `src/lib/fetchers/reddit.ts` — fetch top 25 posts/day from r/ClaudeAI and r/ClaudeCode using JSON API (append `.json` to URLs). Extract title, score, comment count, flair, URL, created_utc. Handle rate limits (10 req/min unauthenticated). Return `FetchedItem[]`.
- Create `src/lib/fetchers/youtube.ts` — search YouTube Data API v3 with 4 queries (Claude Code, Claude Code hooks, Claude Code plugins, Claude Code tutorial). Extract title, channel, views, published date, thumbnail URL, video URL. Respect 10k daily quota. Return `FetchedItem[]`.
- Create `src/lib/fetchers/github.ts` — fetch releases from `anthropics/claude-code`, trending repos with "claude-code" topic, and parse the raw README.md content from `awesome-claude-code` repo to extract entries. Return `FetchedItem[]`.
- Create `src/lib/fetchers/anthropic.ts` — scrape Anthropic changelog and blog for Claude Code mentions using Firecrawl if available, otherwise use fetch + HTML parsing. Return `FetchedItem[]`.
- Create `src/lib/fetchers/twitter.ts` — **Best-effort, non-blocking.** Search for "Claude Code" on X using Firecrawl scraping. This source is unreliable due to X's anti-bot measures. If it fails, log and return empty array. DO NOT block other work on this fetcher. Return `FetchedItem[]`.
- Create `src/lib/fetchers/rss.ts` — parse RSS feeds from Substack newsletters using `rss-parser` library. Convert Substack URLs to RSS (append `/feed`). Return `FetchedItem[]`.
- Create `src/lib/ranker.ts` — scoring function: `(normalized_engagement × 0.6) + (recency_score × 0.4)`. Normalize engagement scores to 0-1 across sources. Apply recency decay (exponential, half-life = 24h). Takes `FetchedItem[]`, returns sorted `FetchedItem[]` with `engagementScore` populated.
- Create `src/lib/deduper.ts` — deduplicate by exact URL match, then normalized title comparison (lowercase, strip punctuation, compare first 10 words — if match, keep higher-scored item). Categorize items into: news | feature | tip | plugin | video. Takes `FetchedItem[]`, returns deduplicated `FetchedItem[]`.
- All fetchers handle errors gracefully: try/catch, log error, return empty `FetchedItem[]`. No fetcher should throw.

### 3. AI Classification & Aggregation Pipeline
- **Task ID**: ai-layer
- **Depends On**: scaffold
- **Assigned To**: builder-ai-layer
- **Agent Type**: builder
- **Parallel**: true (can start as soon as scaffold completes; runs in parallel with fetchers and components)
- Read `src/lib/types.ts` first — all functions must consume/produce types matching the contract
- Create `src/lib/sentiment.ts` — batch classify items using Claude Haiku via `@anthropic-ai/sdk`:
  - Input: `FetchedItem[]`
  - Prompt: "Classify this Claude Code community post sentiment: positive/neutral/negative. Extract the key topic. Return JSON: {sentiment, confidence, topic, one_line_quote}"
  - Process in batches of 10 for rate limit safety
  - **Implement exponential backoff retries** (3 attempts, 1s/2s/4s delays) for transient API failures
  - Tip detection: for items classified as tips, secondary classification: "Is this an actionable Claude Code tip?" (yes/no + confidence). Only tips with confidence > 0.8 are surfaced
  - Output: `ClassifiedItem[]`
  - On total failure after retries: log error, return items with null sentiment (dashboard shows items without sentiment badges)
- Create `src/lib/summarizer.ts` — generate daily editorial summary:
  - Input: top 10 `ClassifiedItem[]` by engagement score
  - Prompt: generate 2-4 sentence conversational summary highlighting top 3 developments. Tone: like a tech newsletter intro, not sterile.
  - **Implement exponential backoff retries** (3 attempts)
  - On failure: return previous day's summary from Turso (last-known-good fallback) or a generic "Check back later" message
  - Output: `string`
- Create `src/app/api/cron/aggregate/route.ts` — daily aggregation endpoint:
  1. Validate `CRON_SECRET` header for security
  2. Fetch from all 6 sources in parallel (`Promise.allSettled`)
  3. Log per-source success/failure/item-count
  4. Deduplicate and rank results
  5. Batch classify sentiment via Haiku (with retries)
  6. Generate editorial summary via Haiku (with retries)
  7. Store everything in Turso (items + sentiment_daily tables)
  8. Return JSON summary: { sources: {reddit: 15, youtube: 8, ...}, totalItems: N, sentimentClassified: N, summaryGenerated: boolean, errors: [...] }
- Create `src/app/api/health/route.ts` — health check endpoint returning:
  - Last aggregation timestamp
  - Per-source fetch status (last success time, last item count)
  - Database connectivity status
- Create `vercel.json` with cron schedule: `"0 6 * * *"` (daily at 6 AM UTC) + CRON_SECRET auth

### 4. Dashboard Components
- **Task ID**: components
- **Depends On**: scaffold
- **Assigned To**: builder-components
- **Agent Type**: builder
- **Parallel**: true (runs in parallel with fetchers and ai-layer)
- Read `src/lib/types.ts` first — all component props must match the contract types
- Read `specs/claude-code-pulse-dashboard.md` for wireframes and design guidelines
- Create `src/components/PulseSummary.tsx` — AI editorial summary. Large Lora serif text, centered, warm `bg-anthropic-light-gray/30` card with thin border. Full human-readable date. `max-w-[65ch]` for reading width. Props: `{ summary: string; date: string }`.
- Create `src/components/LatestNews.tsx` — Headlines. 5-8 stories with source icon + headline + source + relative time. Filter chips (All | Official | Community | Social). Bottom borders between items. Props: `{ items: ClassifiedItem[] }`.
- Create `src/components/NewFeatures.tsx` — Changelog timeline. Version badges with bullet lists. Breaking changes get orange left border. Compact vertical timeline. Props: `{ releases: FetchedItem[] }`.
- Create `src/components/SentimentGauge.tsx` — Community mood. Left: large percentage + emoji + 30-day Sparkline. Right: 2-3 representative quotes. Horizontal stacked bar (green/gray/red). Props: `{ sentiment: SentimentDailySnapshot; history: SentimentDailySnapshot[] }`.
- Create `src/components/EcosystemGrid.tsx` — Plugin/hook/skill cards. 3-column responsive grid. Cards: category badge, name, author, 2-line desc, stars + freshness. Category tabs: All | Plugins | Hooks | Skills | MCP Servers. Props: `{ entries: EcosystemEntry[] }`.
- Create `src/components/YouTubeCarousel.tsx` — Top 5 videos. Horizontal row (scrollable on mobile). 16:9 thumbnails with play overlay on hover. Title, channel, views. Props: `{ videos: FetchedItem[] }`.
- Create `src/components/TopTips.tsx` — 3-5 stacked quote cards. Lightbulb icon, tip text, attribution + upvotes, link to source. Orange left border accent. Props: `{ tips: ClassifiedItem[] }`.
- Create `src/components/FilterChips.tsx` — Reusable client-side filter chip component. Active state styling. No server round-trip. Props: `{ options: string[]; selected: string; onChange: (value: string) => void }`.
- Create `src/components/SentimentBadge.tsx` — Colored pill: positive (green), neutral (gray), negative (subtle red). Props: `{ sentiment: 'positive' | 'neutral' | 'negative' }`.
- Create `src/app/page.tsx` — Main dashboard page. Imports all 7 sections. Section dividers with ALL-CAPS labels and `═══` borders. `py-16` spacing. Footer with sources and update time. Initially renders with mock/seed data from Turso.
- All components: use semantic HTML, ARIA attributes on interactive elements, follow the Anthropic design system (warm neutrals, border-only cards, generous whitespace, restrained color).

### 5. Integration & Polish
- **Task ID**: integration
- **Depends On**: components, ai-layer, fetchers
- **Assigned To**: builder-integration
- **Agent Type**: builder
- **Parallel**: false
- Wire all 7 components to read from Turso via `src/lib/db.ts` query functions (replace mock data)
- Set ISR revalidation to `86400` (24 hours — matches daily cron cadence; stale data is expected between cron runs)
- Responsive breakpoints: desktop (max-w-5xl centered, 2-col layout for headlines/changelog), tablet (2-col → 1-col), mobile (single column, stacked cards, scrollable YouTube carousel)
- Loading skeletons for each section (animated pulse placeholders matching section layout)
- Error boundaries per section: React ErrorBoundary wrapper around each section component. On error, render "Section temporarily unavailable" with muted styling — never crash the whole page
- Add `generateMetadata()` in layout.tsx with OG tags for social sharing (title, description, date snippet)
- Verify all API keys documented in `.env.local.example` with Vercel deployment instructions
- Ensure TypeScript compiles clean: `bunx tsc --noEmit`

### 6. Final Validation
- **Task ID**: validate-all
- **Depends On**: scaffold, fetchers, ai-layer, components, integration
- **Assigned To**: validator-final
- **Agent Type**: validator
- **Parallel**: false
- Run all validation commands
- Verify acceptance criteria met

## Acceptance Criteria
1. `apps/morning-with-coffee-and-claude/package.json` exists with Next.js 15, `@libsql/client`, `@anthropic-ai/sdk` dependencies
2. `apps/morning-with-coffee-and-claude/tsconfig.json` exists with strict mode enabled
3. All ~37 new files listed in "New Files" section exist
4. `cd apps/morning-with-coffee-and-claude && bunx tsc --noEmit` compiles without errors
5. `tailwind.config.ts` contains all Anthropic design tokens (colors: dark/light/mid-gray/light-gray/orange/blue/green)
6. `src/lib/types.ts` exports `FetchedItem`, `ClassifiedItem`, `SentimentDailySnapshot`, `EcosystemEntry`, `DashboardData`
7. `src/lib/db.ts` connects to Turso and creates 3 tables (items, sentiment_daily, ecosystem)
8. All 6 fetchers export async functions that return `FetchedItem[]`
9. Sentiment classifier implements exponential backoff retries and returns `ClassifiedItem[]`
10. Editorial summarizer generates 2-4 sentences with retry logic
11. Cron endpoint (`/api/cron/aggregate`) orchestrates all 6 fetchers + AI classification + Turso storage
12. Health check endpoint (`/api/health`) returns last aggregation status
13. All 7 dashboard sections render (PulseSummary, LatestNews, NewFeatures, SentimentGauge, EcosystemGrid, YouTubeCarousel, TopTips)
14. Page uses Anthropic design: warm background (#faf9f5), serif body (Lora), heading (Poppins), no pure white/black
15. Responsive layout works at mobile (375px), tablet (768px), and desktop (1280px) widths
16. Each section has an error boundary that doesn't crash the whole page
17. `vercel.json` contains cron configuration for daily 6 AM UTC runs with CRON_SECRET auth
18. `.env.local.example` documents all required API keys with Vercel env var setup instructions

## Validation Commands
- `ls apps/morning-with-coffee-and-claude/src/` — Verify directory structure exists
- `ls apps/morning-with-coffee-and-claude/src/lib/fetchers/` — Verify all 6 fetcher files
- `ls apps/morning-with-coffee-and-claude/src/components/` — Verify all component files
- `cd apps/morning-with-coffee-and-claude && bunx tsc --noEmit` — TypeScript compiles clean
- `grep -l "anthropic" apps/morning-with-coffee-and-claude/tailwind.config.ts` — Design tokens present
- `grep -l "@libsql/client" apps/morning-with-coffee-and-claude/package.json` — Turso dependency present
- `grep -l "FetchedItem" apps/morning-with-coffee-and-claude/src/lib/types.ts` — Shared types exist
- `grep -l "revalidate" apps/morning-with-coffee-and-claude/src/app/page.tsx` — ISR configured
- `grep -l "CRON_SECRET" apps/morning-with-coffee-and-claude/src/app/api/cron/aggregate/route.ts` — Cron auth present
- `cat apps/morning-with-coffee-and-claude/vercel.json` — Cron job configured

## Notes
- **Architecture change from spec**: The original spec used local SQLite (`better-sqlite3`). Reviews identified this as incompatible with Vercel's ephemeral serverless filesystem. Replaced with Turso (edge SQLite) — schema and queries are identical, only the client library changes. Turso free tier: 9GB, 500M reads/month.
- **Tailwind version**: Pinned to Tailwind CSS 3.4.x (not v4) because the design system specifies `tailwind.config.js`-style configuration. Tailwind 4 uses a fundamentally different CSS-first config model.
- **Font loading**: Using `next/font/google` instead of manual font file downloads. Despite the name, this self-hosts fonts at build time (no CDN at runtime).
- **X/Twitter fetcher is best-effort**: X aggressively blocks scrapers. The Twitter fetcher should never block the build or fail the pipeline. If it fails, log and return empty array.
- **Dedup simplified**: Instead of Levenshtein distance, use normalized first-10-words comparison. Sufficient at this scale (~100 items/day) and trivial to implement.
- **ISR set to 86400s**: Matches the daily cron cadence. The page is a daily publication, not a live feed.
- **Parallel builder optimization**: Tasks 2 (fetchers), 3 (ai-layer), and 4 (components) all depend only on scaffold (for shared types) and can run in parallel. This uses 3 builders simultaneously instead of 1.
- Read the full product spec at `specs/claude-code-pulse-dashboard.md` — it contains wireframes, SQLite schema, design token values, component patterns, and editorial guidelines.

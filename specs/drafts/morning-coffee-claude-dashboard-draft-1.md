# Plan: Morning with Coffee & Claude Dashboard

## Task Description
Build "Morning with Coffee & Claude" — a single-page daily newspaper-style dashboard that curates Claude Code ecosystem news from 6+ sources (Reddit, YouTube, GitHub, Anthropic, X/Twitter, Substack) into a beautiful, readable layout modeled after Anthropic's design language. The dashboard features an AI-generated editorial summary, headlines, changelog, community sentiment analysis, trending plugins/hooks/skills, YouTube recommendations, and curated tips — all powered by a daily cron-based data pipeline with Claude Haiku for sentiment classification and editorial generation.

## Objective
When this plan is complete, there will be a fully functional Next.js 15 app at `apps/morning-with-coffee-and-claude/` that:
1. Aggregates data daily from Reddit, YouTube, GitHub, Anthropic docs, X/Twitter, and Substack
2. Classifies community sentiment and generates an editorial summary using Claude Haiku
3. Renders all 7 dashboard sections with Anthropic's warm, newspaper-style design
4. Deploys to Vercel with daily cron-triggered data refresh
5. Costs < $5/month to operate

## Problem Statement
The Claude Code ecosystem is exploding across 6+ scattered sources (Reddit 483k+96k members, YouTube tutorials, GitHub plugins, Anthropic docs, X, Substack). Keeping up requires checking all sources daily. There's no single curated view of what matters.

## Solution Approach
A Next.js 15 (App Router) static site with ISR that rebuilds daily via cron. A server-side data pipeline fetches from all 6 sources in parallel, Claude Haiku batch-classifies sentiment and generates the editorial, and SQLite stores daily snapshots. The frontend renders 7 newspaper-style sections using Anthropic's design tokens (warm neutrals, Lora serif + Poppins headings, generous whitespace).

## Relevant Files
Use these files to complete the task:

- `specs/claude-code-pulse-dashboard.md` — Full product spec with layout wireframes, design system, SQLite schema, data pipeline architecture, and API requirements
- `apps/task-manager/package.json` — Reference for Bun project conventions
- `apps/task-manager/tsconfig.json` — Reference for TypeScript config patterns

### New Files
- `apps/morning-with-coffee-and-claude/package.json` — Next.js 15 + Bun project config
- `apps/morning-with-coffee-and-claude/next.config.js` — Next.js config with ISR settings
- `apps/morning-with-coffee-and-claude/tailwind.config.js` — Anthropic design tokens
- `apps/morning-with-coffee-and-claude/tsconfig.json` — TypeScript strict config
- `apps/morning-with-coffee-and-claude/vercel.json` — Cron job config
- `apps/morning-with-coffee-and-claude/.env.local.example` — API key template
- `apps/morning-with-coffee-and-claude/src/app/layout.tsx` — Root layout with fonts + theme
- `apps/morning-with-coffee-and-claude/src/app/page.tsx` — Dashboard page (SSG with ISR)
- `apps/morning-with-coffee-and-claude/src/app/api/cron/aggregate/route.ts` — Daily aggregation endpoint
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
- `apps/morning-with-coffee-and-claude/src/lib/db.ts` — SQLite connection + queries
- `apps/morning-with-coffee-and-claude/src/lib/fetchers/reddit.ts` — Reddit JSON API fetcher
- `apps/morning-with-coffee-and-claude/src/lib/fetchers/youtube.ts` — YouTube Data API fetcher
- `apps/morning-with-coffee-and-claude/src/lib/fetchers/github.ts` — GitHub releases + repos
- `apps/morning-with-coffee-and-claude/src/lib/fetchers/anthropic.ts` — Changelog + blog scraper
- `apps/morning-with-coffee-and-claude/src/lib/fetchers/twitter.ts` — X/Twitter search
- `apps/morning-with-coffee-and-claude/src/lib/fetchers/rss.ts` — Substack RSS parser
- `apps/morning-with-coffee-and-claude/src/lib/sentiment.ts` — Haiku batch classifier
- `apps/morning-with-coffee-and-claude/src/lib/summarizer.ts` — Daily brief generator
- `apps/morning-with-coffee-and-claude/src/lib/ranker.ts` — Engagement x recency scoring
- `apps/morning-with-coffee-and-claude/src/lib/deduper.ts` — URL + fuzzy title dedup
- `apps/morning-with-coffee-and-claude/src/styles/globals.css` — Tailwind imports + custom props
- `apps/morning-with-coffee-and-claude/src/data/morning.db` — SQLite database file (generated)
- `apps/morning-with-coffee-and-claude/public/fonts/` — Self-hosted Poppins + Lora fonts

## Implementation Phases

### Phase 1: Foundation
- Scaffold Next.js 15 app with Bun runtime
- Configure Tailwind CSS 4 with Anthropic design tokens (colors, typography, component patterns)
- Self-host Poppins + Lora fonts
- Create base UI components (Card, Badge, Sparkline, Gauge)
- Set up SQLite schema (items, sentiment_daily, ecosystem tables)
- Seed database with sample/mock data for development
- Build static dashboard page rendering all 7 sections with mock data

### Phase 2: Core Implementation
- Implement all 6 data fetchers (Reddit, YouTube, GitHub, Anthropic, Twitter, RSS)
- Build ranking engine (engagement x recency_decay scoring)
- Build deduplication logic (URL exact match + fuzzy title match)
- Implement Haiku sentiment batch classifier
- Implement Haiku daily editorial summary generator
- Implement tip detection classifier
- Wire the aggregation cron endpoint that orchestrates the full pipeline

### Phase 3: Integration & Polish
- Connect real data to all 7 dashboard components (replace mock data)
- Add ISR revalidation configuration
- Responsive layout (mobile single-column, tablet 2-col)
- Loading skeletons for ISR transitions
- Error boundaries per section (one failing source shouldn't break the whole page)
- Vercel deployment configuration with cron jobs
- Create .env.local.example with all required API keys documented

## Team Orchestration

- You operate as the team lead and orchestrate the team to execute the plan.
- You NEVER operate directly on the codebase. You use Task and Task* tools.

### Team Members

- Builder
  - Name: builder-scaffold
  - Role: Project scaffolding, config files, design system, base UI components, SQLite schema + seed data
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: builder-fetchers
  - Role: All 6 data source fetchers + ranking + dedup logic
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: builder-ai-layer
  - Role: Haiku sentiment classifier, editorial summarizer, tip detector, aggregation cron endpoint
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

### 1. Project Scaffolding & Design System
- **Task ID**: scaffold
- **Depends On**: none
- **Assigned To**: builder-scaffold
- **Agent Type**: builder
- **Parallel**: false
- Create `apps/morning-with-coffee-and-claude/` directory structure matching the file structure in the spec
- Create `package.json` with Next.js 15, React 19, Tailwind CSS 4, better-sqlite3, @anthropic-ai/sdk as dependencies. Bun as runtime.
- Create `next.config.js` with ISR revalidation settings
- Create `tsconfig.json` with strict mode, ESNext target, bundler module resolution
- Create `tailwind.config.js` with full Anthropic design tokens (colors: dark/light/mid-gray/light-gray/orange/blue/green, fonts: Poppins/Lora/JetBrains Mono, font sizes: display/h1/h2/h3/body/small/xs)
- Create `src/styles/globals.css` with Tailwind imports and custom CSS properties
- Download and place Poppins (400, 500, 600) and Lora (400, 500, 600) font files in `public/fonts/`
- Create `src/app/layout.tsx` — root layout with font loading, metadata, theme wrapper
- Create base UI components: `src/components/ui/Card.tsx`, `Badge.tsx`, `Sparkline.tsx` (lightweight SVG), `Gauge.tsx` (circular SVG progress)
- Create `src/lib/db.ts` — SQLite connection using better-sqlite3, table creation (items, sentiment_daily, ecosystem), typed query functions
- Create seed script or inline seed data for development (10-15 sample items across sources, 1 sentiment_daily entry, 5 ecosystem entries)
- Create `.env.local.example` with all API key placeholders documented

### 2. Data Source Fetchers
- **Task ID**: fetchers
- **Depends On**: scaffold
- **Assigned To**: builder-fetchers
- **Agent Type**: builder
- **Parallel**: false
- Create `src/lib/fetchers/reddit.ts` — fetch top 25 posts/day from r/ClaudeAI and r/ClaudeCode using JSON API (append `.json` to URLs). Extract title, score, comment count, flair, URL, created_utc. Handle rate limits (10 req/min unauthenticated).
- Create `src/lib/fetchers/youtube.ts` — search YouTube Data API v3 for "Claude Code" content. 4 search queries (Claude Code, Claude Code hooks, Claude Code plugins, Claude Code tutorial). Extract title, channel, views, published date, thumbnail URL, video URL. Respect 10k daily quota.
- Create `src/lib/fetchers/github.ts` — fetch releases from `anthropics/claude-code`, trending repos with "claude-code" topic, and entries from `awesome-claude-code` repo. Extract stars, release notes, repo metadata.
- Create `src/lib/fetchers/anthropic.ts` — scrape Anthropic changelog and blog for Claude Code mentions. Use fetch + HTML parsing (or Firecrawl if available). Extract title, date, summary, URL.
- Create `src/lib/fetchers/twitter.ts` — search for "Claude Code" on X. Use Firecrawl scraping as primary approach (free), with X API v2 as optional upgrade path. Extract text, author, likes, retweets, URL.
- Create `src/lib/fetchers/rss.ts` — parse RSS feeds from Substack newsletters. Convert Substack URLs to RSS (append `/feed`). Parse XML, extract title, author, excerpt, URL, date.
- Create `src/lib/ranker.ts` — scoring function: `(engagement × 0.6) + (recency × 0.4)`. Normalize engagement scores to 0-1 across sources. Apply recency decay (exponential, half-life = 24h).
- Create `src/lib/deduper.ts` — deduplicate by exact URL match, then fuzzy title match (Levenshtein distance < 0.3). Categorize items: news | feature | tip | plugin | video.
- All fetchers should return a common `FetchedItem` interface and handle errors gracefully (log and return empty array on failure).

### 3. AI Classification & Aggregation Pipeline
- **Task ID**: ai-layer
- **Depends On**: fetchers
- **Assigned To**: builder-ai-layer
- **Agent Type**: builder
- **Parallel**: false
- Create `src/lib/sentiment.ts` — batch classify ~100 posts using Claude Haiku. Prompt: "Classify this Claude Code community post sentiment: positive/neutral/negative. Extract the key topic. Return JSON: {sentiment, confidence, topic, one_line_quote}". Process in batches of 10 for rate limit safety.
- Create `src/lib/summarizer.ts` — generate daily editorial summary using Claude Haiku. Input: top 10 items by score. Output: 2-4 sentence conversational summary highlighting the top 3 developments. Tone: like a tech newsletter intro, not sterile.
- Add tip detection to sentiment.ts — for posts classified as tips, add secondary classification: "Is this an actionable Claude Code tip?" (yes/no with confidence). Only tips with confidence > 0.8 are surfaced.
- Create `src/app/api/cron/aggregate/route.ts` — the daily aggregation endpoint that:
  1. Fetches from all 6 sources in parallel (Promise.allSettled)
  2. Deduplicates and ranks results
  3. Batch classifies sentiment via Haiku
  4. Generates editorial summary via Haiku
  5. Stores everything in SQLite (items + sentiment_daily tables)
  6. Returns JSON summary of what was aggregated
- Add Vercel cron authorization check (CRON_SECRET header validation)
- Create `vercel.json` with cron schedule: `"0 6 * * *"` (daily at 6 AM UTC)

### 4. Dashboard Components
- **Task ID**: components
- **Depends On**: scaffold
- **Assigned To**: builder-components
- **Agent Type**: builder
- **Parallel**: true (can run in parallel with fetchers and ai-layer since it uses mock data initially)
- Create `src/components/PulseSummary.tsx` — AI editorial summary section. Large Lora serif text, centered, warm `#faf9f5` card with thin border. Full date in newspaper style. Max-width 65ch for optimal reading length.
- Create `src/components/LatestNews.tsx` — Headlines section. 5-8 story links with source icon + headline + source name + relative time. Filter chips (All | Official | Community | Social). Clean list layout with bottom borders.
- Create `src/components/NewFeatures.tsx` — Changelog timeline. Version badges with bullet lists of changes. Breaking changes get orange left border. Compact vertical timeline feel.
- Create `src/components/SentimentGauge.tsx` — Community mood section. Left: large percentage + emoji + 30-day SVG sparkline using Sparkline component. Right: 2-3 representative community quotes. Horizontal stacked bar for sentiment breakdown (green/gray/red).
- Create `src/components/EcosystemGrid.tsx` — Trending plugins/hooks/skills. 6-9 cards in 3-column responsive grid. Each card: category badge, name, author, 2-line description, stars + freshness. Category tabs: All | Plugins | Hooks | Skills | MCP Servers.
- Create `src/components/YouTubeCarousel.tsx` — Top 5 video cards. Horizontal row (scrollable on mobile). 16:9 thumbnails with play overlay on hover. Title (2 lines), channel, view count.
- Create `src/components/TopTips.tsx` — 3-5 stacked quote cards. Lightbulb icon, tip text, attribution with upvote count, link to source. Orange left border accent.
- Create `src/components/FilterChips.tsx` — Reusable filter chip component with active state styling. Client-side filtering (no server round-trip).
- Create `src/components/SentimentBadge.tsx` — Colored pill: positive (green), neutral (gray), negative (subtle red).
- Create `src/app/page.tsx` — Main dashboard page. Imports all 7 section components. Section dividers with ALL-CAPS labels. `py-16` spacing between sections. Footer with sources and update time. Initially renders with mock/seed data.
- All components must follow the design system: warm neutrals, no shadows (border only), generous whitespace, restrained color usage.

### 5. Integration & Polish
- **Task ID**: integration
- **Depends On**: components, ai-layer
- **Assigned To**: builder-integration
- **Agent Type**: builder
- **Parallel**: false
- Wire all 7 components to read from SQLite via `src/lib/db.ts` query functions (replace mock data with real queries)
- Configure ISR revalidation in page.tsx (`export const revalidate = 3600` — 1 hour)
- Implement responsive breakpoints: desktop (max-w-5xl centered, 2-column layout for headlines/changelog), tablet (2-col → 1-col), mobile (single column, stacked cards, scrollable YouTube carousel)
- Add loading skeletons for each section (animated pulse placeholders matching section layout)
- Add error boundaries per section — if one data source fails, render a graceful "Section temporarily unavailable" message instead of crashing the whole page
- Final Vercel deployment configuration (vercel.json with cron, .env setup documentation)
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
1. `apps/morning-with-coffee-and-claude/package.json` exists with Next.js 15 and correct dependencies
2. `apps/morning-with-coffee-and-claude/tsconfig.json` exists with strict mode enabled
3. All ~35 new files listed in "New Files" section exist
4. `cd apps/morning-with-coffee-and-claude && bunx tsc --noEmit` compiles without errors
5. `tailwind.config.js` contains all Anthropic design tokens (colors: dark/light/mid-gray/light-gray/orange/blue/green)
6. SQLite schema creates 3 tables (items, sentiment_daily, ecosystem) with correct columns
7. All 6 fetchers (reddit, youtube, github, anthropic, twitter, rss) export async functions that return `FetchedItem[]`
8. Sentiment classifier accepts an array of items and returns sentiment classifications via Haiku
9. Editorial summarizer generates a 2-4 sentence summary from top items via Haiku
10. The cron endpoint (`/api/cron/aggregate`) orchestrates all 6 fetchers + AI classification + SQLite storage
11. All 7 dashboard sections render (PulseSummary, LatestNews, NewFeatures, SentimentGauge, EcosystemGrid, YouTubeCarousel, TopTips)
12. Page uses Anthropic design: warm background (#faf9f5), serif body (Lora), heading (Poppins), no harsh white/black
13. Responsive layout works at mobile (375px), tablet (768px), and desktop (1280px) widths
14. Each section has an error boundary that doesn't crash the whole page
15. `vercel.json` contains cron configuration for daily 6 AM UTC runs
16. `.env.local.example` documents all required API keys

## Validation Commands
- `ls apps/morning-with-coffee-and-claude/src/` — Verify directory structure exists
- `ls apps/morning-with-coffee-and-claude/src/lib/fetchers/` — Verify all fetcher files
- `ls apps/morning-with-coffee-and-claude/src/components/` — Verify all component files
- `cd apps/morning-with-coffee-and-claude && bunx tsc --noEmit` — TypeScript compiles clean
- `grep -l "anthropic" apps/morning-with-coffee-and-claude/tailwind.config.js` — Design tokens present
- `grep -l "better-sqlite3" apps/morning-with-coffee-and-claude/package.json` — SQLite dependency present
- `grep -l "revalidate" apps/morning-with-coffee-and-claude/src/app/page.tsx` — ISR configured
- `cat apps/morning-with-coffee-and-claude/vercel.json` — Cron job configured

## Notes
- The spec at `specs/claude-code-pulse-dashboard.md` contains complete wireframes, SQLite schema, design tokens, and component patterns — builders should read it as their primary reference
- Firecrawl is used for Anthropic blog + X scraping — the Firecrawl MCP server is available in this environment
- better-sqlite3 is chosen over Bun's built-in SQLite for Next.js server compatibility
- Font files (Poppins + Lora) should be self-hosted via `next/font/local` for performance, not Google Fonts CDN
- The X/Twitter fetcher should use Firecrawl as primary (free) with X API as optional upgrade — don't require a paid X API key
- All fetchers must handle failures gracefully — a single source being down should not prevent the rest from working
- The aggregation pipeline uses `Promise.allSettled` not `Promise.all` to ensure partial data is still useful

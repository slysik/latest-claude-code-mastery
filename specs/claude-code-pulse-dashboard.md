# Morning with Coffee & Claude

> Your daily Claude Code newspaper. Five minutes with your coffee — and you're caught up on everything that matters.

## Overview

**Problem**: The Claude Code ecosystem is exploding — 9,000+ plugins, two massive subreddits (r/ClaudeAI 483k, r/ClaudeCode 96k), daily YouTube tutorials, SDK releases, community tips, and Anthropic announcements. It's scattered across Reddit, X, Substack, GitHub, YouTube, and Anthropic's own docs. Keeping up means checking 6+ sources every day.

**Solution**: A single-page "morning edition" that curates the day's Claude Code news into a beautiful, readable layout modeled after Anthropic's own site. AI-generated editorial summary up top, then sections you scan like a newspaper — headlines, what's new, what the community thinks, what to watch, what to try. Every item links out so you can drill deeper when something catches your eye.

**Core Experience**: You open it once a day. You scroll for 3-5 minutes. You leave knowing everything that happened in the Claude Code world. That's it. That's the product.

---

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Runtime** | Bun | Already in project toolchain, fast startup |
| **Framework** | Next.js 15 (App Router) | SSG with ISR for daily rebuilds, RSC for data fetching |
| **Styling** | Tailwind CSS 4 | Rapid Anthropic theming via design tokens |
| **Data Fetching** | Server Actions + Cron | Daily aggregation via Vercel Cron or local cron |
| **Sentiment** | Anthropic API (Haiku) | Cheap batch classification of community posts |
| **Storage** | SQLite (via better-sqlite3) | Zero-infra, file-based, perfect for daily snapshots |
| **Deployment** | Vercel (free tier) | ISR + Cron Jobs built-in |

---

## Data Sources & APIs

### 1. Reddit (Primary Community Signal)
- **Subreddits**: `r/ClaudeAI` (483k members), `r/ClaudeCode` (96k members)
- **API**: Reddit JSON API (`/.json` suffix) or Snoowrap
- **Fetch**: Top 25 posts/day from each, sorted by `hot` and `top` (24h)
- **Extract**: Title, score, comment count, flair, URL, created_utc
- **Rate Limit**: 60 req/min with OAuth, 10 req/min without

### 2. YouTube (Tutorial & Tips Content)
- **API**: YouTube Data API v3
- **Search Queries**: `"Claude Code"`, `"Claude Code hooks"`, `"Claude Code plugins"`, `"Claude Code tutorial"`
- **Fetch**: Top 20 videos/week by relevance + view count
- **Extract**: Title, channel, views, published date, thumbnail URL, video URL
- **Quota**: 10,000 units/day (search = 100 units each, so 4 searches = 400)

### 3. Anthropic Official
- **Changelog**: `https://docs.anthropic.com/en/changelog` (scrape via Firecrawl or fetch)
- **Blog**: `https://www.anthropic.com/news` (scrape for Claude Code mentions)
- **Docs**: `https://docs.anthropic.com/en/docs/claude-code` (diff for changes)
- **GitHub Releases**: `https://api.github.com/repos/anthropics/claude-code/releases`
- **Extract**: Title, date, summary, URL, tags

### 4. X / Twitter (Real-time Pulse)
- **Accounts to Track**: `@AnthropicAI`, `@alexalbert__`, `@claude_code`, `@birch_ai`
- **Search**: `"Claude Code" min_faves:10` (filter noise)
- **API**: X API v2 (Basic tier $100/mo) OR scrape via Nitter/RapidAPI
- **Alternative**: Use Firecrawl MCP to scrape X search results (free)
- **Extract**: Text, author, likes, retweets, URL, timestamp

### 5. Substack & Blogs
- **Key Substacks**: Anthropic's blog, AI engineering newsletters, Claude community blogs
- **RSS Feeds**: Convert Substack → RSS (`/feed` suffix)
- **Scrape Targets**: `creatoreconomy.so`, `claudelog.com`, `mays.co`
- **Extract**: Title, author, excerpt, URL, date

### 6. GitHub (Ecosystem Health)
- **Repos**: `anthropics/claude-code`, `hesreallyhim/awesome-claude-code`
- **Plugin Registries**: `claudecodeplugin.com`, `claudemarketplaces.com`
- **API**: GitHub REST API (unauthenticated: 60 req/hr, authenticated: 5,000)
- **Extract**: Stars, new issues, release notes, trending repos with "claude-code" topic

---

## The Morning Edition — Page Layout

The page reads top-to-bottom like a newspaper. No tabs, no navigation, no clicking around. You scroll and absorb. Every section has a clear editorial purpose.

### Layout: The Full Page

```
+------------------------------------------------------------------+
|                                                                    |
|  ☕ MORNING WITH COFFEE & CLAUDE                                  |
|  Sunday, February 9, 2026                                         |
|  ─────────────────────────────────────────────────────────────    |
|                                                                    |
|  ┌──────────────────────────────────────────────────────────┐     |
|  │                                                            │     |
|  │  "Claude Code shipped agent teams this week, the plugin   │     |
|  │   ecosystem hit 9,000, and the community discovered a     │     |
|  │   plan-mode workflow that cuts project setup time in half."│     |
|  │                                                            │     |
|  │               — Today's AI-Generated Editorial             │     |
|  └──────────────────────────────────────────────────────────┘     |
|                                                                    |
|  ══════════════════ ABOVE THE FOLD ═══════════════════════════    |
|                                                                    |
|  HEADLINES                              WHAT'S NEW                |
|  ┌─────────────────────────────┐   ┌──────────────────────┐      |
|  │ ● Anthropic launches...     │   │ v1.0.28              │      |
|  │ ● Community plugin hits...  │   │ ├ Agent team support  │      |
|  │ ● New hooks API for...      │   │ ├ Plugin SDK v2       │      |
|  │ ● SDK update enables...     │   │ └ 3 bug fixes         │      |
|  │ ● Reddit thread reveals...  │   │                       │      |
|  │   [5-8 stories w/ links]    │   │ v1.0.27              │      |
|  └─────────────────────────────┘   │ ├ Hooks matchers      │      |
|                                      │ └ Status line API    │      |
|                                      └──────────────────────┘      |
|                                                                    |
|  ══════════════════ THE COMMUNITY ════════════════════════════    |
|                                                                    |
|  COMMUNITY MOOD          VOICES FROM THE COMMUNITY                |
|  ┌──────────────┐   ┌──────────────────────────────────────┐     |
|  │   😊 78%     │   │ "Plan mode + CLAUDE.md changed how   │     |
|  │  ▁▂▃▅▇█▇▅  │   │  I approach every project."           │     |
|  │  30-day trend │   │  — u/devuser42 (↑234)    [→ link]    │     |
|  │              │   │                                        │     |
|  │  ■ Pos  78% │   │ "Hooks are powerful but docs could    │     |
|  │  ■ Neu  15% │   │  use more examples."                   │     |
|  │  ■ Neg   7% │   │  — @coder_jane (♡89)     [→ link]    │     |
|  └──────────────┘   └──────────────────────────────────────┘     |
|                                                                    |
|  ══════════════════ WHAT TO TRY ══════════════════════════════    |
|                                                                    |
|  TRENDING HOOKS, PLUGINS & SKILLS                                 |
|  ┌────────────┐  ┌────────────┐  ┌────────────┐                 |
|  │ 🔌 Ralph   │  │ 🪝 Safety  │  │ ⚡ Sentient │                 |
|  │  Wiggum    │  │  Net       │  │            │                 |
|  │ Plugin     │  │ Hook       │  │ Plugin     │                 |
|  │ ★ 1.2k     │  │ ★ 890      │  │ ★ 650      │                 |
|  │ [→ GitHub] │  │ [→ GitHub] │  │ [→ GitHub] │                 |
|  └────────────┘  └────────────┘  └────────────┘                 |
|    + 3-6 more cards in responsive grid                            |
|                                                                    |
|  ══════════════════ WATCH & LEARN ════════════════════════════    |
|                                                                    |
|  TOP 5 YOUTUBE THIS WEEK                                          |
|  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  |
|  │ ▶ thumb │ │ ▶ thumb │ │ ▶ thumb │ │ ▶ thumb │ │ ▶ thumb │  |
|  │ Title.. │ │ Title.. │ │ Title.. │ │ Title.. │ │ Title.. │  |
|  │ 12k vws │ │ 8k vws  │ │ 6k vws  │ │ 5k vws  │ │ 3k vws  │  |
|  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘  |
|                                                                    |
|  ══════════════════ TIPS OF THE DAY ══════════════════════════    |
|                                                                    |
|  ┌──────────────────────────────────────────────────────────┐     |
|  │  💡 "Always start in plan mode (Shift+Tab) before        │     |
|  │      coding — saves hours going down the wrong path."     │     |
|  │      — u/devuser42 on r/ClaudeCode (↑ 234)   [→ link]   │     |
|  ├──────────────────────────────────────────────────────────┤     |
|  │  💡 "Use /clear when context fills up — keeps CLAUDE.md   │     |
|  │      loaded but resets conversation."                      │     |
|  │      — u/ai_builder on r/ClaudeAI (↑ 189)    [→ link]   │     |
|  ├──────────────────────────────────────────────────────────┤     |
|  │  💡 "Pre-tool-use hooks + validators = automated code     │     |
|  │      quality without thinking about it."                   │     |
|  │      — @hookmaster (♡ 145)                    [→ link]   │     |
|  └──────────────────────────────────────────────────────────┘     |
|                                                                    |
|  ─────────────────────────────────────────────────────────────    |
|  ☕ Morning with Coffee & Claude · Updated daily at 6:00 AM UTC   |
|  Sources: Reddit · YouTube · GitHub · Anthropic · X · Substack    |
|  Curated by AI · Built with Next.js + Claude Haiku                |
|  ─────────────────────────────────────────────────────────────    |
+------------------------------------------------------------------+
```

### Section-by-Section Editorial Guide

#### 1. The Editorial — "Today's Briefing" (Above the Fold)
- **Purpose**: The single most important thing on the page. You read this and you're 80% caught up.
- **Source**: All aggregated data from the day
- **Generation**: Claude Haiku writes a 2-4 sentence editorial summary of the day's top 3 developments
- **Tone**: Conversational, opinionated, like a tech newsletter intro — not sterile
- **Display**: Large Lora serif text, centered, subtle warm `#faf9f5` card with thin border
- **Date**: Full human-readable date ("Sunday, February 9, 2026") — newspaper feel
- **Update**: Daily at 6:00 AM UTC

#### 2. Headlines — Top Stories (Left Column)
- **Purpose**: Scan 5-8 links in 30 seconds. Know what happened.
- **Sources**: Anthropic blog, GitHub releases, X viral posts, Substack articles, top Reddit threads
- **Format**: Clean list — source icon + headline + source name + relative date
  ```
  ● Anthropic launches agent team orchestration — anthropic.com · 2h ago
  ● Community plugin Ralph Wiggum hits 1k stars — github.com · 8h ago
  ● New hooks API enables pre-compact interception — r/ClaudeCode · 14h ago
  ```
- **Interaction**: Each headline is a link → opens source in new tab
- **Sorting**: Weighted score: `(engagement × 0.6) + (recency × 0.4)`
- **Filter Chips**: All | Official | Community | Social (subtle, above the list)

#### 3. What's New — Changelog & Releases (Right Column, Beside Headlines)
- **Purpose**: At-a-glance version history. "Did anything ship?"
- **Sources**: Anthropic changelog, GitHub releases (`anthropics/claude-code`), npm versions
- **Format**: Compact timeline — version badge + bullet list of changes
  ```
  v1.0.28 — Feb 8, 2026
  ├ Agent team support
  ├ Plugin SDK v2 with hooks matchers
  └ Fixed 3 edge cases in pre-compact
  ```
- **Highlight**: Breaking changes get a subtle orange left-border
- **Interaction**: Version badge links to full release notes

#### 4. Community Mood — Sentiment Dashboard
- **Purpose**: "How is the community feeling about Claude Code right now?"
- **Left**: Sentiment gauge — large percentage + emoji + 30-day SVG sparkline
- **Right**: 2-3 representative community quotes (best positive, most constructive negative)
- **Breakdown Bar**: Horizontal stacked bar — green/gray/red segments with percentages
- **Method**: Batch classify ~100 Reddit + X posts via Claude Haiku
  ```
  Classify this Claude Code community post sentiment: positive/neutral/negative.
  Extract the key topic. Return JSON: {sentiment, confidence, topic, one_line_quote}
  ```
- **Why It Matters**: Gives you the temperature without reading 100 Reddit threads

#### 5. Trending Hooks, Plugins & Skills — "What to Try"
- **Purpose**: Discovery. "What's new and good in the ecosystem?"
- **Sources**: GitHub (`awesome-claude-code` repo), `claudecodeplugin.com`, Reddit mentions
- **Card Grid**: 6-9 cards in responsive 3-column grid
- **Card Layout**:
  ```
  ┌─────────────────────┐
  │ 🔌  Plugin           │  ← Category badge (Hook/Plugin/Skill/MCP)
  │ Ralph Wiggum         │  ← Name (bold, linked)
  │ by @anthropic        │  ← Author
  │                      │
  │ Autonomous multi-    │  ← Description (2 lines max)
  │ hour coding sessions │
  │                      │
  │ ★ 1,247  · 3d ago   │  ← Stars + freshness
  └─────────────────────┘
  ```
- **Ranking**: `(github_stars × 0.4) + (reddit_mentions × 0.3) + (recency × 0.3)`
- **Category Tabs**: All | Plugins | Hooks | Skills | MCP Servers

#### 6. Watch & Learn — Top 5 YouTube Videos
- **Purpose**: Best video content this week. Visual, scannable, click-to-watch.
- **Sources**: YouTube Data API v3 search for Claude Code content
- **Layout**: Horizontal row of 5 cards (scrollable on mobile)
- **Card**:
  ```
  ┌───────────────────┐
  │                   │
  │    ▶ Thumbnail     │  ← 16:9 thumbnail with play overlay on hover
  │                   │
  │ Build a Research   │  ← Title (2 lines max)
  │ Agent in 15 Min    │
  │ Peter Yang · 12k ▶ │  ← Channel + view count
  └───────────────────┘
  ```
- **Ranking**: `views × recency_decay` (strong preference for last 7 days)
- **Interaction**: Click → YouTube in new tab

#### 7. Tips of the Day — Community Wisdom
- **Purpose**: Actionable tips from real users. The "did you know?" section.
- **Sources**: Reddit posts tagged tips/tricks, X tips with high engagement
- **Format**: Stacked quote cards with generous padding
  ```
  ┌──────────────────────────────────────────────────┐
  │  💡 "Always start in plan mode (Shift+Tab) before │
  │      coding — saves hours."                        │
  │      — u/devuser42 on r/ClaudeCode (↑ 234)       │
  └──────────────────────────────────────────────────┘
  ```
- **Count**: 3-5 tips (quality over quantity)
- **Curation**: Haiku classifies each post: "Is this an actionable Claude Code tip?" (yes/no)
- **Ranking**: `upvotes × tip_confidence` — only tips with confidence > 0.8 shown
- **Each tip links** to the original thread/post for context

---

## Anthropic Design System

### Color Tokens (Tailwind Config)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        anthropic: {
          dark: '#141413',        // Primary text, dark backgrounds
          light: '#faf9f5',       // Page background, light text
          'mid-gray': '#b0aea5',  // Secondary text, borders
          'light-gray': '#e8e6dc',// Card backgrounds, dividers
          orange: '#d97757',      // Primary accent (CTAs, highlights)
          blue: '#6a9bcc',        // Secondary accent (links, info)
          green: '#788c5d',       // Tertiary accent (positive sentiment)
        }
      },
      fontFamily: {
        heading: ['Poppins', 'system-ui', 'sans-serif'],
        body: ['Lora', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        'display': ['2.5rem', { lineHeight: '1.2', fontWeight: '600' }],
        'h1': ['1.875rem', { lineHeight: '1.3', fontWeight: '600' }],
        'h2': ['1.5rem', { lineHeight: '1.35', fontWeight: '500' }],
        'h3': ['1.125rem', { lineHeight: '1.4', fontWeight: '500' }],
        'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'small': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'xs': ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],
      }
    }
  }
}
```

### Design Principles — "The Anthropic Newspaper"

The goal is a page that feels like reading Anthropic's own blog — calm, typographically rich, unhurried. Not a SaaS dashboard. Not a monitoring tool. A reading experience.

1. **Warm Neutrals, Never Harsh**: No pure white (`#fff`) or pure black (`#000`). Page bg is `#faf9f5` (warm parchment), text is `#141413` (soft charcoal). This is the single most important detail — it makes the page feel like paper, not a screen.
2. **Typography-First**: Lora serif for all body text and quotes — optimized for reading. Poppins only for section headings, badges, and nav labels. Large line-height (1.6-1.8) throughout. The text should breathe.
3. **Newspaper Sections**: Clear `═══════` style dividers between sections with ALL-CAPS section labels (`HEADLINES`, `THE COMMUNITY`, `WHAT TO TRY`). Each section is its own "page" of the paper.
4. **Generous Whitespace**: `py-16` between sections, `gap-8` in grids, `p-8` card padding. White space is the luxury — use more than you think you need.
5. **Restrained Color**: 95% of the page is warm grayscale. Orange (`#d97757`) appears only for: the date, breaking changes, and active filter chips. Blue (`#6a9bcc`) for links only. Green (`#788c5d`) for positive sentiment only.
6. **No Shadows, No Gradients**: Use `border` (1px `#e8e6dc`) and subtle background shifts. Cards differentiate via bg color, not elevation. Exception: `shadow-sm` on hover for interactive cards.
7. **Readable at Every Width**: Desktop (max-w-5xl centered), tablet (2-col → 1-col), mobile (single column with stacked cards). The editorial summary should be max 65ch wide — optimal reading length.
8. **Links are Obvious**: Every item that drills down has a visible `→` arrow or underline. External links open in new tabs. The user should never wonder "is this clickable?"

### Component Patterns

```
Page:           bg-anthropic-light max-w-5xl mx-auto px-6 md:px-12
Editorial Card: bg-anthropic-light-gray/30 border border-anthropic-light-gray rounded-lg p-8 max-w-[65ch] mx-auto
Section Divider: border-t-2 border-anthropic-light-gray pt-12 mt-12
Section Label:  font-heading text-anthropic-mid-gray text-xs uppercase tracking-[0.2em] mb-6
Story Card:     bg-transparent border-b border-anthropic-light-gray py-4 last:border-0
Plugin Card:    bg-anthropic-light-gray/30 border border-anthropic-light-gray rounded-lg p-6 hover:bg-anthropic-light-gray/50
Video Card:     bg-transparent rounded-lg overflow-hidden group cursor-pointer
Quote Card:     bg-anthropic-light-gray/20 border-l-4 border-anthropic-orange/40 pl-6 py-4 rounded-r-lg
Badge:          bg-anthropic-orange/10 text-anthropic-orange text-xs font-heading px-2.5 py-0.5 rounded-full
Link:           text-anthropic-blue hover:text-anthropic-orange transition-colors underline underline-offset-4
Heading:        font-heading text-anthropic-dark tracking-tight
Body:           font-body text-anthropic-dark/85 leading-relaxed
Meta:           font-body text-anthropic-mid-gray text-sm
Source Icon:    w-4 h-4 inline-block mr-2 opacity-60 (Reddit/YT/GH/X/Anthropic SVGs)
Footer:         text-center font-body text-anthropic-mid-gray text-sm py-12 border-t border-anthropic-light-gray
```

---

## Data Pipeline

### Daily Cron Job (6:00 AM UTC)

```
┌─────────────────────────────────────────────────┐
│              DAILY AGGREGATION JOB              │
│         (Vercel Cron or local crontab)          │
├─────────────────────────────────────────────────┤
│                                                   │
│  1. FETCH (parallel)                              │
│     ├── Reddit API → r/ClaudeAI + r/ClaudeCode   │
│     ├── YouTube Data API → search results          │
│     ├── GitHub API → releases + trending repos     │
│     ├── Firecrawl → Anthropic blog + changelog     │
│     ├── RSS → Substack feeds                       │
│     └── Firecrawl/X API → Twitter search           │
│                                                   │
│  2. CLASSIFY (batch)                              │
│     └── Claude Haiku: sentiment + topic tagging    │
│         ~100 posts × $0.0005 = ~$0.05/day          │
│                                                   │
│  3. RANK & DEDUPLICATE                            │
│     ├── Score = engagement × recency_decay         │
│     ├── Dedupe by URL + fuzzy title match          │
│     └── Categorize: news | feature | tip | plugin │
│                                                   │
│  4. GENERATE SUMMARY                              │
│     └── Claude Haiku: daily brief from top items   │
│                                                   │
│  5. STORE                                         │
│     └── Write to SQLite: dashboard_snapshots table │
│                                                   │
│  6. REBUILD                                       │
│     └── Trigger ISR revalidation or static rebuild │
│                                                   │
└─────────────────────────────────────────────────┘
```

### SQLite Schema

```sql
-- Daily aggregated items
CREATE TABLE items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,              -- '2026-02-09'
  source TEXT NOT NULL,            -- 'reddit' | 'youtube' | 'github' | 'x' | 'anthropic' | 'substack'
  category TEXT NOT NULL,          -- 'news' | 'feature' | 'tip' | 'plugin' | 'video'
  title TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  author TEXT,
  excerpt TEXT,                    -- First 200 chars or AI summary
  thumbnail_url TEXT,              -- YouTube thumbnails, OG images
  engagement_score REAL DEFAULT 0, -- Normalized 0-1 score
  sentiment TEXT,                  -- 'positive' | 'neutral' | 'negative'
  sentiment_confidence REAL,       -- 0-1
  topic_tags TEXT,                 -- JSON array: ["hooks", "plugins", "sdk"]
  raw_metrics TEXT,                -- JSON: {upvotes, views, stars, likes, comments}
  fetched_at TEXT NOT NULL,        -- ISO timestamp
  created_at TEXT NOT NULL         -- Source publish date
);

-- Daily sentiment snapshots
CREATE TABLE sentiment_daily (
  date TEXT PRIMARY KEY,
  positive_pct REAL,
  neutral_pct REAL,
  negative_pct REAL,
  sample_size INTEGER,
  top_positive_id INTEGER REFERENCES items(id),
  top_negative_id INTEGER REFERENCES items(id),
  summary TEXT                     -- AI-generated daily brief
);

-- Plugin/hook/skill registry cache
CREATE TABLE ecosystem (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,              -- 'hook' | 'plugin' | 'skill' | 'mcp_server'
  author TEXT,
  description TEXT,
  github_url TEXT,
  stars INTEGER DEFAULT 0,
  last_updated TEXT,
  category_tags TEXT,              -- JSON array
  mention_count INTEGER DEFAULT 0  -- Reddit/X mentions in last 30 days
);

CREATE INDEX idx_items_date ON items(date);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_source ON items(source);
```

### Cost Estimate (Daily)

| Service | Usage | Cost |
|---------|-------|------|
| Claude Haiku (sentiment) | ~100 classifications | ~$0.05 |
| Claude Haiku (summary) | 1 generation | ~$0.01 |
| YouTube API | 4 search queries | Free (within 10k quota) |
| Reddit API | ~10 requests | Free |
| GitHub API | ~5 requests | Free |
| Firecrawl (scraping) | ~10 pages | Free tier (500/mo) |
| Vercel hosting | Static + cron | Free tier |
| **Total** | | **~$0.06/day (~$1.80/mo)** |

---

## File Structure

```
apps/morning-with-coffee-and-claude/
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── bun.lock
├── .env.local                    # API keys
├── public/
│   └── fonts/                    # Poppins + Lora self-hosted
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout with fonts + theme
│   │   ├── page.tsx              # Dashboard (SSG with ISR)
│   │   └── api/
│   │       └── cron/
│   │           └── aggregate/
│   │               └── route.ts  # Daily aggregation endpoint
│   ├── components/
│   │   ├── PulseSummary.tsx      # Section 1: AI daily brief
│   │   ├── LatestNews.tsx        # Section 2: News feed
│   │   ├── NewFeatures.tsx       # Section 3: Changelog timeline
│   │   ├── SentimentGauge.tsx    # Section 4: Gauge + sparkline
│   │   ├── EcosystemGrid.tsx     # Section 5: Hooks/plugins/skills
│   │   ├── YouTubeCarousel.tsx   # Section 6: Video cards
│   │   ├── TopTips.tsx           # Section 7: Quote cards
│   │   ├── FilterChips.tsx       # Reusable source filter
│   │   ├── SentimentBadge.tsx    # Colored pill: pos/neu/neg
│   │   └── ui/                   # Base components
│   │       ├── Card.tsx
│   │       ├── Badge.tsx
│   │       ├── Sparkline.tsx     # Lightweight SVG sparkline
│   │       └── Gauge.tsx         # Circular progress gauge
│   ├── lib/
│   │   ├── db.ts                 # SQLite connection + queries
│   │   ├── fetchers/
│   │   │   ├── reddit.ts         # Reddit JSON API fetcher
│   │   │   ├── youtube.ts        # YouTube Data API fetcher
│   │   │   ├── github.ts         # GitHub releases + repos
│   │   │   ├── anthropic.ts      # Changelog + blog scraper
│   │   │   ├── twitter.ts        # X/Twitter search
│   │   │   └── rss.ts            # Substack RSS parser
│   │   ├── sentiment.ts          # Haiku batch classifier
│   │   ├── summarizer.ts         # Daily brief generator
│   │   ├── ranker.ts             # Engagement × recency scoring
│   │   └── deduper.ts            # URL + fuzzy title dedup
│   ├── data/
│   │   └── morning.db             # SQLite database file
│   └── styles/
│       └── globals.css           # Tailwind imports + custom props
└── vercel.json                   # Cron job config
```

---

## API Keys Required

```env
# .env.local
ANTHROPIC_API_KEY=sk-ant-...       # Sentiment + summarization (Haiku)
YOUTUBE_API_KEY=AIza...            # YouTube Data API v3
REDDIT_CLIENT_ID=...               # Reddit OAuth (optional, increases rate limit)
REDDIT_CLIENT_SECRET=...           # Reddit OAuth (optional)
GITHUB_TOKEN=ghp_...               # GitHub API (optional, increases rate limit)
FIRECRAWL_API_KEY=fc-...           # Web scraping (Anthropic blog, X)
```

---

## Implementation Phases

### Phase 1: Foundation (Day 1)
- [ ] Scaffold Next.js app with Bun in `apps/morning-with-coffee-and-claude/`
- [ ] Configure Tailwind with Anthropic design tokens
- [ ] Self-host Poppins + Lora fonts
- [ ] Create base UI components (Card, Badge, layout)
- [ ] Set up SQLite schema + seed with sample data
- [ ] Build static dashboard page with mock data

### Phase 2: Data Pipeline (Day 2)
- [ ] Implement Reddit fetcher (JSON API)
- [ ] Implement YouTube fetcher (Data API v3)
- [ ] Implement GitHub fetcher (releases + repos)
- [ ] Implement Anthropic blog/changelog scraper
- [ ] Implement RSS fetcher for Substack
- [ ] Build ranking + dedup logic
- [ ] Wire aggregation cron endpoint

### Phase 3: AI Layer (Day 3)
- [ ] Implement Haiku sentiment classifier (batch)
- [ ] Implement daily summary generator
- [ ] Implement tip detection classifier
- [ ] Store results in SQLite

### Phase 4: Dashboard Components (Day 4)
- [ ] PulseSummary with warm serif styling
- [ ] LatestNews with source icons + filter chips
- [ ] NewFeatures timeline with version badges
- [ ] SentimentGauge (SVG circular gauge + sparkline)
- [ ] EcosystemGrid with category filtering
- [ ] YouTubeCarousel with thumbnail cards
- [ ] TopTips quote cards with attribution

### Phase 5: Polish & Deploy (Day 5)
- [ ] Responsive layout (mobile single-column)
- [ ] Loading skeletons for ISR
- [ ] Error boundaries per section
- [ ] Vercel deployment + cron configuration
- [ ] README with setup instructions

---

## Key Design Decisions

1. **Newspaper, Not Dashboard**: No interactive charts, no real-time updates, no filters that require mental effort. You read it top to bottom. The AI did the curation — you just consume.
2. **SSG + ISR over SSR**: This is a daily publication, not a live feed. Static generation with 1-hour ISR revalidation. Loads instantly, like a cached page should.
3. **SQLite over Postgres**: Zero infrastructure. File-based DB perfect for daily snapshots of a publication. Can migrate to Turso (SQLite edge) later if traffic demands it.
4. **Haiku for All AI Work**: Sentiment classification ($0.05/day for ~100 posts) + editorial summary ($0.01/day). Sonnet would be 12x more for marginal quality gain on a classification task.
5. **No Auth, No Accounts**: Public page. Bookmark it. Open it with coffee. That's the entire UX.
6. **Firecrawl for Scraping**: Anthropic blog + changelog scraping without building custom scrapers. Free tier handles 500 pages/month — we need ~300.
7. **RSS for Substacks**: More reliable than scraping. Every Substack exposes `/feed`. Parse once, get structured data.
8. **External Links, Not Summaries**: The dashboard curates and surfaces — it doesn't try to replace the source. Every item links out. The value is in saving you the discovery time, not the reading time.

---

## Success Criteria

- [ ] Page loads in <2s (Lighthouse Performance >90) — instant like a cached newspaper
- [ ] All 7 sections populated with real data from 6+ sources
- [ ] AI editorial summary is genuinely useful (not generic filler)
- [ ] Sentiment gauge reflects actual community mood with representative quotes
- [ ] Daily cron runs reliably at 6 AM UTC — fresh edition every morning
- [ ] Mobile layout reads like a single-column newsletter (usable on phone with coffee)
- [ ] Total monthly cost < $5
- [ ] Every item has a working drill-down link to its source
- [ ] A user can scan the entire page in under 5 minutes and feel fully caught up
- [ ] The design feels like Anthropic's site — warm, readable, unhurried

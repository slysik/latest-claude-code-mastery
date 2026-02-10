import { createClient, type Client } from '@libsql/client'
import type {
  FetchedItem,
  ClassifiedItem,
  SentimentDailySnapshot,
  EcosystemEntry,
  DashboardData,
  ChangelogHighlight,
  ReviewTelemetryEntry,
  ReviewTelemetrySummary,
  AgentConfigMeta,
} from './types'

// ---------------------------------------------------------------------------
// Lazy-init singleton
// ---------------------------------------------------------------------------

let client: Client | null = null

function getDb(): Client {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  }
  return client
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function safeParseJson<T>(json: string | null, fallback: T): T {
  if (!json) return fallback
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}

function rowToClassifiedItem(row: Record<string, unknown>): ClassifiedItem {
  return {
    id: row.id as number,
    date: row.date as string,
    source: row.source as ClassifiedItem['source'],
    category: row.category as ClassifiedItem['category'],
    title: row.title as string,
    url: row.url as string,
    author: (row.author as string) ?? null,
    excerpt: (row.excerpt as string) ?? null,
    thumbnailUrl: (row.thumbnail_url as string) ?? null,
    engagementScore: (row.engagement_score as number) ?? 0,
    rawMetrics: safeParseJson<Record<string, number>>(
      row.raw_metrics as string | null,
      {},
    ),
    sentiment: (row.sentiment as ClassifiedItem['sentiment']) ?? null,
    sentimentConfidence: (row.sentiment_confidence as number) ?? null,
    topicTags: safeParseJson<string[]>(row.topic_tags as string | null, []),
    oneLineQuote: (row.one_line_quote as string) ?? null,
    isTip: Boolean(row.is_tip),
    tipConfidence: (row.tip_confidence as number) ?? null,
    communityAction: (row.community_action as string) ?? null,
    patternType: (row.pattern_type as ClassifiedItem['patternType']) ?? null,
    patternRecipe: (row.pattern_recipe as string) ?? null,
    fetchedAt: row.fetched_at as string,
    createdAt: row.created_at as string,
  }
}

function rowToChangelogHighlight(row: Record<string, unknown>): ChangelogHighlight {
  return {
    id: row.id as number,
    date: row.date as string,
    releaseTag: row.release_tag as string,
    prevReleaseTag: (row.prev_release_tag as string) ?? null,
    releaseUrl: row.release_url as string,
    hookRelevance: safeParseJson<string[]>(row.hook_relevance as string | null, []),
    highlights: safeParseJson<string[]>(row.highlights as string | null, []),
    breakingChanges: safeParseJson<string[]>(row.breaking_changes as string | null, []),
    diffStats: safeParseJson<ChangelogHighlight['diffStats']>(
      row.diff_stats as string | null,
      null,
    ),
    rawBody: (row.raw_body as string) ?? '',
    fetchedAt: row.fetched_at as string,
  }
}

function rowToReviewTelemetryEntry(row: Record<string, unknown>): ReviewTelemetryEntry {
  return {
    id: row.id as number,
    date: row.date as string,
    planId: row.plan_id as string,
    reviewId: row.review_id as string,
    modelName: row.model_name as string,
    reviewType: row.review_type as string,
    criticalIssues: (row.critical_issues as number) ?? 0,
    improvements: (row.improvements as number) ?? 0,
    suggestions: (row.suggestions as number) ?? 0,
    strengths: (row.strengths as number) ?? 0,
    verdict: (row.verdict as string) ?? null,
    confidenceScore: (row.confidence_score as number) ?? null,
    durationMs: (row.duration_ms as number) ?? null,
    fetchedAt: row.fetched_at as string,
  }
}

function rowToEcosystemEntry(row: Record<string, unknown>): EcosystemEntry {
  return {
    id: row.id as number,
    name: row.name as string,
    type: row.type as EcosystemEntry['type'],
    author: (row.author as string) ?? null,
    description: (row.description as string) ?? null,
    githubUrl: (row.github_url as string) ?? null,
    stars: (row.stars as number) ?? 0,
    lastUpdated: (row.last_updated as string) ?? null,
    categoryTags: safeParseJson<string[]>(
      row.category_tags as string | null,
      [],
    ),
    mentionCount: (row.mention_count as number) ?? 0,
    agentMeta: safeParseJson<AgentConfigMeta | null>(
      row.agent_meta as string | null,
      null,
    ),
  }
}

function rowToSentimentSnapshot(
  row: Record<string, unknown>,
  topPositive: ClassifiedItem | null = null,
  topNegative: ClassifiedItem | null = null,
): SentimentDailySnapshot {
  return {
    date: row.date as string,
    positivePct: (row.positive_pct as number) ?? 0,
    neutralPct: (row.neutral_pct as number) ?? 0,
    negativePct: (row.negative_pct as number) ?? 0,
    sampleSize: (row.sample_size as number) ?? 0,
    topPositive,
    topNegative,
    summary: (row.summary as string) ?? '',
  }
}

// ---------------------------------------------------------------------------
// Schema initialization
// ---------------------------------------------------------------------------

let schemaInitialized = false

async function initSchema(): Promise<void> {
  if (schemaInitialized) return

  const db = getDb()

  await db.execute('PRAGMA foreign_keys = ON')

  await db.execute(`
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
      community_action TEXT,
      fetched_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `)

  await db.execute(
    'CREATE INDEX IF NOT EXISTS idx_items_date ON items(date)',
  )
  await db.execute(
    'CREATE INDEX IF NOT EXISTS idx_items_source ON items(source)',
  )
  await db.execute(
    'CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at)',
  )

  await db.execute(`
    CREATE TABLE IF NOT EXISTS sentiment_daily (
      date TEXT PRIMARY KEY,
      positive_pct REAL,
      neutral_pct REAL,
      negative_pct REAL,
      sample_size INTEGER,
      top_positive_id INTEGER REFERENCES items(id) ON DELETE SET NULL,
      top_negative_id INTEGER REFERENCES items(id) ON DELETE SET NULL,
      summary TEXT
    )
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS ecosystem (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      author TEXT,
      description TEXT,
      github_url TEXT UNIQUE,
      stars INTEGER DEFAULT 0,
      last_updated TEXT,
      category_tags TEXT DEFAULT '[]',
      mention_count INTEGER DEFAULT 0
    )
  `)

  await db.execute(
    'CREATE INDEX IF NOT EXISTS idx_ecosystem_type ON ecosystem(type)',
  )
  await db.execute(
    'CREATE INDEX IF NOT EXISTS idx_ecosystem_stars ON ecosystem(stars)',
  )

  // New tables
  await db.execute(`
    CREATE TABLE IF NOT EXISTS changelog_highlights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      release_tag TEXT NOT NULL UNIQUE,
      prev_release_tag TEXT,
      release_url TEXT NOT NULL,
      hook_relevance TEXT DEFAULT '[]',
      highlights TEXT DEFAULT '[]',
      breaking_changes TEXT DEFAULT '[]',
      diff_stats TEXT,
      raw_body TEXT DEFAULT '',
      fetched_at TEXT NOT NULL
    )
  `)

  await db.execute(
    'CREATE INDEX IF NOT EXISTS idx_changelog_date ON changelog_highlights(date)',
  )

  await db.execute(`
    CREATE TABLE IF NOT EXISTS review_telemetry (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      review_id TEXT NOT NULL,
      model_name TEXT NOT NULL,
      review_type TEXT NOT NULL,
      critical_issues INTEGER DEFAULT 0,
      improvements INTEGER DEFAULT 0,
      suggestions INTEGER DEFAULT 0,
      strengths INTEGER DEFAULT 0,
      verdict TEXT,
      confidence_score REAL,
      duration_ms INTEGER,
      fetched_at TEXT NOT NULL,
      UNIQUE(plan_id, review_id)
    )
  `)

  await db.execute(
    'CREATE INDEX IF NOT EXISTS idx_telemetry_date ON review_telemetry(date)',
  )
  await db.execute(
    'CREATE INDEX IF NOT EXISTS idx_telemetry_model ON review_telemetry(model_name)',
  )

  // Migrations for existing databases
  try {
    await db.execute('ALTER TABLE items ADD COLUMN community_action TEXT')
  } catch {
    // Column already exists — ignore
  }

  try {
    await db.execute('ALTER TABLE items ADD COLUMN pattern_type TEXT')
  } catch {
    // Column already exists — ignore
  }

  try {
    await db.execute('ALTER TABLE items ADD COLUMN pattern_recipe TEXT')
  } catch {
    // Column already exists — ignore
  }

  try {
    await db.execute('ALTER TABLE ecosystem ADD COLUMN agent_meta TEXT')
  } catch {
    // Column already exists — ignore
  }

  schemaInitialized = true
}

// ---------------------------------------------------------------------------
// Upsert / Transaction helpers
// ---------------------------------------------------------------------------

const ITEM_UPSERT_SQL = `
  INSERT INTO items (
    date, source, category, title, url, author, excerpt, thumbnail_url,
    engagement_score, raw_metrics, sentiment, sentiment_confidence,
    topic_tags, one_line_quote, is_tip, tip_confidence, community_action,
    pattern_type, pattern_recipe,
    fetched_at, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(url) DO UPDATE SET
    engagement_score = excluded.engagement_score,
    raw_metrics = excluded.raw_metrics,
    excerpt = excluded.excerpt,
    community_action = excluded.community_action,
    pattern_type = excluded.pattern_type,
    pattern_recipe = excluded.pattern_recipe
`

function classifiedItemToParams(item: ClassifiedItem): unknown[] {
  return [
    item.date,
    item.source,
    item.category,
    item.title,
    item.url,
    item.author,
    item.excerpt,
    item.thumbnailUrl,
    item.engagementScore,
    JSON.stringify(item.rawMetrics),
    item.sentiment,
    item.sentimentConfidence,
    JSON.stringify(item.topicTags),
    item.oneLineQuote,
    item.isTip ? 1 : 0,
    item.tipConfidence,
    item.communityAction,
    item.patternType,
    item.patternRecipe,
    item.fetchedAt,
    item.createdAt,
  ]
}

export async function runPipelineTransaction(
  items: ClassifiedItem[],
  snapshotInput: {
    date: string
    positivePct: number
    neutralPct: number
    negativePct: number
    sampleSize: number
    topPositiveUrl: string | null
    topNegativeUrl: string | null
    summary: string
  },
): Promise<void> {
  await initSchema()
  const db = getDb()

  const maxAttempts = 3
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const tx = await db.transaction('write')
      try {
        // Step 1: Upsert all items
        for (const item of items) {
          await tx.execute({
            sql: ITEM_UPSERT_SQL,
            args: classifiedItemToParams(item) as never[],
          })
        }

        // Step 2: Resolve top positive/negative IDs by URL
        let topPositiveId: number | null = null
        let topNegativeId: number | null = null

        if (snapshotInput.topPositiveUrl) {
          const result = await tx.execute({
            sql: 'SELECT id FROM items WHERE url = ?',
            args: [snapshotInput.topPositiveUrl],
          })
          if (result.rows.length > 0) {
            topPositiveId = result.rows[0].id as number
          }
        }

        if (snapshotInput.topNegativeUrl) {
          const result = await tx.execute({
            sql: 'SELECT id FROM items WHERE url = ?',
            args: [snapshotInput.topNegativeUrl],
          })
          if (result.rows.length > 0) {
            topNegativeId = result.rows[0].id as number
          }
        }

        // Step 3: Upsert sentiment snapshot
        await tx.execute({
          sql: `
            INSERT INTO sentiment_daily (
              date, positive_pct, neutral_pct, negative_pct,
              sample_size, top_positive_id, top_negative_id, summary
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(date) DO UPDATE SET
              positive_pct = excluded.positive_pct,
              neutral_pct = excluded.neutral_pct,
              negative_pct = excluded.negative_pct,
              sample_size = excluded.sample_size,
              top_positive_id = excluded.top_positive_id,
              top_negative_id = excluded.top_negative_id,
              summary = excluded.summary
          `,
          args: [
            snapshotInput.date,
            snapshotInput.positivePct,
            snapshotInput.neutralPct,
            snapshotInput.negativePct,
            snapshotInput.sampleSize,
            topPositiveId,
            topNegativeId,
            snapshotInput.summary,
          ],
        })

        await tx.commit()
        return // Success
      } catch (err) {
        await tx.rollback()
        throw err
      }
    } catch (err) {
      if (attempt === maxAttempts) throw err
      // Exponential backoff: 1s, 2s, 4s
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt - 1)))
    }
  }
}

// ---------------------------------------------------------------------------
// Query functions
// ---------------------------------------------------------------------------

export async function getRecentReleases(
  limit = 10,
): Promise<ClassifiedItem[]> {
  await initSchema()
  const db = getDb()

  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString().split('T')[0]

  const result = await db.execute({
    sql: `
      SELECT * FROM items
      WHERE source = 'github' AND category = 'feature'
        AND date >= ?
      ORDER BY created_at DESC
      LIMIT ?
    `,
    args: [cutoff, limit],
  })

  return result.rows.map((row) =>
    rowToClassifiedItem(row as unknown as Record<string, unknown>),
  )
}

export async function getDashboardData(): Promise<DashboardData> {
  try {
    await initSchema()
    const [
      items, releases, sentiment, sentimentHistory, ecosystem,
      changelog, patternOfTheDay, reviewTelemetry,
    ] = await Promise.all([
      getLatestItems(),
      getRecentReleases(),
      getSentimentSnapshot(),
      getSentimentHistory(),
      getEcosystemEntries(),
      getChangelogHighlights(),
      getPatternOfTheDay(),
      getReviewTelemetrySummary(),
    ])

    // Merge releases into items (dedup by URL)
    const itemUrls = new Set(items.map((i) => i.url))
    const uniqueReleases = releases.filter((r) => !itemUrls.has(r.url))
    const allItems = [...items, ...uniqueReleases]

    return {
      items: allItems,
      sentiment,
      sentimentHistory,
      ecosystem,
      changelog,
      patternOfTheDay,
      reviewTelemetry,
      lastUpdated: new Date().toISOString(),
    }
  } catch {
    return {
      items: [],
      sentiment: null,
      sentimentHistory: [],
      ecosystem: [],
      changelog: [],
      patternOfTheDay: null,
      reviewTelemetry: null,
      lastUpdated: null,
    }
  }
}

export async function getLatestItems(
  date?: string,
  limit = 50,
): Promise<ClassifiedItem[]> {
  await initSchema()
  const db = getDb()

  const targetDate = date ?? new Date().toISOString().split('T')[0]
  const result = await db.execute({
    sql: `
      SELECT * FROM items
      WHERE date >= date(?, '-2 days') AND date <= ?
      ORDER BY engagement_score DESC
      LIMIT ?
    `,
    args: [targetDate, targetDate, limit],
  })

  return result.rows.map((row) =>
    rowToClassifiedItem(row as unknown as Record<string, unknown>),
  )
}

export async function getSentimentSnapshot(
  date?: string,
): Promise<SentimentDailySnapshot | null> {
  await initSchema()
  const db = getDb()

  const targetDate = date ?? new Date().toISOString().split('T')[0]
  const result = await db.execute({
    sql: `
      SELECT
        s.date, s.positive_pct, s.neutral_pct, s.negative_pct,
        s.sample_size, s.summary,
        s.top_positive_id, s.top_negative_id
      FROM sentiment_daily s
      WHERE s.date = ?
    `,
    args: [targetDate],
  })

  if (result.rows.length === 0) return null

  const row = result.rows[0] as unknown as Record<string, unknown>

  // Hydrate top positive/negative items
  let topPositive: ClassifiedItem | null = null
  let topNegative: ClassifiedItem | null = null

  if (row.top_positive_id) {
    const posResult = await db.execute({
      sql: 'SELECT * FROM items WHERE id = ?',
      args: [row.top_positive_id as number],
    })
    if (posResult.rows.length > 0) {
      topPositive = rowToClassifiedItem(
        posResult.rows[0] as unknown as Record<string, unknown>,
      )
    }
  }

  if (row.top_negative_id) {
    const negResult = await db.execute({
      sql: 'SELECT * FROM items WHERE id = ?',
      args: [row.top_negative_id as number],
    })
    if (negResult.rows.length > 0) {
      topNegative = rowToClassifiedItem(
        negResult.rows[0] as unknown as Record<string, unknown>,
      )
    }
  }

  return rowToSentimentSnapshot(row, topPositive, topNegative)
}

export async function getSentimentHistory(
  days = 30,
): Promise<SentimentDailySnapshot[]> {
  await initSchema()
  const db = getDb()

  const result = await db.execute({
    sql: `
      SELECT
        s.date,
        s.positive_pct,
        s.neutral_pct,
        s.negative_pct,
        s.sample_size,
        s.summary,
        tp.id AS tp_id, tp.date AS tp_date, tp.source AS tp_source,
        tp.category AS tp_category, tp.title AS tp_title, tp.url AS tp_url,
        tp.author AS tp_author, tp.excerpt AS tp_excerpt,
        tp.thumbnail_url AS tp_thumbnail_url,
        tp.engagement_score AS tp_engagement_score,
        tp.raw_metrics AS tp_raw_metrics,
        tp.sentiment AS tp_sentiment,
        tp.sentiment_confidence AS tp_sentiment_confidence,
        tp.topic_tags AS tp_topic_tags,
        tp.one_line_quote AS tp_one_line_quote,
        tp.is_tip AS tp_is_tip, tp.tip_confidence AS tp_tip_confidence,
        tp.community_action AS tp_community_action,
        tp.fetched_at AS tp_fetched_at, tp.created_at AS tp_created_at,
        tn.id AS tn_id, tn.date AS tn_date, tn.source AS tn_source,
        tn.category AS tn_category, tn.title AS tn_title, tn.url AS tn_url,
        tn.author AS tn_author, tn.excerpt AS tn_excerpt,
        tn.thumbnail_url AS tn_thumbnail_url,
        tn.engagement_score AS tn_engagement_score,
        tn.raw_metrics AS tn_raw_metrics,
        tn.sentiment AS tn_sentiment,
        tn.sentiment_confidence AS tn_sentiment_confidence,
        tn.topic_tags AS tn_topic_tags,
        tn.one_line_quote AS tn_one_line_quote,
        tn.is_tip AS tn_is_tip, tn.tip_confidence AS tn_tip_confidence,
        tn.community_action AS tn_community_action,
        tn.fetched_at AS tn_fetched_at, tn.created_at AS tn_created_at
      FROM sentiment_daily s
      LEFT JOIN items tp ON s.top_positive_id = tp.id
      LEFT JOIN items tn ON s.top_negative_id = tn.id
      WHERE s.date >= date('now', ?)
      ORDER BY s.date DESC
    `,
    args: [`-${days} days`],
  })

  return result.rows.map((row) => {
    const r = row as unknown as Record<string, unknown>

    const topPositive: ClassifiedItem | null = r.tp_id
      ? rowToClassifiedItem({
          id: r.tp_id,
          date: r.tp_date,
          source: r.tp_source,
          category: r.tp_category,
          title: r.tp_title,
          url: r.tp_url,
          author: r.tp_author,
          excerpt: r.tp_excerpt,
          thumbnail_url: r.tp_thumbnail_url,
          engagement_score: r.tp_engagement_score,
          raw_metrics: r.tp_raw_metrics,
          sentiment: r.tp_sentiment,
          sentiment_confidence: r.tp_sentiment_confidence,
          topic_tags: r.tp_topic_tags,
          one_line_quote: r.tp_one_line_quote,
          is_tip: r.tp_is_tip,
          tip_confidence: r.tp_tip_confidence,
          community_action: r.tp_community_action,
          fetched_at: r.tp_fetched_at,
          created_at: r.tp_created_at,
        })
      : null

    const topNegative: ClassifiedItem | null = r.tn_id
      ? rowToClassifiedItem({
          id: r.tn_id,
          date: r.tn_date,
          source: r.tn_source,
          category: r.tn_category,
          title: r.tn_title,
          url: r.tn_url,
          author: r.tn_author,
          excerpt: r.tn_excerpt,
          thumbnail_url: r.tn_thumbnail_url,
          engagement_score: r.tn_engagement_score,
          raw_metrics: r.tn_raw_metrics,
          sentiment: r.tn_sentiment,
          sentiment_confidence: r.tn_sentiment_confidence,
          topic_tags: r.tn_topic_tags,
          one_line_quote: r.tn_one_line_quote,
          is_tip: r.tn_is_tip,
          tip_confidence: r.tn_tip_confidence,
          community_action: r.tn_community_action,
          fetched_at: r.tn_fetched_at,
          created_at: r.tn_created_at,
        })
      : null

    return rowToSentimentSnapshot(r, topPositive, topNegative)
  })
}

export async function getEcosystemEntries(
  type?: string,
): Promise<EcosystemEntry[]> {
  await initSchema()
  const db = getDb()

  if (type) {
    const result = await db.execute({
      sql: 'SELECT * FROM ecosystem WHERE type = ? ORDER BY stars DESC',
      args: [type],
    })
    return result.rows.map((row) =>
      rowToEcosystemEntry(row as unknown as Record<string, unknown>),
    )
  }

  const result = await db.execute(
    'SELECT * FROM ecosystem ORDER BY stars DESC',
  )
  return result.rows.map((row) =>
    rowToEcosystemEntry(row as unknown as Record<string, unknown>),
  )
}

export async function insertItems(items: ClassifiedItem[]): Promise<void> {
  await initSchema()
  const db = getDb()

  for (const item of items) {
    await db.execute({
      sql: ITEM_UPSERT_SQL,
      args: classifiedItemToParams(item) as never[],
    })
  }
}

export async function upsertSentimentSnapshot(snapshot: {
  date: string
  positivePct: number
  neutralPct: number
  negativePct: number
  sampleSize: number
  topPositiveId: number | null
  topNegativeId: number | null
  summary: string
}): Promise<void> {
  await initSchema()
  const db = getDb()

  await db.execute({
    sql: `
      INSERT INTO sentiment_daily (
        date, positive_pct, neutral_pct, negative_pct,
        sample_size, top_positive_id, top_negative_id, summary
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        positive_pct = excluded.positive_pct,
        neutral_pct = excluded.neutral_pct,
        negative_pct = excluded.negative_pct,
        sample_size = excluded.sample_size,
        top_positive_id = excluded.top_positive_id,
        top_negative_id = excluded.top_negative_id,
        summary = excluded.summary
    `,
    args: [
      snapshot.date,
      snapshot.positivePct,
      snapshot.neutralPct,
      snapshot.negativePct,
      snapshot.sampleSize,
      snapshot.topPositiveId,
      snapshot.topNegativeId,
      snapshot.summary,
    ],
  })
}

export async function upsertEcosystemEntries(
  entries: EcosystemEntry[],
): Promise<void> {
  await initSchema()
  const db = getDb()

  for (const entry of entries) {
    if (entry.githubUrl) {
      // Upsert by github_url for entries with a URL
      await db.execute({
        sql: `
          INSERT INTO ecosystem (
            name, type, author, description, github_url,
            stars, last_updated, category_tags, mention_count, agent_meta
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(github_url) DO UPDATE SET
            name = excluded.name,
            stars = excluded.stars,
            last_updated = excluded.last_updated,
            description = excluded.description,
            mention_count = excluded.mention_count,
            category_tags = excluded.category_tags,
            agent_meta = excluded.agent_meta
        `,
        args: [
          entry.name,
          entry.type,
          entry.author,
          entry.description,
          entry.githubUrl,
          entry.stars,
          entry.lastUpdated,
          JSON.stringify(entry.categoryTags),
          entry.mentionCount,
          entry.agentMeta ? JSON.stringify(entry.agentMeta) : null,
        ],
      })
    } else {
      // For entries without github_url, check by name to avoid duplicates
      const existing = await db.execute({
        sql: 'SELECT id FROM ecosystem WHERE name = ? AND github_url IS NULL',
        args: [entry.name],
      })
      if (existing.rows.length === 0) {
        await db.execute({
          sql: `
            INSERT INTO ecosystem (
              name, type, author, description, github_url,
              stars, last_updated, category_tags, mention_count, agent_meta
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            entry.name,
            entry.type,
            entry.author,
            entry.description,
            null,
            entry.stars,
            entry.lastUpdated,
            JSON.stringify(entry.categoryTags),
            entry.mentionCount,
            entry.agentMeta ? JSON.stringify(entry.agentMeta) : null,
          ],
        })
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Changelog highlights
// ---------------------------------------------------------------------------

export async function upsertChangelogHighlights(
  highlights: ChangelogHighlight[],
): Promise<void> {
  await initSchema()
  const db = getDb()

  for (const h of highlights) {
    await db.execute({
      sql: `
        INSERT INTO changelog_highlights (
          date, release_tag, prev_release_tag, release_url,
          hook_relevance, highlights, breaking_changes,
          diff_stats, raw_body, fetched_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(release_tag) DO UPDATE SET
          hook_relevance = excluded.hook_relevance,
          highlights = excluded.highlights,
          breaking_changes = excluded.breaking_changes,
          diff_stats = excluded.diff_stats,
          raw_body = excluded.raw_body,
          fetched_at = excluded.fetched_at
      `,
      args: [
        h.date,
        h.releaseTag,
        h.prevReleaseTag,
        h.releaseUrl,
        JSON.stringify(h.hookRelevance),
        JSON.stringify(h.highlights),
        JSON.stringify(h.breakingChanges),
        h.diffStats ? JSON.stringify(h.diffStats) : null,
        h.rawBody,
        h.fetchedAt,
      ],
    })
  }
}

export async function getChangelogHighlights(
  limit = 5,
): Promise<ChangelogHighlight[]> {
  await initSchema()
  const db = getDb()

  const result = await db.execute({
    sql: 'SELECT * FROM changelog_highlights ORDER BY date DESC LIMIT ?',
    args: [limit],
  })

  return result.rows.map((row) =>
    rowToChangelogHighlight(row as unknown as Record<string, unknown>),
  )
}

// ---------------------------------------------------------------------------
// Pattern of the Day
// ---------------------------------------------------------------------------

export async function getPatternOfTheDay(
  date?: string,
): Promise<ClassifiedItem | null> {
  await initSchema()
  const db = getDb()

  const targetDate = date ?? new Date().toISOString().split('T')[0]
  const result = await db.execute({
    sql: `
      SELECT * FROM items
      WHERE pattern_type IS NOT NULL
        AND date >= date(?, '-2 days') AND date <= ?
      ORDER BY engagement_score DESC
      LIMIT 1
    `,
    args: [targetDate, targetDate],
  })

  if (result.rows.length === 0) return null
  return rowToClassifiedItem(result.rows[0] as unknown as Record<string, unknown>)
}

// ---------------------------------------------------------------------------
// Review telemetry
// ---------------------------------------------------------------------------

export async function upsertReviewTelemetry(
  entries: ReviewTelemetryEntry[],
): Promise<void> {
  await initSchema()
  const db = getDb()

  for (const entry of entries) {
    await db.execute({
      sql: `
        INSERT INTO review_telemetry (
          date, plan_id, review_id, model_name, review_type,
          critical_issues, improvements, suggestions, strengths,
          verdict, confidence_score, duration_ms, fetched_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(plan_id, review_id) DO UPDATE SET
          critical_issues = excluded.critical_issues,
          improvements = excluded.improvements,
          suggestions = excluded.suggestions,
          strengths = excluded.strengths,
          verdict = excluded.verdict,
          confidence_score = excluded.confidence_score,
          duration_ms = excluded.duration_ms,
          fetched_at = excluded.fetched_at
      `,
      args: [
        entry.date,
        entry.planId,
        entry.reviewId,
        entry.modelName,
        entry.reviewType,
        entry.criticalIssues,
        entry.improvements,
        entry.suggestions,
        entry.strengths,
        entry.verdict,
        entry.confidenceScore,
        entry.durationMs,
        entry.fetchedAt,
      ],
    })
  }
}

export async function getReviewTelemetrySummary(
  days = 30,
): Promise<ReviewTelemetrySummary | null> {
  await initSchema()
  const db = getDb()

  const cutoff = `-${days} days`

  const [countResult, byModelResult, recentResult] = await Promise.all([
    db.execute({
      sql: "SELECT COUNT(*) as total FROM review_telemetry WHERE date >= date('now', ?)",
      args: [cutoff],
    }),
    db.execute({
      sql: `
        SELECT
          model_name,
          COUNT(*) as review_count,
          AVG(critical_issues) as avg_critical_issues,
          AVG(improvements) as avg_improvements
        FROM review_telemetry
        WHERE date >= date('now', ?)
        GROUP BY model_name
        ORDER BY review_count DESC
      `,
      args: [cutoff],
    }),
    db.execute({
      sql: `
        SELECT * FROM review_telemetry
        WHERE date >= date('now', ?)
        ORDER BY date DESC, fetched_at DESC
        LIMIT 10
      `,
      args: [cutoff],
    }),
  ])

  const total = (countResult.rows[0] as unknown as Record<string, unknown>).total as number
  if (total === 0) return null

  return {
    totalReviews: total,
    byModel: byModelResult.rows.map((row) => {
      const r = row as unknown as Record<string, unknown>
      return {
        modelName: r.model_name as string,
        reviewCount: r.review_count as number,
        avgCriticalIssues: Math.round(((r.avg_critical_issues as number) ?? 0) * 10) / 10,
        avgImprovements: Math.round(((r.avg_improvements as number) ?? 0) * 10) / 10,
      }
    }),
    recentReviews: recentResult.rows.map((row) =>
      rowToReviewTelemetryEntry(row as unknown as Record<string, unknown>),
    ),
  }
}

// ---------------------------------------------------------------------------
// Prune
// ---------------------------------------------------------------------------

export async function pruneOldData(
  itemDays = 90,
  snapshotDays = 365,
): Promise<{ deletedItems: number; deletedSnapshots: number }> {
  await initSchema()
  const db = getDb()

  const itemResult = await db.execute({
    sql: "DELETE FROM items WHERE date < date('now', ?)",
    args: [`-${itemDays} days`],
  })

  const snapshotResult = await db.execute({
    sql: "DELETE FROM sentiment_daily WHERE date < date('now', ?)",
    args: [`-${snapshotDays} days`],
  })

  return {
    deletedItems: itemResult.rowsAffected,
    deletedSnapshots: snapshotResult.rowsAffected,
  }
}

export interface FetchedItem {
  id?: number;
  date: string;                    // 'YYYY-MM-DD'
  source: 'reddit' | 'youtube' | 'github' | 'x' | 'anthropic' | 'substack' | 'hackernews';
  category: 'news' | 'feature' | 'tip' | 'plugin' | 'video';
  title: string;
  url: string;
  author: string | null;
  excerpt: string | null;
  thumbnailUrl: string | null;
  engagementScore: number;         // Normalized 0-1
  rawMetrics: Record<string, number>;
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
  communityAction: string | null;
  patternType: 'workflow' | 'context_strategy' | 'model_mix' | 'hook_pattern' | null;
  patternRecipe: string | null;
}

export interface SentimentDailySnapshot {
  date: string;
  positivePct: number;
  neutralPct: number;
  negativePct: number;
  sampleSize: number;
  topPositive: ClassifiedItem | null;
  topNegative: ClassifiedItem | null;
  summary: string;
}

export interface AgentConfigMeta {
  configType: 'agent' | 'command' | 'hook';
  modelTier: string | null;
  toolRestrictions: string[] | null;
}

export interface EcosystemEntry {
  id?: number;
  name: string;
  type: 'hook' | 'plugin' | 'skill' | 'mcp_server' | 'agent_config';
  author: string | null;
  description: string | null;
  githubUrl: string | null;
  stars: number;
  lastUpdated: string | null;
  categoryTags: string[];
  mentionCount: number;
  agentMeta: AgentConfigMeta | null;
}

export interface ChangelogHighlight {
  id?: number;
  date: string;
  releaseTag: string;
  prevReleaseTag: string | null;
  releaseUrl: string;
  hookRelevance: string[];
  highlights: string[];
  breakingChanges: string[];
  diffStats: { filesChanged: number; additions: number; deletions: number } | null;
  rawBody: string;
  fetchedAt: string;
}

export interface ReviewTelemetryEntry {
  id?: number;
  date: string;
  planId: string;
  reviewId: string; // 0A,0B,1A,1C,1B,2,3
  modelName: string;
  reviewType: string;
  criticalIssues: number;
  improvements: number;
  suggestions: number;
  strengths: number;
  verdict: string | null;
  confidenceScore: number | null;
  durationMs: number | null;
  fetchedAt: string;
}

export interface ReviewTelemetrySummary {
  totalReviews: number;
  byModel: Array<{
    modelName: string;
    reviewCount: number;
    avgCriticalIssues: number;
    avgImprovements: number;
  }>;
  recentReviews: ReviewTelemetryEntry[];
}

export interface DashboardData {
  items: ClassifiedItem[];
  sentiment: SentimentDailySnapshot | null;
  sentimentHistory: SentimentDailySnapshot[];
  ecosystem: EcosystemEntry[];
  changelog: ChangelogHighlight[];
  patternOfTheDay: ClassifiedItem | null;
  reviewTelemetry: ReviewTelemetrySummary | null;
  lastUpdated: string | null;
}

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

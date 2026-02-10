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
  sentimentHistory: SentimentDailySnapshot[];
  ecosystem: EcosystemEntry[];
  lastUpdated: string | null;
}

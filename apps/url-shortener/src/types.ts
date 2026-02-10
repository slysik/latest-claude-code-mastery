export interface UrlMapping {
  id: string;
  originalUrl: string;
  shortCode: string;
  createdAt: string;
  accessCount: number;
}

export interface UrlStore {
  mappings: Record<string, UrlMapping>;
  metadata: {
    totalShortenedCount: number;
    totalAccessCount: number;
  };
}

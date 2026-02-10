import {
  SearchClient,
  SearchIndexClient,
  AzureKeyCredential,
  KnownAnalyzerNames,
  SearchIndex,
} from "@azure/search-documents";
import { config, isServiceConfigured } from "../config.js";
import { embeddingsService, ChunkWithVector } from "./embeddings.js";

export interface SearchResult {
  id: string;
  content: string;
  title: string;
  section: string;
  score: number;
  metadata: Record<string, string>;
}

interface SearchDocument {
  id: string;
  content: string;
  contentVector: number[];
  title: string;
  section: string;
  chunkIndex: number;
  totalChunks: number;
}

class SearchService {
  private indexClient: SearchIndexClient | null = null;
  private searchClient: SearchClient<SearchDocument> | null = null;

  private getIndexClient(): SearchIndexClient {
    if (this.indexClient) return this.indexClient;

    if (!isServiceConfigured("azureSearch")) {
      throw new Error("Azure AI Search not configured. Set AZURE_SEARCH_ENDPOINT and AZURE_SEARCH_API_KEY.");
    }

    this.indexClient = new SearchIndexClient(
      config.azureSearch.endpoint,
      new AzureKeyCredential(config.azureSearch.apiKey)
    );

    return this.indexClient;
  }

  private getSearchClient(): SearchClient<SearchDocument> {
    if (this.searchClient) return this.searchClient;

    if (!isServiceConfigured("azureSearch")) {
      throw new Error("Azure AI Search not configured.");
    }

    this.searchClient = new SearchClient<SearchDocument>(
      config.azureSearch.endpoint,
      config.azureSearch.indexName,
      new AzureKeyCredential(config.azureSearch.apiKey)
    );

    return this.searchClient;
  }

  async createIndex(indexName: string): Promise<void> {
    const client = this.getIndexClient();

    const index: SearchIndex = {
      name: indexName,
      fields: [
        { name: "id", type: "Edm.String", key: true, filterable: true },
        { name: "content", type: "Edm.String", searchable: true, analyzerName: KnownAnalyzerNames.EnLucene },
        {
          name: "contentVector",
          type: "Collection(Edm.Single)",
          searchable: true,
          vectorSearchDimensions: 1536,
          vectorSearchProfileName: "vector-profile",
        },
        { name: "title", type: "Edm.String", searchable: true, filterable: true },
        { name: "section", type: "Edm.String", searchable: true, filterable: true, facetable: true },
        { name: "chunkIndex", type: "Edm.Int32", filterable: true, sortable: true },
        { name: "totalChunks", type: "Edm.Int32", filterable: true },
      ],
      vectorSearch: {
        algorithms: [
          {
            name: "hnsw-algorithm",
            kind: "hnsw",
            parameters: {
              metric: "cosine",
              m: 4,
              efConstruction: 400,
              efSearch: 500,
            },
          },
        ],
        profiles: [
          {
            name: "vector-profile",
            algorithmConfigurationName: "hnsw-algorithm",
          },
        ],
      },
    };

    try {
      await client.deleteIndex(indexName);
      console.log(`Deleted existing index: ${indexName}`);
    } catch {
      // Index doesn't exist, that's fine
    }

    await client.createIndex(index);
    console.log(`Created index: ${indexName}`);
  }

  async indexDocuments(chunks: ChunkWithVector[]): Promise<void> {
    const client = this.getSearchClient();

    const documents: SearchDocument[] = chunks.map((chunk) => ({
      id: chunk.id,
      content: chunk.content,
      contentVector: chunk.contentVector,
      title: chunk.metadata.title,
      section: chunk.metadata.section,
      chunkIndex: chunk.metadata.chunkIndex,
      totalChunks: chunk.metadata.totalChunks,
    }));

    // Upload in batches of 100
    const batchSize = 100;
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      const result = await client.uploadDocuments(batch);
      const succeeded = result.results.filter((r) => r.succeeded).length;
      console.log(`Indexed batch ${Math.floor(i / batchSize) + 1}: ${succeeded}/${batch.length} documents`);
    }
  }

  async searchDocuments(query: string, topK: number = 3): Promise<SearchResult[]> {
    const client = this.getSearchClient();

    // Generate embedding for the query
    const queryVector = await embeddingsService.generateEmbedding(query);

    const searchResults = await client.search(query, {
      vectorSearchOptions: {
        queries: [
          {
            kind: "vector",
            vector: queryVector,
            kNearestNeighborsCount: topK,
            fields: ["contentVector"],
          },
        ],
      },
      select: ["id", "content", "title", "section", "chunkIndex", "totalChunks"],
      top: topK,
    });

    const results: SearchResult[] = [];
    for await (const result of searchResults.results) {
      const doc = result.document;
      results.push({
        id: doc.id,
        content: doc.content,
        title: doc.title,
        section: doc.section,
        score: result.score ?? 0,
        metadata: {
          chunkIndex: String(doc.chunkIndex),
          totalChunks: String(doc.totalChunks),
        },
      });
    }

    return results;
  }
}

export const searchService = new SearchService();

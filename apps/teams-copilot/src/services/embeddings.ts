import { AzureOpenAI } from "openai";
import { config, isServiceConfigured } from "../config.js";

export interface ChunkMetadata {
  title: string;
  section: string;
  chunkIndex: number;
  totalChunks: number;
}

export interface DocumentChunk {
  content: string;
  metadata: ChunkMetadata;
}

export interface ChunkWithVector extends DocumentChunk {
  id: string;
  contentVector: number[];
}

class EmbeddingsService {
  private client: AzureOpenAI | null = null;

  private getClient(): AzureOpenAI {
    if (this.client) return this.client;

    if (!isServiceConfigured("azureOpenAI")) {
      throw new Error("Azure OpenAI is not configured. Set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY.");
    }

    this.client = new AzureOpenAI({
      endpoint: config.azureOpenAI.endpoint,
      apiKey: config.azureOpenAI.apiKey,
      apiVersion: config.azureOpenAI.apiVersion,
    });

    return this.client;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const client = this.getClient();
    const response = await client.embeddings.create({
      model: config.azureOpenAI.embeddingDeployment,
      input: text,
    });

    return response.data[0].embedding;
  }

  chunkDocument(content: string, chunkSize: number = 500, overlap: number = 50): DocumentChunk[] {
    const title = this.extractTitle(content);
    const sections = this.extractSections(content);
    const chunks: DocumentChunk[] = [];

    for (const section of sections) {
      const sectionChunks = this.splitIntoChunks(section.content, chunkSize, overlap);

      for (let i = 0; i < sectionChunks.length; i++) {
        chunks.push({
          content: sectionChunks[i],
          metadata: {
            title,
            section: section.heading,
            chunkIndex: i,
            totalChunks: sectionChunks.length,
          },
        });
      }
    }

    // If no sections found, chunk the entire document
    if (chunks.length === 0) {
      const allChunks = this.splitIntoChunks(content, chunkSize, overlap);
      for (let i = 0; i < allChunks.length; i++) {
        chunks.push({
          content: allChunks[i],
          metadata: {
            title,
            section: "General",
            chunkIndex: i,
            totalChunks: allChunks.length,
          },
        });
      }
    }

    return chunks;
  }

  private extractTitle(content: string): string {
    const titleMatch = content.match(/^#\s+(.+)$/m);
    return titleMatch ? titleMatch[1].trim() : "Untitled Document";
  }

  private extractSections(content: string): Array<{ heading: string; content: string }> {
    const sectionRegex = /^##\s+(.+)$/gm;
    const sections: Array<{ heading: string; content: string }> = [];
    let match: RegExpExecArray | null;
    const matches: Array<{ heading: string; index: number }> = [];

    while ((match = sectionRegex.exec(content)) !== null) {
      matches.push({ heading: match[1].trim(), index: match.index });
    }

    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index;
      const end = i < matches.length - 1 ? matches[i + 1].index : content.length;
      const sectionContent = content.slice(start, end).trim();

      sections.push({
        heading: matches[i].heading,
        content: sectionContent,
      });
    }

    return sections;
  }

  private splitIntoChunks(text: string, chunkSize: number, overlap: number): string[] {
    // Approximate tokens as words (rough 1:1.3 ratio, using words for simplicity)
    const words = text.split(/\s+/);
    const chunks: string[] = [];

    if (words.length <= chunkSize) {
      return [text.trim()];
    }

    let start = 0;
    while (start < words.length) {
      const end = Math.min(start + chunkSize, words.length);
      const chunk = words.slice(start, end).join(" ").trim();
      if (chunk.length > 0) {
        chunks.push(chunk);
      }
      start = end - overlap;
      if (start >= words.length) break;
      if (end === words.length) break;
    }

    return chunks;
  }
}

export const embeddingsService = new EmbeddingsService();

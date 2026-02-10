import { randomUUID } from "crypto";
import { sharePointService } from "../services/sharepoint.js";
import { embeddingsService } from "../services/embeddings.js";
import { searchService } from "../services/search.js";
import { config } from "../config.js";

async function ingestTravelPolicy(): Promise<void> {
  console.log("Starting travel policy ingestion...\n");

  // Step 1: Read the travel policy from SharePoint (or local fallback)
  console.log("Reading travel policy document...");
  const policyContent = await sharePointService.getDocumentContent(
    config.graph.sharePointSiteId,
    config.graph.sharePointDriveId,
    "data/travel-policy-india.md"
  );
  console.log(`Document loaded: ${policyContent.length} characters\n`);

  // Step 2: Chunk the document
  console.log("Chunking document...");
  const chunks = embeddingsService.chunkDocument(policyContent, 500, 50);
  console.log(`Created ${chunks.length} chunks\n`);

  // Step 3: Generate embeddings for each chunk
  console.log("Generating embeddings...");
  const chunksWithVectors = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`Processing chunk ${i + 1}/${chunks.length}...`);

    const contentVector = await embeddingsService.generateEmbedding(chunk.content);

    chunksWithVectors.push({
      id: randomUUID(),
      content: chunk.content,
      contentVector,
      metadata: chunk.metadata,
    });
  }
  console.log(`Generated ${chunksWithVectors.length} embeddings\n`);

  // Step 4: Create the search index
  console.log("Creating search index...");
  await searchService.createIndex(config.azureSearch.indexName);
  console.log(`Index created: ${config.azureSearch.indexName}\n`);

  // Step 5: Upload all chunks with vectors
  console.log("Indexing documents...");
  await searchService.indexDocuments(chunksWithVectors);
  console.log("Documents indexed successfully\n");

  // Step 6: Print summary
  console.log("=== Ingestion Complete ===");
  console.log(`Total chunks: ${chunks.length}`);
  console.log(`Index name: ${config.azureSearch.indexName}`);
  console.log(`Total vectors indexed: ${chunksWithVectors.length}`);
  console.log("==========================");
}

// Run the ingestion
ingestTravelPolicy()
  .then(() => {
    console.log("\nIngestion completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nIngestion failed:", error);
    process.exit(1);
  });

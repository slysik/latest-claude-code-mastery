import { JsonStore } from "../storage/json-store";

const store = new JsonStore();

export async function statsCommand(): Promise<void> {
  const data = await store.load();
  const mappings = Object.values(data.mappings);

  console.log("=== URL Shortener Stats ===\n");
  console.log(`Total URLs shortened: ${data.metadata.totalShortenedCount}`);
  console.log(`Total accesses:       ${data.metadata.totalAccessCount}`);

  if (mappings.length === 0) {
    console.log("\nNo URLs stored currently.");
    return;
  }

  console.log(`Active URLs:          ${mappings.length}`);

  const sorted = [...mappings].sort((a, b) => b.accessCount - a.accessCount);
  const most = sorted[0];
  const least = sorted[sorted.length - 1];

  console.log(`\nMost accessed:  ${most.shortCode} → ${most.originalUrl} (${most.accessCount} accesses)`);
  console.log(`Least accessed: ${least.shortCode} → ${least.originalUrl} (${least.accessCount} accesses)`);
}

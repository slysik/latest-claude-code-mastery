import { JsonStore } from "../storage/json-store";
import { isValidUrl } from "../utils/validation";
import { generateShortCodeWithCollisionCheck } from "../core/hasher";
import type { UrlMapping } from "../types";

const store = new JsonStore();

export async function shortenCommand(url: string): Promise<void> {
  if (!isValidUrl(url)) {
    console.error(`Error: Invalid URL "${url}". Please provide a valid HTTP or HTTPS URL.`);
    return;
  }

  const existing = await store.getByUrl(url);
  if (existing) {
    console.log(`URL already shortened: ${existing.shortCode}`);
    console.log(`  Original: ${existing.originalUrl}`);
    return;
  }

  const allMappings = await store.getAll();
  const existingCodes = allMappings.map((m) => m.shortCode);
  const shortCode = generateShortCodeWithCollisionCheck(url, existingCodes);

  const mapping: UrlMapping = {
    id: crypto.randomUUID(),
    originalUrl: url,
    shortCode,
    createdAt: new Date().toISOString(),
    accessCount: 0,
  };

  await store.add(mapping);
  console.log(`Shortened successfully!`);
  console.log(`  Short code: ${shortCode}`);
  console.log(`  Original:   ${url}`);
}

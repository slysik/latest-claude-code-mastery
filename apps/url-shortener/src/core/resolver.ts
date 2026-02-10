import { JsonStore } from "../storage/json-store";
import type { UrlMapping } from "../types";

export async function resolveShortCode(
  shortCode: string,
  store: JsonStore
): Promise<UrlMapping | null> {
  const mapping = await store.getByShortCode(shortCode);

  if (!mapping) {
    return null;
  }

  await store.updateAccessCount(shortCode);
  return mapping;
}

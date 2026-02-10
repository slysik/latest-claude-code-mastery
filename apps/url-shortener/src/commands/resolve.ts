import { JsonStore } from "../storage/json-store";
import { isValidShortCode } from "../utils/validation";
import { resolveShortCode } from "../core/resolver";

const store = new JsonStore();

export async function resolveCommand(shortCode: string): Promise<void> {
  if (!isValidShortCode(shortCode)) {
    console.error(`Error: Invalid short code "${shortCode}". Must be 4-10 alphanumeric characters.`);
    return;
  }

  const mapping = await resolveShortCode(shortCode, store);

  if (mapping) {
    console.log(mapping.originalUrl);
  } else {
    console.error(`Error: Short code "${shortCode}" not found.`);
  }
}

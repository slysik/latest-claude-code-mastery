import { JsonStore } from "../storage/json-store";
import { isValidShortCode } from "../utils/validation";

const store = new JsonStore();

export async function deleteCommand(shortCode: string): Promise<void> {
  if (!isValidShortCode(shortCode)) {
    console.error(`Error: Invalid short code "${shortCode}". Must be 4-10 alphanumeric characters.`);
    return;
  }

  const deleted = await store.delete(shortCode);

  if (deleted) {
    console.log(`Deleted short code "${shortCode}" successfully.`);
  } else {
    console.error(`Error: Short code "${shortCode}" not found.`);
  }
}

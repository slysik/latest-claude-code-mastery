import { JsonStore } from "../storage/json-store";

const store = new JsonStore();

export async function listCommand(): Promise<void> {
  const mappings = await store.getAll();

  if (mappings.length === 0) {
    console.log("No URLs shortened yet.");
    return;
  }

  const codeWidth = 12;
  const urlWidth = 50;
  const accessWidth = 10;
  const dateWidth = 20;

  const header = [
    "ShortCode".padEnd(codeWidth),
    "Original URL".padEnd(urlWidth),
    "Accesses".padEnd(accessWidth),
    "Created".padEnd(dateWidth),
  ].join("  ");

  const separator = "-".repeat(header.length);

  console.log(header);
  console.log(separator);

  for (const mapping of mappings) {
    const truncatedUrl =
      mapping.originalUrl.length > urlWidth
        ? mapping.originalUrl.slice(0, urlWidth - 3) + "..."
        : mapping.originalUrl;

    const createdDate = new Date(mapping.createdAt).toLocaleDateString();

    const row = [
      mapping.shortCode.padEnd(codeWidth),
      truncatedUrl.padEnd(urlWidth),
      String(mapping.accessCount).padEnd(accessWidth),
      createdDate.padEnd(dateWidth),
    ].join("  ");

    console.log(row);
  }

  console.log(`\nTotal: ${mappings.length} URL(s)`);
}

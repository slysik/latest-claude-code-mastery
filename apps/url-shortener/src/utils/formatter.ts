import type { UrlMapping } from "../types";

const CODE_WIDTH = 12;
const URL_WIDTH = 50;
const ACCESS_WIDTH = 10;
const DATE_WIDTH = 20;

export function formatTable(mappings: UrlMapping[]): string {
  if (mappings.length === 0) {
    return "No URLs shortened yet.";
  }

  const header = [
    "ShortCode".padEnd(CODE_WIDTH),
    "Original URL".padEnd(URL_WIDTH),
    "Accesses".padEnd(ACCESS_WIDTH),
    "Created".padEnd(DATE_WIDTH),
  ].join("  ");

  const separator = "-".repeat(header.length);

  const rows = mappings.map((mapping) => {
    const truncatedUrl =
      mapping.originalUrl.length > URL_WIDTH
        ? mapping.originalUrl.slice(0, URL_WIDTH - 3) + "..."
        : mapping.originalUrl;

    const createdDate = new Date(mapping.createdAt).toLocaleDateString();

    return [
      mapping.shortCode.padEnd(CODE_WIDTH),
      truncatedUrl.padEnd(URL_WIDTH),
      String(mapping.accessCount).padEnd(ACCESS_WIDTH),
      createdDate.padEnd(DATE_WIDTH),
    ].join("  ");
  });

  return [header, separator, ...rows, `\nTotal: ${mappings.length} URL(s)`].join("\n");
}

export function formatError(message: string): string {
  return `Error: ${message}`;
}

export function formatSuccess(message: string): string {
  return `\u2714 ${message}`;
}

import { join, dirname } from "node:path";
import { mkdirSync, existsSync } from "node:fs";
import type { UrlMapping, UrlStore } from "../types";

const APP_ROOT = join(import.meta.dir, "..", "..");
const DEFAULT_PATH = join(APP_ROOT, "data", "urls.json");

function emptyStore(): UrlStore {
  return {
    mappings: {},
    metadata: {
      totalShortenedCount: 0,
      totalAccessCount: 0,
    },
  };
}

export class JsonStore {
  private filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath ?? DEFAULT_PATH;
  }

  private ensureDirectory(): void {
    const dir = dirname(this.filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  async load(): Promise<UrlStore> {
    const file = Bun.file(this.filePath);
    const exists = await file.exists();
    if (!exists) {
      return emptyStore();
    }
    const text = await file.text();
    return JSON.parse(text) as UrlStore;
  }

  async save(store: UrlStore): Promise<void> {
    this.ensureDirectory();
    await Bun.write(this.filePath, JSON.stringify(store, null, 2));
  }

  async getAll(): Promise<UrlMapping[]> {
    const store = await this.load();
    return Object.values(store.mappings);
  }

  async getByShortCode(shortCode: string): Promise<UrlMapping | null> {
    const store = await this.load();
    return store.mappings[shortCode] ?? null;
  }

  async getByUrl(url: string): Promise<UrlMapping | null> {
    const store = await this.load();
    const mapping = Object.values(store.mappings).find(
      (m) => m.originalUrl === url
    );
    return mapping ?? null;
  }

  async add(mapping: UrlMapping): Promise<void> {
    const store = await this.load();
    store.mappings[mapping.shortCode] = mapping;
    store.metadata.totalShortenedCount++;
    await this.save(store);
  }

  async delete(shortCode: string): Promise<boolean> {
    const store = await this.load();
    if (!(shortCode in store.mappings)) {
      return false;
    }
    delete store.mappings[shortCode];
    await this.save(store);
    return true;
  }

  async updateAccessCount(shortCode: string): Promise<void> {
    const store = await this.load();
    const mapping = store.mappings[shortCode];
    if (mapping) {
      mapping.accessCount++;
      store.metadata.totalAccessCount++;
      await this.save(store);
    }
  }
}

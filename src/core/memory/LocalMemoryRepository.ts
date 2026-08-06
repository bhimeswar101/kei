import { storage } from "@/core/storage";
import { STORAGE_KEYS } from "@/shared/constants/storage";

import type { MemoryRepositoryContract } from "./MemoryRepository";

import type {
  MemoryEntry,
  MemoryQuery,
  MemoryType,
  MemoryValue,
} from "./types";

export class LocalMemoryRepository
  implements MemoryRepositoryContract
{
  async save<T extends MemoryValue>(
    entry: MemoryEntry<T>,
  ): Promise<void> {
    const entries = this.getEntries();

    const existingIndex = entries.findIndex(
      (candidate) => candidate.id === entry.id,
    );

    if (existingIndex >= 0) {
      entries[existingIndex] = entry;
    } else {
      entries.push(entry);
    }

    this.saveEntries(entries);
  }

  async get<T extends MemoryValue>(
    id: string,
  ): Promise<MemoryEntry<T> | undefined> {
    const entry = this.getEntries().find(
      (candidate) => candidate.id === id,
    );

    return entry as MemoryEntry<T> | undefined;
  }

  async query(
    query: MemoryQuery,
  ): Promise<readonly MemoryEntry[]> {
    let entries = this.getEntries();

    if (query.key !== undefined) {
      entries = entries.filter(
        (entry) => entry.key === query.key,
      );
    }

    if (query.type !== undefined) {
      entries = entries.filter(
        (entry) => entry.type === query.type,
      );
    }

    if (query.source !== undefined) {
      entries = entries.filter(
        (entry) => entry.source === query.source,
      );
    }

    if (query.minimumImportance !== undefined) {
      entries = entries.filter(
        (entry) =>
          entry.metadata.importance >=
          query.minimumImportance!,
      );
    }

    if (query.minimumConfidence !== undefined) {
      entries = entries.filter(
        (entry) =>
          entry.metadata.confidence >=
          query.minimumConfidence!,
      );
    }
    if (query.order === "newest-first") {
  entries = [...entries].sort(
    (left, right) =>
      right.createdAt - left.createdAt,
  );
}

if (query.order === "oldest-first") {
  entries = [...entries].sort(
    (left, right) =>
      left.createdAt - right.createdAt,
  );
}

    if (query.limit !== undefined) {
      entries = entries.slice(
        0,
        Math.max(0, query.limit),
      );
    }

    return entries;
  }

  async remove(
    id: string,
  ): Promise<boolean> {
    const entries = this.getEntries();

    const remainingEntries = entries.filter(
      (entry) => entry.id !== id,
    );

    if (
      remainingEntries.length ===
      entries.length
    ) {
      return false;
    }

    this.saveEntries(remainingEntries);

    return true;
  }

  async clear(
    type?: MemoryType,
  ): Promise<void> {
    if (type === undefined) {
      storage.remove(STORAGE_KEYS.MEMORY);

      return;
    }

    const remainingEntries =
      this.getEntries().filter(
        (entry) => entry.type !== type,
      );

    if (remainingEntries.length === 0) {
      storage.remove(STORAGE_KEYS.MEMORY);

      return;
    }

    this.saveEntries(remainingEntries);
  }

  private getEntries(): MemoryEntry[] {
    return (
      storage.get<MemoryEntry[]>(
        STORAGE_KEYS.MEMORY,
      ) ?? []
    );
  }

  private saveEntries(
    entries: readonly MemoryEntry[],
  ): void {
    storage.set(
      STORAGE_KEYS.MEMORY,
      entries,
    );
  }
}

export const memoryRepository =
  new LocalMemoryRepository();

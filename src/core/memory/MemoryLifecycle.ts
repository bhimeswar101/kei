import type {
  MemoryEntry,
} from "./types";

import type {
  MemoryRepositoryContract,
} from "./MemoryRepository";

import {
  memoryRepository,
} from "./LocalMemoryRepository";

export interface MemoryLifecycleContract {
  isExpired(
    entry: MemoryEntry,
    now?: number,
  ): boolean;

  cleanupExpired(
    now?: number,
  ): Promise<number>;
}

export class MemoryLifecycle
  implements MemoryLifecycleContract
{
  private readonly repository:
    MemoryRepositoryContract;

  constructor(
    repository: MemoryRepositoryContract =
      memoryRepository,
  ) {
    this.repository = repository;
  }

  isExpired(
    entry: MemoryEntry,
    now: number = Date.now(),
  ): boolean {
    const expiresAt =
      entry.metadata.expiresAt;

    if (expiresAt === undefined) {
      return false;
    }

    return expiresAt <= now;
  }

  async cleanupExpired(
    now: number = Date.now(),
  ): Promise<number> {
    const entries =
      await this.repository.query({});

    let removedCount = 0;

    for (const entry of entries) {
      if (!this.isExpired(entry, now)) {
        continue;
      }

      const removed =
        await this.repository.remove(entry.id);

      if (removed) {
        removedCount += 1;
      }
    }

    return removedCount;
  }
}

export const memoryLifecycle =
  new MemoryLifecycle();
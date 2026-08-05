import {
  contextEngine,
  ContextNamespaces,
  createContextKey,
} from "@/core/context";

import type {
  ContextEngineContract,
} from "@/core/context";

import {
  memoryEngine,
} from "./KeiMemoryEngine";

import type {
  MemoryEngineContract,
  MemoryEntry,
  MemoryQuery,
} from "./types";

export interface MemoryContextHydrationResult {
  readonly entries: readonly MemoryEntry[];

  readonly hydratedCount: number;
}

export interface MemoryContextBridgeContract {
  hydrate(
    query?: MemoryQuery,
  ): Promise<MemoryContextHydrationResult>;
}

export class MemoryContextBridge
  implements MemoryContextBridgeContract
{
  private readonly memoryEngine: MemoryEngineContract;

  private readonly contextEngine: ContextEngineContract;

  private readonly hydratedKeys = new Set<string>();

  constructor(
    memoryEngine: MemoryEngineContract,
    contextEngine: ContextEngineContract,
  ) {
    this.memoryEngine = memoryEngine;
    this.contextEngine = contextEngine;
  }

  async hydrate(
    query: MemoryQuery = {},
  ): Promise<MemoryContextHydrationResult> {
    const entries =
      await this.memoryEngine.query(query);

    const now = Date.now();

    const activeEntries = entries.filter(
      (entry) =>
        entry.metadata.expiresAt === undefined ||
        entry.metadata.expiresAt > now,
    );

    this.clearHydratedContext();

    for (const entry of activeEntries) {
      const contextKey = createContextKey(
        ContextNamespaces.MEMORY,
        entry.key,
      );

      this.contextEngine.set(
        contextKey,
        entry.value,
        "memory",
      );

      this.hydratedKeys.add(contextKey);
    }

    return {
      entries: activeEntries,
      hydratedCount: activeEntries.length,
    };
  }

  private clearHydratedContext(): void {
    for (const key of this.hydratedKeys) {
      this.contextEngine.remove(key);
    }

    this.hydratedKeys.clear();
  }
}

export const memoryContextBridge =
  new MemoryContextBridge(
    memoryEngine,
    contextEngine,
  );
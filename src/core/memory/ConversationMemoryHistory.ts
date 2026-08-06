import {
  memoryEngine as defaultMemoryEngine,
} from "./KeiMemoryEngine";

import type {
  MemoryEngineContract,
  MemoryEntry,
} from "./types";

export interface ConversationMemoryRecord {
  readonly userMessage?: string;

  readonly assistantMessage?: string;
}

export interface ConversationMemoryHistoryContract {
  getRecent(
    limit?: number,
  ): Promise<
    readonly MemoryEntry<ConversationMemoryRecord>[]
  >;
}

const DEFAULT_HISTORY_LIMIT = 10;

const MAXIMUM_HISTORY_LIMIT = 50;

export class ConversationMemoryHistory
  implements ConversationMemoryHistoryContract
{
  private readonly memoryEngine:
    MemoryEngineContract;

  constructor(
    memoryEngine: MemoryEngineContract =
      defaultMemoryEngine,
  ) {
    this.memoryEngine = memoryEngine;
  }

  async getRecent(
    limit = DEFAULT_HISTORY_LIMIT,
  ): Promise<
    readonly MemoryEntry<ConversationMemoryRecord>[]
  > {
    const normalizedLimit =
      limit < 1
        ? DEFAULT_HISTORY_LIMIT
        : Math.min(
            limit,
            MAXIMUM_HISTORY_LIMIT,
          );

    const entries =
  await this.memoryEngine.query({
    key: "conversation.latest",
    type: "short-term",
    source: "assistant",
    order: "newest-first",
    limit: normalizedLimit,
  });

    return entries as readonly MemoryEntry<ConversationMemoryRecord>[];
  }
}

export const conversationMemoryHistory =
  new ConversationMemoryHistory();
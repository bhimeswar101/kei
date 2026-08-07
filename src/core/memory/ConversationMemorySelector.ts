import {
  conversationMemoryHistory as defaultConversationMemoryHistory,
} from "./ConversationMemoryHistory";

import type {
  ConversationMemoryHistoryContract,
  ConversationMemoryRecord,
} from "./ConversationMemoryHistory";

export interface ConversationMemorySelectorContract {
  selectRecent(
    limit?: number,
  ): Promise<
    readonly ConversationMemoryRecord[]
  >;
}

export class ConversationMemorySelector
  implements ConversationMemorySelectorContract
{
  private readonly history:
    ConversationMemoryHistoryContract;

  constructor(
    history: ConversationMemoryHistoryContract =
      defaultConversationMemoryHistory,
  ) {
    this.history = history;
  }

  async selectRecent(
    limit = 5,
  ): Promise<
    readonly ConversationMemoryRecord[]
  > {
    const entries =
      await this.history.getRecent(limit);

    return entries.map(
      (entry) => entry.value,
    );
  }
}

export const conversationMemorySelector =
  new ConversationMemorySelector();
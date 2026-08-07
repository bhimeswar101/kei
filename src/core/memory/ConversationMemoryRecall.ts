import {
  conversationMemoryFormatter,
} from "./ConversationMemoryFormatter";

import {
  conversationMemoryHistory,
} from "./ConversationMemoryHistory";

import {
  conversationMemorySelector,
} from "./ConversationMemorySelector";

import type {
  ConversationMemoryFormatterContract,
} from "./ConversationMemoryFormatter";

import type {
  ConversationMemoryHistoryContract,
} from "./ConversationMemoryHistory";

import type {
  ConversationMemorySelectorContract,
} from "./ConversationMemorySelector";

export interface ConversationMemoryRecallContract {
  recall(
    limit?: number,
  ): Promise<string>;
}

export class ConversationMemoryRecall
  implements ConversationMemoryRecallContract
{
  private readonly history:
    ConversationMemoryHistoryContract;

  private readonly selector:
    ConversationMemorySelectorContract;

  private readonly formatter:
    ConversationMemoryFormatterContract;

  constructor(
    history: ConversationMemoryHistoryContract =
      conversationMemoryHistory,
    selector: ConversationMemorySelectorContract =
      conversationMemorySelector,
    formatter: ConversationMemoryFormatterContract =
      conversationMemoryFormatter,
  ) {
    this.history = history;
    this.selector = selector;
    this.formatter = formatter;
  }

  async recall(
    limit = 5,
  ): Promise<string> {
    void this.history;

    const records =
      await this.selector.selectRecent(
        limit,
      );

    return this.formatter.format(
      records,
    );
  }
}

export const conversationMemoryRecall =
  new ConversationMemoryRecall();
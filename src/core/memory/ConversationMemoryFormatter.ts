import type {
  ConversationMemoryRecord,
} from "./ConversationMemoryHistory";

export interface ConversationMemoryFormatterContract {
  format(
    records: readonly ConversationMemoryRecord[],
  ): string;
}

export class ConversationMemoryFormatter
  implements ConversationMemoryFormatterContract
{
  format(
    records: readonly ConversationMemoryRecord[],
  ): string {
    if (records.length === 0) {
      return "";
    }

    return [
      "Recent Conversation",
      "",
      ...records.flatMap((record) => [
        ...(record.userMessage
          ? [
              "User:",
              record.userMessage,
              "",
            ]
          : []),

        ...(record.assistantMessage
          ? [
              "Kei:",
              record.assistantMessage,
              "",
            ]
          : []),
      ]),
    ]
      .join("\n")
      .trimEnd();
  }
}

export const conversationMemoryFormatter =
  new ConversationMemoryFormatter();
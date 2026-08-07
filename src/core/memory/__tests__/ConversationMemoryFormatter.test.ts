import {
  describe,
  expect,
  it,
} from "vitest";

import {
  ConversationMemoryFormatter,
} from "../ConversationMemoryFormatter";

describe(
  "ConversationMemoryFormatter",
  () => {
    it(
      "formats conversation history",
      () => {
        const formatter =
          new ConversationMemoryFormatter();

        const text =
          formatter.format([
            {
              userMessage:
                "Hello",

              assistantMessage:
                "Hi",
            },

            {
              userMessage:
                "How are you?",

              assistantMessage:
                "Great!",
            },
          ]);

        expect(text).toContain(
          "Recent Conversation",
        );

        expect(text).toContain(
          "User:",
        );

        expect(text).toContain(
          "Kei:",
        );

        expect(text).toContain(
          "Hello",
        );

        expect(text).toContain(
          "Great!",
        );
      },
    );
  },
);
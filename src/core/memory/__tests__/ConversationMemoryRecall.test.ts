import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  ConversationMemoryRecall,
} from "../ConversationMemoryRecall";

describe(
  "ConversationMemoryRecall",
  () => {
    it(
      "returns formatted conversation",
      async () => {
        const selector = {
          selectRecent:
            vi.fn().mockResolvedValue([
              {
                userMessage:
                  "Hello",

                assistantMessage:
                  "Hi",
              },
            ]),
        };

        const formatter = {
          format:
            vi
              .fn()
              .mockReturnValue(
                "formatted",
              ),
        };

        const recall =
          new ConversationMemoryRecall(
            {} as never,
            selector,
            formatter,
          );

        const result =
          await recall.recall();

        expect(result).toBe(
          "formatted",
        );
      },
    );
  },
);
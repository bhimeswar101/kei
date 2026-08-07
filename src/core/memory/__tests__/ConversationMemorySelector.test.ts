import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  ConversationMemorySelector,
} from "../ConversationMemorySelector";

import type {
  ConversationMemoryHistoryContract,
} from "../ConversationMemoryHistory";

describe(
  "ConversationMemorySelector",
  () => {
    it(
      "selects recent conversation records",
      async () => {
        const history: ConversationMemoryHistoryContract = {
          getRecent: vi.fn().mockResolvedValue([
            {
              id: "memory-1",
              type: "short-term",
              key: "conversation.latest",
              value: {
                userMessage: "Hello Kei",
                assistantMessage: "Hello!",
              },
              source: "assistant",
              metadata: {
                importance: 0.5,
                confidence: 1,
                accessCount: 0,
              },
              createdAt: 1000,
              updatedAt: 1000,
            },
            {
              id: "memory-2",
              type: "short-term",
              key: "conversation.latest",
              value: {
                userMessage:
                  "What are we building?",
                assistantMessage:
                  "We're building Kei.",
              },
              source: "assistant",
              metadata: {
                importance: 0.5,
                confidence: 1,
                accessCount: 0,
              },
              createdAt: 2000,
              updatedAt: 2000,
            },
          ]),
        };

        const selector =
          new ConversationMemorySelector(
            history,
          );

        const result =
          await selector.selectRecent(
            2,
          );

        expect(
          history.getRecent,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          history.getRecent,
        ).toHaveBeenCalledWith(
          2,
        );

        expect(result).toEqual([
          {
            userMessage: "Hello Kei",
            assistantMessage: "Hello!",
          },
          {
            userMessage:
              "What are we building?",
            assistantMessage:
              "We're building Kei.",
          },
        ]);
      },
    );

    it(
      "returns an empty collection when there is no conversation history",
      async () => {
        const history: ConversationMemoryHistoryContract = {
          getRecent: vi
            .fn()
            .mockResolvedValue([]),
        };

        const selector =
          new ConversationMemorySelector(
            history,
          );

        const result =
          await selector.selectRecent();

        expect(
          history.getRecent,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          history.getRecent,
        ).toHaveBeenCalledWith(
          5,
        );

        expect(result).toEqual([]);
      },
    );

    it(
      "forwards the requested history limit",
      async () => {
        const history: ConversationMemoryHistoryContract = {
          getRecent: vi
            .fn()
            .mockResolvedValue([]),
        };

        const selector =
          new ConversationMemorySelector(
            history,
          );

        await selector.selectRecent(
          3,
        );

        expect(
          history.getRecent,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          history.getRecent,
        ).toHaveBeenCalledWith(
          3,
        );
      },
    );
  },
);
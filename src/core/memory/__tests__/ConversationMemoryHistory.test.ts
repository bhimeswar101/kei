import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  ConversationMemoryHistory,
} from "../ConversationMemoryHistory";

import type {
  MemoryEngineContract,
  MemoryEntry,
} from "../types";

describe(
  "ConversationMemoryHistory",
  () => {
    it(
      "retrieves recent conversation memories",
      async () => {
        const entries: readonly MemoryEntry[] = [
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
                "We are building Kei.",
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
        ];

        const query = vi
          .fn()
          .mockResolvedValue(entries);

        const memoryEngine: MemoryEngineContract = {
          write: vi.fn(),

          get: vi.fn(),

          query,

          remove: vi.fn(),

          clear: vi.fn(),

          getStatus: vi
            .fn()
            .mockReturnValue("idle"),

          isBusy: vi
            .fn()
            .mockReturnValue(false),
        };

        const history =
          new ConversationMemoryHistory(
            memoryEngine,
          );

        const result =
          await history.getRecent(2);

        expect(
          query,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          query,
        ).toHaveBeenCalledWith({
          key: "conversation.latest",
          type: "short-term",
          source: "assistant",
          order: "newest-first",
          limit: 2,
        });

        expect(result).toEqual(entries);
      },
    );

    it(
      "limits conversation history to the maximum supported size",
      async () => {
        const query = vi
          .fn()
          .mockResolvedValue([]);

        const memoryEngine: MemoryEngineContract = {
          write: vi.fn(),

          get: vi.fn(),

          query,

          remove: vi.fn(),

          clear: vi.fn(),

          getStatus: vi
            .fn()
            .mockReturnValue("idle"),

          isBusy: vi
            .fn()
            .mockReturnValue(false),
        };

        const history =
          new ConversationMemoryHistory(
            memoryEngine,
          );

        await history.getRecent(100);

        expect(
          query,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          query,
        ).toHaveBeenCalledWith({
          key: "conversation.latest",
          type: "short-term",
          source: "assistant",
          order: "newest-first",
          limit: 50,
        });
      },
    );

    it(
      "uses the default history limit when the requested limit is invalid",
      async () => {
        const query = vi
          .fn()
          .mockResolvedValue([]);

        const memoryEngine: MemoryEngineContract = {
          write: vi.fn(),

          get: vi.fn(),

          query,

          remove: vi.fn(),

          clear: vi.fn(),

          getStatus: vi
            .fn()
            .mockReturnValue("idle"),

          isBusy: vi
            .fn()
            .mockReturnValue(false),
        };

        const history =
          new ConversationMemoryHistory(
            memoryEngine,
          );

        await history.getRecent(0);

        expect(
          query,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          query,
        ).toHaveBeenCalledWith({
          key: "conversation.latest",
          type: "short-term",
          source: "assistant",
          order: "newest-first",
          limit: 10,
        });
      },
    );
  },
);
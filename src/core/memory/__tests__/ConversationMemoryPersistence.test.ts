import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  ConversationMemoryPersistence,
} from "../ConversationMemoryPersistence";

import type {
  MemoryEngineContract,
} from "../types";

describe(
  "ConversationMemoryPersistence",
  () => {
    it(
      "writes the conversation into memory",
      async () => {
        const write = vi.fn();

        const memoryEngine: MemoryEngineContract = {
          write,

          get: vi.fn(),

          query: vi.fn(),

          remove: vi.fn(),

          clear: vi.fn(),

          getStatus: vi.fn().mockReturnValue(
            "idle",
          ),

          isBusy: vi.fn().mockReturnValue(
            false,
          ),
        };

        const persistence =
          new ConversationMemoryPersistence(
            memoryEngine,
          );

        await persistence.persist(
          {
            text: "Hello Kei",
            type: "text",
          },
          {} as never,
          {
            requestId: "request-1",
            text: "Hello! How can I help?",
            strategy: "conversation",
            source: "provider",
            success: true,
            grounded: false,
            fallbackUsed: false,
          },
        );

        expect(write).toHaveBeenCalledTimes(
          1,
        );

        expect(write).toHaveBeenCalledWith({
          type: "short-term",

          key: "conversation.latest",

          value: {
            userMessage: "Hello Kei",

            assistantMessage:
              "Hello! How can I help?",
          },

          source: "assistant",
        });
      },
    );

    it(
      "stores only conversation data needed for recall",
      async () => {
        const write = vi.fn();

        const memoryEngine: MemoryEngineContract = {
          write,

          get: vi.fn(),

          query: vi.fn(),

          remove: vi.fn(),

          clear: vi.fn(),

          getStatus: vi.fn().mockReturnValue(
            "idle",
          ),

          isBusy: vi.fn().mockReturnValue(
            false,
          ),
        };

        const persistence =
          new ConversationMemoryPersistence(
            memoryEngine,
          );

        await persistence.persist(
          {
            text: "Hello Kei",
            type: "text",
          },
          {} as never,
          {
            requestId: "request-1",
            text: "Hello! How can I help?",
            strategy: "conversation",
            source: "provider",
            success: true,
            grounded: false,
            fallbackUsed: false,
          },
        );

        expect(write).toHaveBeenCalledWith({
          type: "short-term",

          key: "conversation.latest",

          value: {
            userMessage: "Hello Kei",

            assistantMessage:
              "Hello! How can I help?",
          },

          source: "assistant",
        });
      },
    );
  },
);
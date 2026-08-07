import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  contextEngine,
} from "@/core/context";

import {
  intelligenceEngine,
} from "@/core/intelligence";

import {
  conversationMemoryPersistence,
  conversationMemoryRecall,
  memoryContextBridge,
} from "@/core/memory";

import {
  responseSynthesisGateway,
} from "@/core/response";

import {
  requestStateManager,
} from "../RequestStateManager";

import {
  KeiRequestGateway,
} from "../KeiRequestGateway";

describe(
  "KeiRequestGateway memory integration",
  () => {
    beforeEach(() => {
      requestStateManager.reset();
      contextEngine.clear();
    });

    afterEach(() => {
      vi.restoreAllMocks();

      requestStateManager.reset();
      contextEngine.clear();
    });

    it(
      "hydrates memory before creating the intelligence context snapshot",
      async () => {
        const callOrder: string[] = [];

        vi.spyOn(
          memoryContextBridge,
          "hydrate",
        ).mockImplementation(async () => {
          callOrder.push("hydrate");

          contextEngine.set(
            "memory.user.name",
            "Alex",
            "memory",
          );

          return {
            entries: [],
            hydratedCount: 1,
          };
        });

        vi.spyOn(
          conversationMemoryRecall,
          "recall",
        ).mockResolvedValue(
          "Recent Conversation",
        );

        const createSnapshotSpy = vi
          .spyOn(
            contextEngine,
            "createSnapshot",
          )
          .mockImplementation(
            (requestId) => {
              callOrder.push("snapshot");

              return {
                requestId,
                createdAt: Date.now(),
                entries: new Map([
                  [
                    "memory.user.name",
                    {
                      key: "memory.user.name",
                      value: "Alex",
                      source: "memory",
                      timestamp:
                        Date.now(),
                    },
                  ],
                  [
                    "memory.conversation.recent",
                    {
                      key: "memory.conversation.recent",
                      value:
                        "Recent Conversation",
                      source: "memory",
                      timestamp:
                        Date.now(),
                    },
                  ],
                ]),
              };
            },
          );

        const processSpy = vi
          .spyOn(
            intelligenceEngine,
            "process",
          )
          .mockImplementation(
            async (context) => {
              callOrder.push(
                "intelligence",
              );

              return {
                requestId:
                  context.requestId,

                decision: {
                  type: "respond",
                  intent:
                    "conversation",
                  requiresAction:
                    false,
                  requiresPlanning:
                    false,
                  requiresCapability:
                    false,
                  requiresClarification:
                    false,
                  confidence: 1,
                },

                understanding: {
                  originalText:
                    "Hello Kei",
                  normalizedText:
                    "hello kei",
                  status:
                    "understood",
                  requiresContext:
                    false,
                  entities: [],
                  references: [],
                },
              };
            },
          );

        vi.spyOn(
          responseSynthesisGateway,
          "synthesize",
        ).mockImplementation(
          async (context) => ({
            requestId:
              context.requestId,
            text: "Hello.",
            strategy:
              "conversation",
            source:
              "deterministic",
            success: true,
            grounded: false,
            fallbackUsed: false,
          }),
        );

        vi.spyOn(
          conversationMemoryPersistence,
          "persist",
        ).mockResolvedValue();

        const gateway =
          new KeiRequestGateway();

        const result =
          await gateway.processText(
            "Hello Kei",
          );

        expect(
          memoryContextBridge.hydrate,
        ).toHaveBeenCalledTimes(1);

        expect(
          conversationMemoryRecall.recall,
        ).toHaveBeenCalledTimes(1);

        expect(
          createSnapshotSpy,
        ).toHaveBeenCalledTimes(1);

        expect(
          processSpy,
        ).toHaveBeenCalledTimes(1);

        expect(callOrder).toEqual([
          "hydrate",
          "snapshot",
          "intelligence",
        ]);

        const intelligenceContext =
          processSpy.mock.calls[0]?.[0];

        expect(
          intelligenceContext,
        ).toBeDefined();

        const memoryEntry =
          intelligenceContext?.context.entries.get(
            "memory.user.name",
          );

        expect(
          memoryEntry,
        ).toBeDefined();

        expect(
          memoryEntry?.value,
        ).toBe("Alex");

        expect(
          memoryEntry?.source,
        ).toBe("memory");

        const conversationEntry =
          intelligenceContext?.context.entries.get(
            "memory.conversation.recent",
          );

        expect(
          conversationEntry,
        ).toBeDefined();

        expect(
          conversationEntry?.value,
        ).toBe(
          "Recent Conversation",
        );

        expect(
          result.intelligence
            .requestId,
        ).toBe(result.requestId);

        expect(
          requestStateManager.getState(),
        ).toBe("completed");
      },
    );

    it(
      "persists the completed conversation after response synthesis",
      async () => {
        const callOrder: string[] = [];

        vi.spyOn(
          memoryContextBridge,
          "hydrate",
        ).mockResolvedValue({
          entries: [],
          hydratedCount: 0,
        });

        vi.spyOn(
          conversationMemoryRecall,
          "recall",
        ).mockResolvedValue(
          "Recent Conversation",
        );

        vi.spyOn(
          intelligenceEngine,
          "process",
        ).mockImplementation(
          async (context) => ({
            requestId:
              context.requestId,

            decision: {
              type: "respond",
              intent:
                "conversation",
              requiresAction:
                false,
              requiresPlanning:
                false,
              requiresCapability:
                false,
              requiresClarification:
                false,
              confidence: 1,
            },

            understanding: {
              originalText:
                "Hello Kei",
              normalizedText:
                "hello kei",
              status:
                "understood",
              requiresContext:
                false,
              entities: [],
              references: [],
            },
          }),
        );

        const synthesizeSpy =
          vi.spyOn(
            responseSynthesisGateway,
            "synthesize",
          ).mockImplementation(
            async (context) => {
              callOrder.push(
                "synthesize",
              );

              return {
                requestId:
                  context.requestId,
                text:
                  "Hello! How can I help?",
                strategy:
                  "conversation",
                source:
                  "deterministic",
                success: true,
                grounded: false,
                fallbackUsed:
                  false,
              };
            },
          );

        const persistSpy =
          vi.spyOn(
            conversationMemoryPersistence,
            "persist",
          ).mockImplementation(
            async () => {
              callOrder.push(
                "persist",
              );
            },
          );

        const gateway =
          new KeiRequestGateway();

        const result =
          await gateway.processText(
            "Hello Kei",
          );

        expect(
          synthesizeSpy,
        ).toHaveBeenCalledTimes(1);

        expect(
          conversationMemoryRecall.recall,
        ).toHaveBeenCalledTimes(1);

        expect(
          persistSpy,
        ).toHaveBeenCalledTimes(1);

        expect(
          persistSpy,
        ).toHaveBeenCalledWith(
          {
            type: "text",
            text: "Hello Kei",
            metadata:
              undefined,
          },
          result.intelligence,
          result.response,
        );

        expect(callOrder).toEqual([
          "synthesize",
          "persist",
        ]);

        expect(
          requestStateManager.getState(),
        ).toBe("completed");
      },
    );
  },
);
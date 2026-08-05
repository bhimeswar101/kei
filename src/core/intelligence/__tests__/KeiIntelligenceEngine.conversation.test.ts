import { afterEach, describe, expect, it, vi } from "vitest";

import { capabilityResolver } from "@/core/capabilities";
import { executionEngine } from "@/core/execution";
import { intelligenceEngine } from "@/core/intelligence";
import { planningEngine } from "@/core/planning";
import { requestUnderstandingEngine } from "@/core/understanding";

import type { IntelligenceContext } from "@/core/intelligence";

describe("KeiIntelligenceEngine conversational routing", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("responds directly without capability resolution, planning, or execution", async () => {
    const requestId = "test-conversation-request";

    const context: IntelligenceContext = {
      requestId,

      input: {
        id: `${requestId}:input`,

        type: "text",

        text: "Hello Kei",

        timestamp: new Date(),
      },

      context: {
        requestId,

        createdAt: Date.now(),

        entries: new Map(),
      },
    };

    vi.spyOn(requestUnderstandingEngine, "understand").mockResolvedValue({
      requestId,

      intent: "conversation",

      status: "understood",

      confidence: 0.95,

      originalText: "Hello Kei",

      normalizedText: "hello kei",

      entities: [],

      references: [],

      requiresContext: false,
    });

    const capabilitySpy = vi.spyOn(capabilityResolver, "resolve");

    const planningSpy = vi.spyOn(planningEngine, "createPlan");

    const executionSpy = vi.spyOn(executionEngine, "execute");

    const result = await intelligenceEngine.process(context);

    expect(result.requestId).toBe(requestId);

    expect(result.understanding).toEqual({
      originalText: "Hello Kei",

      normalizedText: "hello kei",

      status: "understood",

      requiresContext: false,

      entities: [],

      references: [],
    });

    expect(result.decision).toMatchObject({
      type: "respond",

      intent: "conversation",

      requiresAction: false,

      requiresPlanning: false,

      requiresCapability: false,

      requiresClarification: false,

      confidence: 0.95,
    });

    expect(result.capability).toBeUndefined();

    expect(result.planning).toBeUndefined();

    expect(result.execution).toBeUndefined();

    expect(capabilitySpy).not.toHaveBeenCalled();

    expect(planningSpy).not.toHaveBeenCalled();

    expect(executionSpy).not.toHaveBeenCalled();

    expect(intelligenceEngine.getStatus()).toBe("completed");

    expect(intelligenceEngine.isProcessing()).toBe(false);
  });
});

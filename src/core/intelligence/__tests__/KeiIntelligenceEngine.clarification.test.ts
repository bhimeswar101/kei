import { afterEach, describe, expect, it, vi } from "vitest";

import { capabilityResolver } from "@/core/capabilities";
import { executionEngine } from "@/core/execution";
import { intelligenceEngine } from "@/core/intelligence";
import { planningEngine } from "@/core/planning";
import { requestUnderstandingEngine } from "@/core/understanding";

import type { IntelligenceContext } from "@/core/intelligence";

describe("KeiIntelligenceEngine clarification routing", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("requests clarification without capability resolution, planning, or execution", async () => {
    const requestId = "test-clarification-request";

    const context: IntelligenceContext = {
      requestId,

      input: {
        id: `${requestId}:input`,

        type: "text",

        text: "Open it",

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

      intent: "action",

      status: "ambiguous",

      confidence: 0.85,

      originalText: "Open it",

      normalizedText: "open it",

      entities: [],

      references: [
        {
          expression: "it",

          resolved: false,
        },
      ],

      requiresContext: true,
    });

    const capabilitySpy = vi.spyOn(capabilityResolver, "resolve");

    const planningSpy = vi.spyOn(planningEngine, "createPlan");

    const executionSpy = vi.spyOn(executionEngine, "execute");

    const result = await intelligenceEngine.process(context);

    expect(result.requestId).toBe(requestId);

    expect(result.understanding).toEqual({
      originalText: "Open it",

      normalizedText: "open it",

      status: "ambiguous",

      requiresContext: true,

      entities: [],

      references: [
        {
          expression: "it",

          resolved: false,
        },
      ],
    });

    expect(result.decision).toMatchObject({
      type: "clarify",

      intent: "action",

      requiresAction: false,

      requiresPlanning: false,

      requiresCapability: false,

      requiresClarification: true,

      confidence: 0.85,
    });

    expect(result.decision.reason).toBe(
      "The request contains unresolved or ambiguous information.",
    );

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

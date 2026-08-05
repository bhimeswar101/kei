import { afterEach, describe, expect, it, vi } from "vitest";

import { capabilityResolver } from "@/core/capabilities";
import { executionEngine } from "@/core/execution";
import { intelligenceEngine } from "@/core/intelligence";
import { planningEngine } from "@/core/planning";
import { requestUnderstandingEngine } from "@/core/understanding";

import type { CapabilityResolution } from "@/core/capabilities";
import type { IntelligenceContext } from "@/core/intelligence";

describe("KeiIntelligenceEngine unavailable capability routing", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("stops planning and execution when the required capability is unavailable", async () => {
    const requestId = "test-unavailable-capability-request";

    const context: IntelligenceContext = {
      requestId,

      input: {
        id: `${requestId}:input`,

        type: "text",

        text: "Send a message to Alex",

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

      status: "understood",

      confidence: 0.97,

      originalText: "Send a message to Alex",

      normalizedText: "send a message to alex",

      entities: [],

      references: [],

      requiresContext: false,
    });

    const capabilityResolution: CapabilityResolution = {
      requestId,

      available: false,

      matches: [],
    };

    const capabilitySpy = vi
      .spyOn(capabilityResolver, "resolve")
      .mockResolvedValue(capabilityResolution);

    const planningSpy = vi.spyOn(planningEngine, "createPlan");

    const executionSpy = vi.spyOn(executionEngine, "execute");

    const result = await intelligenceEngine.process(context);

    expect(result.requestId).toBe(requestId);

    expect(result.decision).toMatchObject({
      type: "execute",

      intent: "action",

      requiresAction: true,

      requiresPlanning: true,

      requiresCapability: true,

      requiresClarification: false,

      confidence: 0.97,
    });

    expect(result.understanding).toMatchObject({
      originalText: "Send a message to Alex",

      normalizedText: "send a message to alex",

      status: "understood",

      requiresContext: false,
    });

    expect(capabilitySpy).toHaveBeenCalledTimes(1);

    expect(result.capability).toBe(capabilityResolution);

    expect(result.capability?.available).toBe(false);

    expect(result.capability?.selected).toBeUndefined();

    expect(planningSpy).not.toHaveBeenCalled();

    expect(executionSpy).not.toHaveBeenCalled();

    expect(result.planning).toBeUndefined();

    expect(result.execution).toBeUndefined();

    expect(intelligenceEngine.getStatus()).toBe("completed");

    expect(intelligenceEngine.isProcessing()).toBe(false);
  });
});

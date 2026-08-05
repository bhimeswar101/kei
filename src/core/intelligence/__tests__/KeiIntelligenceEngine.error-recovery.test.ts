import { afterEach, describe, expect, it, vi } from "vitest";

import { capabilityResolver } from "@/core/capabilities";
import { executionEngine } from "@/core/execution";
import { intelligenceEngine } from "@/core/intelligence";
import { planningEngine } from "@/core/planning";
import { requestUnderstandingEngine } from "@/core/understanding";

import type { IntelligenceContext } from "@/core/intelligence";

describe("KeiIntelligenceEngine error recovery", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("enters the error state after an unexpected failure and recovers on the next request", async () => {
    const failedRequestId = "test-error-request";

    const failedContext: IntelligenceContext = {
      requestId: failedRequestId,

      input: {
        id: `${failedRequestId}:input`,

        type: "text",

        text: "Hello Kei",

        timestamp: new Date(),
      },

      context: {
        requestId: failedRequestId,

        createdAt: Date.now(),

        entries: new Map(),
      },
    };

    const unexpectedError = new Error("Unexpected understanding failure.");

    vi.spyOn(requestUnderstandingEngine, "understand").mockRejectedValueOnce(unexpectedError);

    const capabilitySpy = vi.spyOn(capabilityResolver, "resolve");

    const planningSpy = vi.spyOn(planningEngine, "createPlan");

    const executionSpy = vi.spyOn(executionEngine, "execute");

    await expect(intelligenceEngine.process(failedContext)).rejects.toBe(unexpectedError);

    expect(intelligenceEngine.getStatus()).toBe("error");

    expect(intelligenceEngine.isProcessing()).toBe(false);

    expect(capabilitySpy).not.toHaveBeenCalled();

    expect(planningSpy).not.toHaveBeenCalled();

    expect(executionSpy).not.toHaveBeenCalled();

    const recoveryRequestId = "test-error-recovery-request";

    const recoveryContext: IntelligenceContext = {
      requestId: recoveryRequestId,

      input: {
        id: `${recoveryRequestId}:input`,

        type: "text",

        text: "Hello Kei",

        timestamp: new Date(),
      },

      context: {
        requestId: recoveryRequestId,

        createdAt: Date.now(),

        entries: new Map(),
      },
    };

    vi.mocked(requestUnderstandingEngine.understand).mockResolvedValueOnce({
      requestId: recoveryRequestId,

      intent: "conversation",

      status: "understood",

      confidence: 0.95,

      originalText: "Hello Kei",

      normalizedText: "hello kei",

      entities: [],

      references: [],

      requiresContext: false,
    });

    const result = await intelligenceEngine.process(recoveryContext);

    expect(result.requestId).toBe(recoveryRequestId);

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

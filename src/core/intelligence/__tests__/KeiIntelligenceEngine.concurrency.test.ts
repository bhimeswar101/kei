import { afterEach, describe, expect, it, vi } from "vitest";

import { capabilityResolver } from "@/core/capabilities";
import { executionEngine } from "@/core/execution";
import { intelligenceEngine } from "@/core/intelligence";
import { planningEngine } from "@/core/planning";
import { requestUnderstandingEngine } from "@/core/understanding";

import type { IntelligenceContext } from "@/core/intelligence";
import type { RequestUnderstanding } from "@/core/understanding";

describe("KeiIntelligenceEngine concurrent request protection", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects a second request while the intelligence engine is already processing", async () => {
    const firstRequestId = "test-concurrent-first-request";

    const secondRequestId = "test-concurrent-second-request";

    const firstContext: IntelligenceContext = {
      requestId: firstRequestId,

      input: {
        id: `${firstRequestId}:input`,

        type: "text",

        text: "Hello Kei",

        timestamp: new Date(),
      },

      context: {
        requestId: firstRequestId,

        createdAt: Date.now(),

        entries: new Map(),
      },
    };

    const secondContext: IntelligenceContext = {
      requestId: secondRequestId,

      input: {
        id: `${secondRequestId}:input`,

        type: "text",

        text: "What time is it?",

        timestamp: new Date(),
      },

      context: {
        requestId: secondRequestId,

        createdAt: Date.now(),

        entries: new Map(),
      },
    };

    let resolveUnderstanding:
      | ((understanding: RequestUnderstanding) => void)
      | undefined;

    const pendingUnderstanding = new Promise<RequestUnderstanding>((resolve) => {
      resolveUnderstanding = resolve;
    });

    const understandingSpy = vi
      .spyOn(requestUnderstandingEngine, "understand")
      .mockImplementationOnce(() => pendingUnderstanding);

    const capabilitySpy = vi.spyOn(capabilityResolver, "resolve");

    const planningSpy = vi.spyOn(planningEngine, "createPlan");

    const executionSpy = vi.spyOn(executionEngine, "execute");

    /*
     * Start the first request without awaiting it.
     *
     * The understanding promise deliberately remains
     * unresolved so the intelligence engine stays in
     * the processing state.
     */
    const firstRequestPromise = intelligenceEngine.process(firstContext);

    expect(intelligenceEngine.getStatus()).toBe("processing");

    expect(intelligenceEngine.isProcessing()).toBe(true);

    /*
     * A second request must not be allowed to enter
     * the shared intelligence pipeline while the
     * first request is still active.
     */
    await expect(intelligenceEngine.process(secondContext)).rejects.toThrow(
      "The intelligence engine is already processing a request.",
    );

    /*
     * Rejecting the second request must not corrupt
     * the state of the request that is already active.
     */
    expect(intelligenceEngine.getStatus()).toBe("processing");

    expect(intelligenceEngine.isProcessing()).toBe(true);

    expect(understandingSpy).toHaveBeenCalledTimes(1);

    expect(understandingSpy).toHaveBeenCalledWith(firstContext);

    expect(capabilitySpy).not.toHaveBeenCalled();

    expect(planningSpy).not.toHaveBeenCalled();

    expect(executionSpy).not.toHaveBeenCalled();

    /*
     * Release the first request and allow the normal
     * conversational intelligence pipeline to finish.
     */
    if (!resolveUnderstanding) {
      throw new Error("The pending understanding resolver was not initialized.");
    }

    resolveUnderstanding({
      requestId: firstRequestId,

      intent: "conversation",

      status: "understood",

      confidence: 0.95,

      originalText: "Hello Kei",

      normalizedText: "hello kei",

      entities: [],

      references: [],

      requiresContext: false,
    });

    const result = await firstRequestPromise;

    expect(result.requestId).toBe(firstRequestId);

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

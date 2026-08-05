import { afterEach, describe, expect, it, vi } from "vitest";

import { capabilityResolver } from "@/core/capabilities";
import { executionEngine } from "@/core/execution";
import { intelligenceEngine } from "@/core/intelligence";
import { planningEngine } from "@/core/planning";
import { requestUnderstandingEngine } from "@/core/understanding";

import type { CapabilityDefinition, CapabilityResolution } from "@/core/capabilities";
import type { IntelligenceContext } from "@/core/intelligence";
import type { PlanningResult } from "@/core/planning";

describe("KeiIntelligenceEngine planning failure routing", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("prevents execution when planning is unsuccessful", async () => {
    const requestId = "test-planning-failure-request";

    const capability: CapabilityDefinition = {
      id: "application.open",

      name: "Open Application",

      description: "Open or launch an installed application.",

      category: "application",

      supportedIntents: ["action"],

      riskLevel: "low",

      requiresPermission: false,
    };

    const context: IntelligenceContext = {
      requestId,

      input: {
        id: `${requestId}:input`,

        type: "text",

        text: "Open Calculator",

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

      confidence: 0.98,

      originalText: "Open Calculator",

      normalizedText: "open calculator",

      entities: [
        {
          type: "application",

          value: "calculator",

          raw: "Calculator",

          confidence: 1,
        },
      ],

      references: [],

      requiresContext: false,
    });

    const capabilityResolution: CapabilityResolution = {
      requestId,

      available: true,

      matches: [
        {
          capability,

          confidence: 1,

          reason: "The request requires opening an application.",
        },
      ],

      selected: {
        capability,

        confidence: 1,

        reason: "The request requires opening an application.",
      },
    };

    const capabilitySpy = vi
      .spyOn(capabilityResolver, "resolve")
      .mockResolvedValue(capabilityResolution);

    const planningResult: PlanningResult = {
      requestId,

      success: false,

      reason: "Unable to create a valid execution plan.",
    };

    const planningSpy = vi.spyOn(planningEngine, "createPlan").mockResolvedValue(planningResult);

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

      confidence: 0.98,
    });

    expect(capabilitySpy).toHaveBeenCalledTimes(1);

    expect(planningSpy).toHaveBeenCalledTimes(1);

    expect(executionSpy).not.toHaveBeenCalled();

    expect(result.capability).toBe(capabilityResolution);

    expect(result.planning).toBe(planningResult);

    expect(result.planning?.success).toBe(false);

    expect(result.planning?.plan).toBeUndefined();

    expect(result.planning?.reason).toBe("Unable to create a valid execution plan.");

    expect(result.execution).toBeUndefined();

    expect(intelligenceEngine.getStatus()).toBe("completed");

    expect(intelligenceEngine.isProcessing()).toBe(false);
  });
});

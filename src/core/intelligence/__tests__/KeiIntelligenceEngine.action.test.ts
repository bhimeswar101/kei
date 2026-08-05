import { afterEach, describe, expect, it, vi } from "vitest";

import { capabilityResolver } from "@/core/capabilities";
import { executionEngine } from "@/core/execution";
import { intelligenceEngine } from "@/core/intelligence";
import { planningEngine } from "@/core/planning";
import { requestUnderstandingEngine } from "@/core/understanding";

import type { CapabilityDefinition, CapabilityResolution } from "@/core/capabilities";
import type { ExecutionResult } from "@/core/execution";
import type { IntelligenceContext } from "@/core/intelligence";
import type { PlanningResult } from "@/core/planning";

describe("KeiIntelligenceEngine action routing", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("routes an actionable request through capability resolution, planning, and execution", async () => {
    const requestId = "test-action-request";

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

    const createdAt = new Date();

    const planningResult: PlanningResult = {
      requestId,

      success: true,

      plan: {
        id: "test-plan",

        requestId,

        goal: "open calculator",

        steps: [
          {
            id: "test-step",

            order: 1,

            capability,

            description: "Open Calculator",

            arguments: {
              application: "calculator",
            },

            dependencies: [],

            status: "ready",
          },
        ],

        status: "ready",

        requiresConfirmation: false,

        createdAt,
      },
    };

    const planningSpy = vi.spyOn(planningEngine, "createPlan").mockResolvedValue(planningResult);

    const startedAt = new Date();

    const completedAt = new Date();

    const executionResult: ExecutionResult = {
      requestId,

      planId: "test-plan",

      status: "completed",

      steps: [
        {
          stepId: "test-step",

          capability,

          status: "completed",

          output: {
            application: "calculator",

            opened: true,
          },

          startedAt,

          completedAt,
        },
      ],

      startedAt,

      completedAt,
    };

    const executionSpy = vi.spyOn(executionEngine, "execute").mockResolvedValue(executionResult);

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

    expect(result.understanding).toMatchObject({
      originalText: "Open Calculator",

      normalizedText: "open calculator",

      status: "understood",

      requiresContext: false,
    });

    expect(capabilitySpy).toHaveBeenCalledTimes(1);

    expect(planningSpy).toHaveBeenCalledTimes(1);

    expect(executionSpy).toHaveBeenCalledTimes(1);

    expect(result.capability).toBe(capabilityResolution);

    expect(result.planning).toBe(planningResult);

    expect(result.execution).toBe(executionResult);

    expect(result.capability?.selected?.capability.id).toBe("application.open");

    expect(result.planning?.plan?.status).toBe("ready");

    expect(result.execution?.status).toBe("completed");

    expect(intelligenceEngine.getStatus()).toBe("completed");

    expect(intelligenceEngine.isProcessing()).toBe(false);
  });
});

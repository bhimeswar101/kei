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

describe("KeiIntelligenceEngine execution failure routing", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("preserves a failed execution result after successful capability resolution and planning", async () => {
    const requestId = "test-execution-failure-request";

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

      status: "failed",

      steps: [
        {
          stepId: "test-step",

          capability,

          status: "failed",

          error: "Unable to open Calculator.",

          startedAt,

          completedAt,
        },
      ],

      startedAt,

      completedAt,

      error: "Unable to open Calculator.",
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

    expect(result.execution?.status).toBe("failed");

    expect(result.execution?.error).toBe("Unable to open Calculator.");

    expect(result.execution?.steps).toHaveLength(1);

    expect(result.execution?.steps[0]).toMatchObject({
      stepId: "test-step",

      status: "failed",

      error: "Unable to open Calculator.",
    });

    expect(intelligenceEngine.getStatus()).toBe("completed");

    expect(intelligenceEngine.isProcessing()).toBe(false);
  });
});

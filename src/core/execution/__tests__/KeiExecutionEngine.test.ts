import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { KeiExecutionEngine } from "../KeiExecutionEngine";
import { capabilityHandlerRegistry } from "../CapabilityHandlerRegistry";
import { permissionManager } from "@/core/permissions";
import { eventBus } from "@/core/events";
import { EVENTS } from "@/shared/constants/events";
import type { CapabilityDefinition } from "@/core/capabilities";

describe("KeiExecutionEngine", () => {
  let engine: KeiExecutionEngine;
  let mockHandler: any;
  let emittedEvents: any[] = [];

  beforeEach(() => {
    engine = new KeiExecutionEngine();
    emittedEvents = [];

    mockHandler = {
      capabilityId: "test.capability",
      canHandle: vi.fn().mockReturnValue(true),
      execute: vi.fn().mockResolvedValue({
        stepId: "step-1",
        capability: { id: "test.capability" },
        status: "completed",
        startedAt: new Date(),
        completedAt: new Date(),
      }),
    };

    vi.spyOn(capabilityHandlerRegistry, "resolve").mockImplementation((cap) => {
      if (cap.id === "test.capability") return mockHandler;
      return undefined;
    });

    vi.spyOn(eventBus, "emit").mockImplementation(async (event, payload) => {
      if (event === EVENTS.TOOL_EXECUTED) {
        emittedEvents.push(payload);
      }
    });

    vi.spyOn(permissionManager, "getStatus").mockReturnValue("granted");
    vi.spyOn(permissionManager, "request").mockResolvedValue("granted");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("executes sequential plan steps and emits success events", async () => {
    const capability: CapabilityDefinition = {
      id: "test.capability",
      name: "Test",
      category: "test",
      supportedIntents: ["action"],
      riskLevel: "low",
      requiresPermission: false,
    };

    const context = {
      requestId: "req-1",
      plan: {
        id: "plan-1",
        goal: "run test",
        steps: [
          {
            id: "step-1",
            order: 1,
            capability,
            description: "Step 1",
            arguments: {},
            dependencies: [],
            status: "ready",
          },
        ],
        status: "ready",
        requiresConfirmation: false,
        createdAt: new Date(),
      },
    };

    const result = await engine.execute(context as any);
    expect(result.status).toBe("completed");
    expect(mockHandler.execute).toHaveBeenCalled();

    expect(emittedEvents.length).toBe(1);
    expect(emittedEvents[0]).toMatchObject({
      capabilityId: "test.capability",
      status: "completed",
      success: true,
      stepId: "step-1",
    });
  });

  it("handles and emits permission denial properly", async () => {
    const capability: CapabilityDefinition = {
      id: "test.capability",
      name: "Test Files",
      category: "file-system",
      supportedIntents: ["action"],
      riskLevel: "medium",
      requiresPermission: true,
    };

    const context = {
      requestId: "req-1",
      plan: {
        id: "plan-1",
        goal: "run test",
        steps: [
          {
            id: "step-1",
            order: 1,
            capability,
            description: "Step 1",
            arguments: {},
            dependencies: [],
            status: "ready",
          },
        ],
        status: "ready",
        requiresConfirmation: false,
        createdAt: new Date(),
      },
    };

    vi.spyOn(permissionManager, "getStatus").mockReturnValue("prompt");
    vi.spyOn(permissionManager, "request").mockResolvedValue("denied");

    const result = await engine.execute(context as any);
    expect(result.status).toBe("failed");
    expect(result.error).toContain("denied");
    expect(mockHandler.execute).not.toHaveBeenCalled();

    expect(emittedEvents.length).toBe(1);
    expect(emittedEvents[0]).toMatchObject({
      capabilityId: "test.capability",
      status: "failed",
      success: false,
      stepId: "step-1",
    });
  });
});

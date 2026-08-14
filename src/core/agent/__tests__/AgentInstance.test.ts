import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AgentInstance } from "../AgentInstance";
import { executionEngine } from "@/core/execution";
import { planningEngine } from "@/core/planning";
import { eventBus } from "@/core/events";
import { EVENTS } from "@/shared/constants/events";
import type { ExecutionPlan } from "@/core/planning";

describe("AgentInstance", () => {
  let initialPlan: ExecutionPlan;
  let emittedEvents: any[] = [];

  beforeEach(() => {
    emittedEvents = [];
    vi.spyOn(eventBus, "emit").mockImplementation(async (event, payload) => {
      emittedEvents.push({ event, payload });
    });

    initialPlan = {
      id: "plan-123",
      requestId: "req-123",
      goal: "Open calc and close paint",
      status: "ready",
      requiresConfirmation: false,
      createdAt: new Date(),
      steps: [
        {
          id: "step-1",
          order: 1,
          capability: {
            id: "application.open",
            name: "Open Application",
            category: "application",
            supportedIntents: ["action"],
            riskLevel: "low",
            requiresPermission: false,
          },
          description: "Open paint",
          arguments: { target: "paint" },
          dependencies: [],
          status: "ready",
        },
      ],
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("completes simple plan and transitions state correctly", async () => {
    vi.spyOn(executionEngine, "execute").mockResolvedValue({
      requestId: "req-123",
      planId: "plan-123",
      status: "completed",
      steps: [
        {
          stepId: "step-1",
          capability: { id: "application.open" } as any,
          status: "completed",
          startedAt: new Date(),
          completedAt: new Date(),
        },
      ],
      startedAt: new Date(),
      completedAt: new Date(),
    });

    const agent = new AgentInstance("req-123", "Open calc");
    const result = await agent.run(initialPlan);

    expect(result.status).toBe("completed");
    expect(agent.getState()).toBe("completed");

    const startEvent = emittedEvents.find(
      (e) => e.event === EVENTS.AGENT_STARTED,
    );
    const progressEvent = emittedEvents.find(
      (e) => e.event === EVENTS.AGENT_PROGRESS,
    );
    const completedEvent = emittedEvents.find(
      (e) => e.event === EVENTS.AGENT_COMPLETED,
    );

    expect(startEvent).toBeDefined();
    expect(progressEvent).toBeDefined();
    expect(completedEvent).toBeDefined();
  });

  it("fails immediately on high-risk step failure", async () => {
    initialPlan.steps[0].capability.riskLevel = "high";
    vi.spyOn(executionEngine, "execute").mockResolvedValue({
      requestId: "req-123",
      planId: "plan-123",
      status: "failed",
      steps: [
        {
          stepId: "step-1",
          capability: { id: "application.open" } as any,
          status: "failed",
          error: "High-risk application failure",
          startedAt: new Date(),
          completedAt: new Date(),
        },
      ],
      startedAt: new Date(),
      completedAt: new Date(),
    });

    const agent = new AgentInstance("req-123", "Open calc");
    const result = await agent.run(initialPlan);

    expect(result.status).toBe("failed");
    expect(agent.getState()).toBe("failed");
    expect(result.error).toBe("High-risk application failure");
  });

  it("replans and continues on low-risk step failure", async () => {
    vi.spyOn(executionEngine, "execute")
      .mockResolvedValueOnce({
        requestId: "req-123",
        planId: "plan-123",
        status: "failed",
        steps: [
          {
            stepId: "step-1",
            capability: { id: "application.open" } as any,
            status: "failed",
            error: "Process blocked",
            startedAt: new Date(),
            completedAt: new Date(),
          },
        ],
        startedAt: new Date(),
        completedAt: new Date(),
      })
      .mockResolvedValueOnce({
        requestId: "req-123",
        planId: "plan-123",
        status: "completed",
        steps: [
          {
            stepId: "step-2",
            capability: { id: "application.open" } as any,
            status: "completed",
            startedAt: new Date(),
            completedAt: new Date(),
          },
        ],
        startedAt: new Date(),
        completedAt: new Date(),
      });

    const newPlan: ExecutionPlan = {
      ...initialPlan,
      steps: [
        {
          id: "step-2",
          order: 1,
          capability: initialPlan.steps[0].capability,
          description: "Retry open paint alternative",
          arguments: { target: "paint" },
          dependencies: [],
          status: "ready",
        },
      ],
    };

    vi.spyOn(planningEngine, "createPlan").mockResolvedValue({
      requestId: "req-123",
      success: true,
      plan: newPlan,
    });

    const agent = new AgentInstance("req-123", "Open calc", { allowReplan: true });
    const result = await agent.run(initialPlan);

    expect(result.status).toBe("completed");
    expect(agent.getState()).toBe("completed");
    expect(
      emittedEvents.some((e) => e.event === EVENTS.AGENT_REPLANNED),
    ).toBe(true);
  });

  it("respects maxIterations guard", async () => {
    vi.spyOn(executionEngine, "execute").mockResolvedValue({
      requestId: "req-123",
      planId: "plan-123",
      status: "failed",
      steps: [
        {
          stepId: "step-1",
          capability: { id: "application.open" } as any,
          status: "failed",
          error: "Process blocked",
          startedAt: new Date(),
          completedAt: new Date(),
        },
      ],
      startedAt: new Date(),
      completedAt: new Date(),
    });

    vi.spyOn(planningEngine, "createPlan").mockResolvedValue({
      requestId: "req-123",
      success: true,
      plan: initialPlan,
    });

    const agent = new AgentInstance("req-123", "Open calc", {
      maxIterations: 3,
      allowReplan: true,
    });
    const result = await agent.run(initialPlan);

    expect(result.status).toBe("failed");
    expect(agent.getState()).toBe("failed");
    expect(result.error).toContain("Maximum iterations limit");
  });

  it("handles cancellation correctly", async () => {
    vi.spyOn(executionEngine, "execute").mockImplementation(async () => {
      await agent.cancel();
      return {
        requestId: "req-123",
        planId: "plan-123",
        status: "cancelled",
        steps: [
          {
            stepId: "step-1",
            capability: { id: "application.open" } as any,
            status: "cancelled",
            startedAt: new Date(),
            completedAt: new Date(),
          },
        ],
        startedAt: new Date(),
        completedAt: new Date(),
      };
    });

    const agent = new AgentInstance("req-123", "Open calc");
    const result = await agent.run(initialPlan);

    expect(result.status).toBe("cancelled");
    expect(agent.getState()).toBe("cancelled");
  });
});

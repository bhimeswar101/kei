import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { agentOrchestrator } from "../AgentOrchestrator";

describe("AgentOrchestrator", () => {
  beforeEach(() => {
    agentOrchestrator.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates, registers and returns agent instances", () => {
    const agent = agentOrchestrator.createAgent(
      "req-abc",
      "Find and read document",
    );
    expect(agent).toBeDefined();
    expect(agent.requestId).toBe("req-abc");

    const retrieved = agentOrchestrator.getAgent(agent.id);
    expect(retrieved).toBe(agent);

    const active = agentOrchestrator.getActiveAgents();
    expect(active.length).toBe(1);
    expect(active[0]).toBe(agent);
  });

  it("throws error when trying to create concurrent agents for same requestId", () => {
    agentOrchestrator.createAgent("req-abc", "First task");
    expect(() =>
      agentOrchestrator.createAgent("req-abc", "Second task"),
    ).toThrow();
  });

  it("cancels registered agents successfully", async () => {
    const agent = agentOrchestrator.createAgent("req-abc", "Run task");
    const cancelSpy = vi.spyOn(agent, "cancel").mockResolvedValue();

    await agentOrchestrator.cancelAgent(agent.id);
    expect(cancelSpy).toHaveBeenCalled();
  });
});

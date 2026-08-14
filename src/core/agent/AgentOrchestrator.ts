import { AgentInstance } from "./AgentInstance";
import type { AgentConfig, AgentInstanceContract } from "./types";

export class AgentOrchestrator {
  private readonly instances = new Map<string, AgentInstanceContract>();

  createAgent(
    requestId: string,
    goal: string,
    config?: AgentConfig,
  ): AgentInstanceContract {
    const existing = Array.from(this.instances.values()).find(
      (agent) => agent.requestId === requestId,
    );

    if (existing) {
      throw new Error(
        `An agent is already active for request ID "${requestId}".`,
      );
    }

    const agent = new AgentInstance(requestId, goal, config);
    this.instances.set(agent.id, agent);
    return agent;
  }

  getAgent(id: string): AgentInstanceContract | undefined {
    return this.instances.get(id);
  }

  async cancelAgent(id: string): Promise<void> {
    const agent = this.instances.get(id);
    if (agent) {
      await agent.cancel();
    }
  }

  getActiveAgents(): readonly AgentInstanceContract[] {
    return Array.from(this.instances.values());
  }

  removeAgent(id: string): boolean {
    return this.instances.delete(id);
  }

  clear(): void {
    this.instances.clear();
  }
}

export const agentOrchestrator = new AgentOrchestrator();

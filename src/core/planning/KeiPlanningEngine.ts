import { BasePlanningEngine } from "./PlanningEngine";

import type { ExecutionPlan, PlanningInput, PlanningResult, PlanStep } from "./types";

export class KeiPlanningEngine extends BasePlanningEngine {
  async createPlan(input: PlanningInput): Promise<PlanningResult> {
    this.beginPlanning();

    try {
      const step = this.createStep(input);

      const plan: ExecutionPlan = {
        id: this.createPlanId(input.requestId),

        requestId: input.requestId,

        goal: input.goal,

        steps: [step],

        status: "ready",

        requiresConfirmation: input.capability.requiresPermission,

        createdAt: new Date(),
      };

      return {
        requestId: input.requestId,

        success: true,

        plan,
      };
    } catch (error) {
      return {
        requestId: input.requestId,

        success: false,

        reason: error instanceof Error ? error.message : "Planning failed.",
      };
    } finally {
      this.endPlanning();
    }
  }

  private createStep(input: PlanningInput): PlanStep {
    return {
      id: `${input.requestId}:step:1`,

      order: 1,

      capability: input.capability,

      description: `Use ${input.capability.name} to satisfy the request.`,

      arguments: this.createArguments(input),

      dependencies: [],

      status: "ready",
    };
  }

  private createArguments(
  input: PlanningInput,
): Readonly<Record<string, unknown>> {
  const applicationEntity =
    input.entities.find(
      (entity) =>
        entity.type === "application",
    );

  if (applicationEntity) {
    return {
      target: applicationEntity.value,
    };
  }

  return {
    goal: input.goal,

    entities: input.entities,
  };
}

  private createPlanId(requestId: string): string {
    return `${requestId}:plan`;
  }
}

export const planningEngine = new KeiPlanningEngine();

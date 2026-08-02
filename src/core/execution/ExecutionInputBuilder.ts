import type { IntelligenceResult } from "@/core/intelligence";

import type { ExecutionContext } from "./types";

export interface ExecutionEligibility {
  readonly allowed: boolean;
  readonly reason?: string;
}

export class ExecutionInputBuilder {
  canExecute(result: IntelligenceResult): ExecutionEligibility {
    const planning = result.planning;

    if (!planning) {
      return {
        allowed: false,
        reason: "No planning result is available.",
      };
    }

    if (!planning.success) {
      return {
        allowed: false,
        reason: "Planning was not successful.",
      };
    }

    const plan = planning.plan;

    if (!plan) {
      return {
        allowed: false,
        reason: "No execution plan is available.",
      };
    }

    if (plan.status !== "ready") {
      return {
        allowed: false,
        reason: `The execution plan is not ready. Current status: "${plan.status}".`,
      };
    }

    if (plan.steps.length === 0) {
      return {
        allowed: false,
        reason: "The execution plan contains no steps.",
      };
    }

    if (plan.requiresConfirmation) {
      return {
        allowed: false,
        reason: "The execution plan requires confirmation.",
      };
    }

    return {
      allowed: true,
    };
  }

  build(result: IntelligenceResult): ExecutionContext {
    const eligibility = this.canExecute(result);

    if (!eligibility.allowed) {
      throw new Error(eligibility.reason ?? "The execution plan is not eligible for execution.");
    }

    const plan = result.planning?.plan;

    if (!plan) {
      throw new Error("No execution plan is available.");
    }

    return {
      requestId: result.requestId,

      plan,

      metadata: {
        intent: result.decision.intent,
        confidence: result.decision.confidence,
        capabilityAvailable: result.capability?.available ?? false,
      },
    };
  }
}

export const executionInputBuilder = new ExecutionInputBuilder();

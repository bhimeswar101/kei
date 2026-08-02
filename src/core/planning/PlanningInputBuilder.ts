import type { CapabilityDefinition } from "@/core/capabilities";

import type { IntelligenceContext, IntelligenceResult } from "@/core/intelligence";

import type { PlanningInput } from "./types";

export class PlanningInputBuilder {
  build(
    context: IntelligenceContext,
    result: IntelligenceResult,
    capability: CapabilityDefinition,
  ): PlanningInput {
    return {
      requestId: result.requestId,

      goal: result.understanding.normalizedText,

      context,

      capability,

      entities: result.understanding.entities,

      metadata: {
        intent: result.decision.intent,
        confidence: result.decision.confidence,
        decisionType: result.decision.type,
      },
    };
  }
}

export const planningInputBuilder = new PlanningInputBuilder();

import type {
  IntelligenceDecision,
  IntelligenceUnderstanding,
} from "@/core/intelligence";

import type {
  CapabilityQuery,
} from "./types";

export class CapabilityQueryBuilder {
  build(
    requestId: string,
    understanding: IntelligenceUnderstanding,
    decision: IntelligenceDecision,
  ): CapabilityQuery {
    return {
      requestId,

      intent: decision.intent,

      text: understanding.normalizedText,

      entities: understanding.entities,

      requiresAction: decision.requiresAction,
    };
  }
}

export const capabilityQueryBuilder =
  new CapabilityQueryBuilder();
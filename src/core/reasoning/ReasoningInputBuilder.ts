import type {
  RequestUnderstanding,
} from "@/core/understanding";

import type {
  ReasoningInput,
} from "./types";

export class ReasoningInputBuilder {
  build(
    understanding: RequestUnderstanding,
  ): ReasoningInput {
    return {
      requestId:
        understanding.requestId,

      intent:
        understanding.intent,

      understandingStatus:
        understanding.status,

      confidence:
        understanding.confidence,

      originalText:
        understanding.originalText,

      normalizedText:
        understanding.normalizedText,

      entities:
        understanding.entities,

      references:
        understanding.references,

      requiresContext:
        understanding.requiresContext,
    };
  }
}

export const reasoningInputBuilder =
  new ReasoningInputBuilder();
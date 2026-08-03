import type {
  IntelligenceContext,
  IntelligenceResult,
} from "@/core/intelligence";

import type {
  ResponseSynthesisInput,
} from "./types";

export class ResponseSynthesisInputBuilder {
  build(
    context: IntelligenceContext,
    intelligence: IntelligenceResult,
  ): ResponseSynthesisInput {
    if (
      context.requestId !==
      intelligence.requestId
    ) {
      throw new Error(
        "Response synthesis context and intelligence result request IDs do not match.",
      );
    }

    return {
      requestId:
        intelligence.requestId,

      originalText:
        context.input.text,

      intelligence,

      metadata:
        context.metadata,
    };
  }
}

export const responseSynthesisInputBuilder =
  new ResponseSynthesisInputBuilder();
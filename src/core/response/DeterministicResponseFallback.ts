import { responseContentBuilder } from "./ResponseContentBuilder";

import { responseSuccessResolver } from "./ResponseSuccessResolver";

import type { GeneratedAIResponse, ResponseSynthesisInput } from "./types";

export interface DeterministicResponseFallbackContract {
  generate(input: ResponseSynthesisInput): GeneratedAIResponse;
}

export class DeterministicResponseFallback implements DeterministicResponseFallbackContract {
  generate(input: ResponseSynthesisInput): GeneratedAIResponse {
    const content = responseContentBuilder.build(input);

    return {
      text: this.buildFallbackText(content.strategy),

      grounded: content.grounded,

      strategy: content.strategy,

      success: responseSuccessResolver.resolve(content.strategy),

      source: "fallback",
    };
  }

  private buildFallbackText(strategy: GeneratedAIResponse["strategy"]): string {
    switch (strategy) {
      case "conversation":
        return "I'm unable to generate a conversational response right now.";

      case "clarification":
        return "Could you provide a little more information so I can help you accurately?";

      case "execution-success":
        return "The requested action completed successfully.";

      case "execution-failure":
        return "The requested action could not be completed.";

      case "cancelled":
        return "The requested action was cancelled.";

      case "rejection":
        return "I can't help with that request.";

      case "unsupported":
        return "That capability isn't available yet.";

      case "deferred":
        return "The requested action is still in progress.";
    }
  }
}

export const deterministicResponseFallback = new DeterministicResponseFallback();

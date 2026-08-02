import { aiProviderManager } from "@/core/ai";

import { IntentRecognizer } from "./IntentRecognizer";

import type { IntentRecognition } from "./IntentRecognizer";

import type { IntelligenceContext } from "@/core/intelligence";

export class ModelIntentRecognizer extends IntentRecognizer {
  async recognize(
    context: IntelligenceContext,
    normalizedText: string,
  ): Promise<IntentRecognition> {
    const provider = aiProviderManager.getActive();

    await provider.send({
      text: this.buildPrompt(context, normalizedText),
    });

    return {
      intent: "unknown",
      confidence: 0,
    };
  }

  private buildPrompt(context: IntelligenceContext, normalizedText: string): string {
    return [
      "Classify the user's intent.",
      "",
      "Allowed intents:",
      "- conversation",
      "- question",
      "- action",
      "- automation",
      "- unknown",
      "",
      `Request ID: ${context.requestId}`,
      `User request: ${normalizedText}`,
    ].join("\n");
  }
}

export const modelIntentRecognizer = new ModelIntentRecognizer();

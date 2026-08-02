import { aiProviderManager } from "@/core/ai";

import type {
  IntelligenceContext,
  IntelligenceIntent,
} from "@/core/intelligence";

import { IntentRecognizer } from "./IntentRecognizer";

import type {
  IntentRecognition,
} from "./IntentRecognizer";

export class ModelIntentRecognizer extends IntentRecognizer {
  async recognize(
    context: IntelligenceContext,
    normalizedText: string,
  ): Promise<IntentRecognition> {
    const provider =
      aiProviderManager.getActive();

    const response = await provider.send({
      text: this.buildPrompt(
        context,
        normalizedText,
      ),
    });

    return this.parseResponse(response.text);
  }

  private parseResponse(
    responseText: string,
  ): IntentRecognition {
    const normalizedResponse =
      responseText
        .trim()
        .toLowerCase();

    const allowedIntents:
      readonly IntelligenceIntent[] = [
        "conversation",
        "question",
        "action",
        "automation",
        "unknown",
      ];

    const intent =
      allowedIntents.find(
        (candidate) =>
          normalizedResponse === candidate,
      ) ?? "unknown";

    return {
      intent,

      confidence:
        intent === "unknown"
          ? 0
          : 1,
    };
  }

  private buildPrompt(
    context: IntelligenceContext,
    normalizedText: string,
  ): string {
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
      "Definitions:",
      "- conversation: casual conversation that does not require an external action",
      "- question: the user is asking for information or an explanation",
      "- action: the user wants the assistant to perform an immediate action",
      "- automation: the user wants an action performed later, repeatedly, or when a condition occurs",
      "- unknown: the request cannot be reliably classified",
      "",
      "Return exactly one allowed intent.",
      "Do not include explanations.",
      "Do not include punctuation.",
      "Do not use markdown.",
      "",
      `Request ID: ${context.requestId}`,
      `User request: ${normalizedText}`,
    ].join("\n");
  }
}

export const modelIntentRecognizer =
  new ModelIntentRecognizer();
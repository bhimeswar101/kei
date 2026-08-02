import type { IntelligenceContext, IntelligenceIntent } from "@/core/intelligence";

import { IntentRecognizer } from "./IntentRecognizer";

import type { IntentRecognition } from "./IntentRecognizer";

export class RuleIntentRecognizer extends IntentRecognizer {
  async recognize(
    _context: IntelligenceContext,
    normalizedText: string,
  ): Promise<IntentRecognition> {
    const text = normalizedText.trim().toLowerCase();

    const firstWord = text.split(/\s+/)[0] ?? "";

    const actionVerbs = new Set([
      "open",
      "launch",
      "start",
      "close",
      "quit",
      "exit",
      "play",
      "pause",
      "stop",
      "search",
      "find",
      "read",
      "show",
    ]);

    const automationExpressions = [
      "remind me",
      "schedule",
      "every day",
      "every morning",
      "every evening",
      "every week",
      "every month",
    ];

    const questionWords = new Set(["what", "why", "when", "where", "who", "which", "how"]);

    let intent: IntelligenceIntent = "unknown";

    let confidence = 0;

    if (automationExpressions.some((expression) => text.includes(expression))) {
      intent = "automation";
      confidence = 0.95;
    } else if (actionVerbs.has(firstWord)) {
      intent = "action";
      confidence = 0.95;
    } else if (questionWords.has(firstWord) || text.endsWith("?")) {
      intent = "question";
      confidence = 0.9;
    } else if (text.length > 0) {
      intent = "conversation";
      confidence = 0.7;
    }

    return {
      intent,
      confidence,
    };
  }
}

export const ruleIntentRecognizer = new RuleIntentRecognizer();

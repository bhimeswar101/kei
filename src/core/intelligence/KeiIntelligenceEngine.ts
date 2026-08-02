import { aiProviderManager } from "@/core/ai";
import {
  requestUnderstandingEngine,
} from "@/core/understanding";

import { BaseIntelligenceEngine } from "./IntelligenceEngine";

import type {
  IntelligenceContext,
  IntelligenceDecision,
  IntelligenceResult,
} from "./types";

export class KeiIntelligenceEngine
  extends BaseIntelligenceEngine
{
  async process(
    context: IntelligenceContext,
  ): Promise<IntelligenceResult> {
    if (this.isProcessing()) {
      throw new Error(
        "The intelligence engine is already processing a request.",
      );
    }

    this.status = "processing";

    try {
      const understanding =
        await requestUnderstandingEngine.understand(
          context,
        );

      const provider =
        aiProviderManager.getActive();

      const response = await provider.send({
        text: context.input.text,
        audio: context.input.audio,
      });

      const decision: IntelligenceDecision = {
        intent: understanding.intent,
        requiresAction:
          understanding.intent === "action" ||
          understanding.intent ===
            "automation",
        confidence:
          understanding.confidence,
      };

      const result: IntelligenceResult = {
  requestId: context.requestId,

  text: response.text,

  decision,

  understanding: {
    originalText:
      understanding.originalText,

    normalizedText:
      understanding.normalizedText,

    status:
      understanding.status,

    requiresContext:
      understanding.requiresContext,

    entities:
      understanding.entities,

    references:
      understanding.references,
  },
};

      this.status = "completed";

      return result;
    } catch (error) {
      this.status = "error";

      throw error;
    }
  }
}

export const intelligenceEngine =
  new KeiIntelligenceEngine();
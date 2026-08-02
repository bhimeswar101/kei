import { aiProviderManager } from "@/core/ai";
import { reasoningEngine, reasoningInputBuilder } from "@/core/reasoning";
import { requestUnderstandingEngine } from "@/core/understanding";

import { BaseIntelligenceEngine } from "./IntelligenceEngine";

import type { IntelligenceContext, IntelligenceDecision, IntelligenceResult } from "./types";

export class KeiIntelligenceEngine extends BaseIntelligenceEngine {
  async process(context: IntelligenceContext): Promise<IntelligenceResult> {
    if (this.isProcessing()) {
      throw new Error("The intelligence engine is already processing a request.");
    }

    this.status = "processing";

    try {
      // 4.3 — Understand the request
      const understanding = await requestUnderstandingEngine.understand(context);

      // 4.4 — Build reasoning input
      const reasoningInput = reasoningInputBuilder.build(understanding);

      // 4.4 — Decide what Kei should do
      const reasoningResult = await reasoningEngine.reason(context, reasoningInput);

      const provider = aiProviderManager.getActive();

      const response = await provider.send({
        text: context.input.text,
        audio: context.input.audio,
      });

      const decision: IntelligenceDecision = {
        type: reasoningResult.decision.type,

        intent: reasoningResult.decision.intent,

        requiresAction: reasoningResult.decision.requiresAction,

        requiresPlanning: reasoningResult.decision.requiresPlanning,

        requiresCapability: reasoningResult.decision.requiresCapability,

        requiresClarification: reasoningResult.decision.requiresClarification,

        confidence: reasoningResult.decision.confidence,

        reason: reasoningResult.decision.reason,
      };

      const result: IntelligenceResult = {
        requestId: context.requestId,

        text: response.text,

        decision,

        understanding: {
          originalText: understanding.originalText,

          normalizedText: understanding.normalizedText,

          status: understanding.status,

          requiresContext: understanding.requiresContext,

          entities: understanding.entities,

          references: understanding.references,
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

export const intelligenceEngine = new KeiIntelligenceEngine();

import { aiProviderManager } from "@/core/ai";

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
      const provider =
        aiProviderManager.getActive();

      const response = await provider.send({
        text: context.input.text,
        audio: context.input.audio,
      });

      const decision: IntelligenceDecision = {
        intent: "unknown",
        requiresAction: false,
      };

      const result: IntelligenceResult = {
        requestId: context.requestId,
        text: response.text,
        decision,
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
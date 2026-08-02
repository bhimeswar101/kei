import type { IntelligenceContext } from "@/core/intelligence";

import { BaseReasoningEngine } from "./ReasoningEngine";

import type {
  ReasoningDecision,
  ReasoningInput,
  ReasoningResult,
} from "./types";

export class KeiReasoningEngine extends BaseReasoningEngine {
  private readonly minimumConfidence = 0.6;

  async reason(
    _context: IntelligenceContext,
    input: ReasoningInput,
  ): Promise<ReasoningResult> {
    if (this.isReasoning()) {
      throw new Error(
        "The reasoning engine is already processing a request.",
      );
    }

    this.status = "reasoning";

    try {
      const decision = this.createDecision(input);

      const result: ReasoningResult = {
        requestId: input.requestId,
        decision,
      };

      this.status = "completed";

      return result;
    } catch (error) {
      this.status = "error";

      throw error;
    }
  }

  private createDecision(
    input: ReasoningInput,
  ): ReasoningDecision {
    if (
      input.understandingStatus === "unsupported" ||
      input.intent === "unknown"
    ) {
      return this.createClarificationDecision(
        input,
        "The request could not be understood with enough confidence.",
      );
    }

    if (
      input.understandingStatus === "ambiguous"
    ) {
      return this.createClarificationDecision(
        input,
        "The request contains unresolved or ambiguous information.",
      );
    }

    if (
      input.confidence <
      this.minimumConfidence
    ) {
      return this.createClarificationDecision(
        input,
        "The request understanding confidence is too low to make a reliable decision.",
      );
    }

    switch (input.intent) {
      case "conversation":
      case "question":
        return {
          requestId: input.requestId,

          type: "respond",

          intent: input.intent,

          requiresAction: false,
          requiresPlanning: false,
          requiresCapability: false,
          requiresClarification: false,

          confidence: input.confidence,

          reason:
            "The request can be handled with a direct response.",
        };

      case "action":
      case "automation":
        return {
          requestId: input.requestId,

          type: "execute",

          intent: input.intent,

          requiresAction: true,
          requiresPlanning: true,
          requiresCapability: true,
          requiresClarification: false,

          confidence: input.confidence,

          reason:
            "The request requires an external capability and execution.",
        };

      default:
        return this.createClarificationDecision(
          input,
          "No suitable reasoning decision could be determined.",
        );
    }
  }

  private createClarificationDecision(
    input: ReasoningInput,
    reason: string,
  ): ReasoningDecision {
    return {
      requestId: input.requestId,

      type: "clarify",

      intent: input.intent,

      requiresAction: false,
      requiresPlanning: false,
      requiresCapability: false,
      requiresClarification: true,

      confidence: input.confidence,

      reason,
    };
  }
}

export const reasoningEngine =
  new KeiReasoningEngine();
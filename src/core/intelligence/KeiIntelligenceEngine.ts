import { aiProviderManager } from "@/core/ai";
import {
  capabilityQueryBuilder,
  capabilityResolver,
} from "@/core/capabilities";
import {
  planningEngine,
  planningInputBuilder,
} from "@/core/planning";
import { BaseIntelligenceEngine } from "./IntelligenceEngine";
import {
  aiResponseContextBuilder,
} from "./AIResponseContextBuilder";
import {
  reasoningEngine,
  reasoningInputBuilder,
} from "@/core/reasoning";
import {
  requestUnderstandingEngine,
} from "@/core/understanding";


import {
  executionEngine,
  executionInputBuilder,
} from "@/core/execution";

import type {
  IntelligenceContext,
  IntelligenceDecision,
  IntelligenceResult,
  IntelligenceUnderstanding,
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
      // 4.3 — Understand the request
      const understanding =
        await requestUnderstandingEngine.understand(
          context,
        );

      // 4.4 — Build reasoning input
      const reasoningInput =
        reasoningInputBuilder.build(
          understanding,
        );

      // 4.4 — Decide what Kei should do
      const reasoningResult =
        await reasoningEngine.reason(
          context,
          reasoningInput,
        );

      const decision: IntelligenceDecision = {
        type:
          reasoningResult.decision.type,

        intent:
          reasoningResult.decision.intent,

        requiresAction:
          reasoningResult.decision
            .requiresAction,

        requiresPlanning:
          reasoningResult.decision
            .requiresPlanning,

        requiresCapability:
          reasoningResult.decision
            .requiresCapability,

        requiresClarification:
          reasoningResult.decision
            .requiresClarification,

        confidence:
          reasoningResult.decision
            .confidence,

        reason:
          reasoningResult.decision.reason,
      };

      const intelligenceUnderstanding:
        IntelligenceUnderstanding = {
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
      };

      // 4.5 — Resolve required capability
      const capability =
        decision.requiresCapability
          ? await capabilityResolver.resolve(
              context,
              capabilityQueryBuilder.build(
                context.requestId,
                intelligenceUnderstanding,
                decision,
              ),
            )
          : undefined;

      /*
       * Build the partial intelligence result needed
       * by the planning input builder.
       *
       * Planning runs only when reasoning requires it
       * and capability resolution found a selected
       * capability.
       */
      const resultBeforePlanning:
        IntelligenceResult = {
        requestId: context.requestId,

        text: "",

        decision,

        understanding:
          intelligenceUnderstanding,

        capability,
      };

      // 4.6 — Create execution plan
      const planning =
        decision.requiresPlanning &&
        capability?.available === true &&
        capability.selected
          ? await planningEngine.createPlan(
              planningInputBuilder.build(
                context,
                resultBeforePlanning,
                capability.selected.capability,
              ),
            )
          : undefined;
          const resultBeforeExecution:
  IntelligenceResult = {
  requestId: context.requestId,

  text: "",

  decision,

  understanding:
    intelligenceUnderstanding,

  capability,

  planning,
};

// 4.7 — Execute eligible plan
const executionEligibility =
  executionInputBuilder.canExecute(
    resultBeforeExecution,
  );

const execution =
  executionEligibility.allowed
    ? await executionEngine.execute(
        executionInputBuilder.build(
          resultBeforeExecution,
        ),
      )
    : undefined;

      const provider =
  aiProviderManager.getActive();

const responseContext =
  aiResponseContextBuilder.build({
    originalText: context.input.text,
    execution,
  });

const response =
  await provider.send({
    text: responseContext,
    audio: context.input.audio,
  });

      const result: IntelligenceResult = {
  requestId: context.requestId,

  text: response.text,

  decision,

  understanding:
    intelligenceUnderstanding,

  capability,

  planning,

  execution,
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
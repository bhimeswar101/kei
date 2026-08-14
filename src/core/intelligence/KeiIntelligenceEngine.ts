import { capabilityQueryBuilder, capabilityResolver } from "@/core/capabilities";

import { executionEngine, executionInputBuilder } from "@/core/execution";

import { planningEngine, planningInputBuilder } from "@/core/planning";

import { reasoningEngine, reasoningInputBuilder } from "@/core/reasoning";

import { requestUnderstandingEngine } from "@/core/understanding";

import { BaseIntelligenceEngine } from "./IntelligenceEngine";

import { agentOrchestrator } from "@/core/agent";

import type {
  IntelligenceContext,
  IntelligenceDecision,
  IntelligenceResult,
  IntelligenceUnderstanding,
} from "./types";

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

      const intelligenceUnderstanding: IntelligenceUnderstanding = {
        originalText: understanding.originalText,

        normalizedText: understanding.normalizedText,

        status: understanding.status,

        requiresContext: understanding.requiresContext,

        entities: understanding.entities,

        references: understanding.references,
      };

      // 4.5 — Resolve required capability
      const capability = decision.requiresCapability
        ? await capabilityResolver.resolve(
            context,
            capabilityQueryBuilder.build(context.requestId, intelligenceUnderstanding, decision),
          )
        : undefined;

      /*
       * Build the partial intelligence result
       * required by the planning layer.
       */
      const resultBeforePlanning: IntelligenceResult = {
        requestId: context.requestId,

        decision,

        understanding: intelligenceUnderstanding,

        capability,
      };

      // 4.6 — Create execution plan
      const planning =
        decision.requiresPlanning && capability?.available === true && capability.selected
          ? await planningEngine.createPlan(
              planningInputBuilder.build(
                context,
                resultBeforePlanning,
                capability.selected.capability,
              ),
            )
          : undefined;

      /*
       * Build the intelligence result required
       * by the execution input builder.
       */
      const resultBeforeExecution: IntelligenceResult = {
        requestId: context.requestId,

        decision,

        understanding: intelligenceUnderstanding,

        capability,

        planning,
      };

      // 4.7 — Execute eligible plan
      const executionEligibility = executionInputBuilder.canExecute(resultBeforeExecution);

      let execution;
      if (executionEligibility.allowed && resultBeforeExecution.planning?.plan) {
        const agent = agentOrchestrator.createAgent(
          context.requestId,
          resultBeforeExecution.planning.plan.goal,
        );
        execution = await agent.run(resultBeforeExecution.planning.plan);
        agentOrchestrator.removeAgent(agent.id);
      } else {
        execution = undefined;
      }

      /*
       * Intelligence ends with structured
       * understanding, reasoning, capability,
       * planning, and execution information.
       *
       * User-facing response generation belongs
       * exclusively to the response synthesis
       * pipeline.
       */
      const result: IntelligenceResult = {
        requestId: context.requestId,

        decision,

        understanding: intelligenceUnderstanding,

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

export const intelligenceEngine = new KeiIntelligenceEngine();

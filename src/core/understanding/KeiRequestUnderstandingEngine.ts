import type {
  IntelligenceContext,
} from "@/core/intelligence";

import {
  contextReferenceResolver,
} from "./ContextReferenceResolver";
import {
  modelEntityExtractor,
} from "./ModelEntityExtractor";
import {
  ruleEntityExtractor,
} from "./RuleEntityExtractor";
import {
  ruleIntentRecognizer,
} from "./RuleIntentRecognizer";
import {
  requestNormalizer,
} from "./RequestNormalizer";
import {
  RequestUnderstandingEngine,
} from "./RequestUnderstandingEngine";

import type {
  RequestUnderstanding,
} from "./types";

export class KeiRequestUnderstandingEngine
  extends RequestUnderstandingEngine
{
  async understand(
    context: IntelligenceContext,
  ): Promise<RequestUnderstanding> {
    const originalText =
      context.input.text ?? "";

    const normalizedText =
      requestNormalizer.normalize(
        originalText,
      );

    if (!normalizedText) {
      return {
        requestId: context.requestId,
        intent: "unknown",
        status: "unsupported",
        confidence: 0,
        originalText,
        normalizedText,
        entities: [],
        references: [],
        requiresContext: false,
      };
    }

    const [
      recognition,
      ruleEntities,
      references,
    ] = await Promise.all([
      ruleIntentRecognizer.recognize(
        context,
        normalizedText,
      ),

      ruleEntityExtractor.extract(
        context,
        normalizedText,
      ),

      contextReferenceResolver.resolve(
        context,
        normalizedText,
      ),
    ]);

    /*
     * Prefer deterministic entity extraction
     * for requests understood by our rules.
     *
     * Fall back to the model extractor when
     * no rule-based entities were discovered.
     */
    const entities =
      ruleEntities.length > 0
        ? ruleEntities
        : await modelEntityExtractor.extract(
            context,
            normalizedText,
          );

    const hasUnresolvedReferences =
      references.some(
        (reference) =>
          !reference.resolved,
      );

    const requiresContext =
      references.length > 0;

    const status =
      hasUnresolvedReferences ||
      recognition.intent === "unknown"
        ? "ambiguous"
        : "understood";

    return {
      requestId: context.requestId,

      intent: recognition.intent,

      status,

      confidence:
        recognition.confidence,

      originalText,
      normalizedText,

      entities,
      references,

      requiresContext,
    };
  }
}

export const requestUnderstandingEngine =
  new KeiRequestUnderstandingEngine();
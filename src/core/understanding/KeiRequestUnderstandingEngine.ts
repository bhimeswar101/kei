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
  modelIntentRecognizer,
} from "./ModelIntentRecognizer";
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
      entities,
      references,
    ] = await Promise.all([
      modelIntentRecognizer.recognize(
        context,
        normalizedText,
      ),

      modelEntityExtractor.extract(
        context,
        normalizedText,
      ),

      contextReferenceResolver.resolve(
        context,
        normalizedText,
      ),
    ]);

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
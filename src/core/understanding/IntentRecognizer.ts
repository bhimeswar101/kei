import type { IntelligenceContext, IntelligenceIntent } from "@/core/intelligence";

export interface IntentRecognition {
  readonly intent: IntelligenceIntent;
  readonly confidence: number;
}

export interface IntentRecognizerContract {
  recognize(context: IntelligenceContext, normalizedText: string): Promise<IntentRecognition>;
}

export abstract class IntentRecognizer implements IntentRecognizerContract {
  abstract recognize(
    context: IntelligenceContext,
    normalizedText: string,
  ): Promise<IntentRecognition>;
}

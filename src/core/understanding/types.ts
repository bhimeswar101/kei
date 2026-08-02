import type { IntelligenceContext, IntelligenceIntent } from "@/core/intelligence";

export type RequestUnderstandingStatus = "understood" | "ambiguous" | "unsupported";

export interface RequestEntity {
  readonly type: string;
  readonly value: string;

  readonly raw?: string;

  readonly confidence?: number;
}

export interface RequestReference {
  readonly expression: string;

  readonly resolvedValue?: unknown;

  readonly resolved: boolean;
}

export interface RequestUnderstanding {
  readonly requestId: string;

  readonly intent: IntelligenceIntent;

  readonly status: RequestUnderstandingStatus;

  readonly confidence: number;

  readonly originalText: string;

  readonly normalizedText: string;

  readonly entities: readonly RequestEntity[];

  readonly references: readonly RequestReference[];

  readonly requiresContext: boolean;
}

export interface RequestUnderstandingEngineContract {
  understand(context: IntelligenceContext): Promise<RequestUnderstanding>;
}

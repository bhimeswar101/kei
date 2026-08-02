import type { IntelligenceContext, IntelligenceIntent } from "@/core/intelligence";

export type ReasoningDecisionType =
  "respond" | "execute" | "clarify" | "reject" | "defer" | "unknown";

export type ReasoningStatus = "idle" | "reasoning" | "completed" | "error";

export interface ReasoningInput {
  readonly requestId: string;

  readonly intent: IntelligenceIntent;

  readonly understandingStatus: "understood" | "ambiguous" | "unsupported";

  readonly confidence: number;

  readonly originalText: string;

  readonly normalizedText: string;

  readonly entities: readonly unknown[];

  readonly references: readonly unknown[];

  readonly requiresContext: boolean;
}

export interface ReasoningDecision {
  readonly requestId: string;

  readonly type: ReasoningDecisionType;

  readonly intent: IntelligenceIntent;

  readonly requiresAction: boolean;

  readonly requiresPlanning: boolean;

  readonly requiresCapability: boolean;

  readonly requiresClarification: boolean;

  readonly confidence: number;

  readonly reason?: string;
}

export interface ReasoningResult {
  readonly requestId: string;

  readonly decision: ReasoningDecision;
}

export interface ReasoningEngineContract {
  reason(context: IntelligenceContext, input: ReasoningInput): Promise<ReasoningResult>;
}

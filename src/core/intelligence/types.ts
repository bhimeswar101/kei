import type { ContextSnapshot } from "@/core/context";
import type {
  CapabilityResolution,
} from "@/core/capabilities";

export type IntelligenceInputType =
  | "text"
  | "audio"
  | "vision"
  | "system";

export type IntelligenceIntent =
  | "conversation"
  | "question"
  | "action"
  | "automation"
  | "unknown";

export type IntelligenceStatus =
  | "idle"
  | "processing"
  | "waiting-for-tool"
  | "completed"
  | "error";

export interface IntelligenceInput {
  readonly id: string;
  readonly type: IntelligenceInputType;

  readonly text?: string;
  readonly audio?: ArrayBuffer;

  readonly timestamp: Date;
}

export interface IntelligenceContext {
  readonly requestId: string;

  readonly input: IntelligenceInput;

  readonly context: ContextSnapshot;

  readonly metadata?: Readonly<
    Record<string, unknown>
  >;
}

export type IntelligenceDecisionType =
  | "respond"
  | "execute"
  | "clarify"
  | "reject"
  | "defer"
  | "unknown";

export interface IntelligenceDecision {
  readonly type: IntelligenceDecisionType;

  readonly intent: IntelligenceIntent;

  readonly requiresAction: boolean;

  readonly requiresPlanning: boolean;

  readonly requiresCapability: boolean;

  readonly requiresClarification: boolean;

  readonly confidence: number;

  readonly reason?: string;
}

export interface IntelligenceUnderstanding {
  readonly originalText: string;
  readonly normalizedText: string;

  readonly status:
    | "understood"
    | "ambiguous"
    | "unsupported";

  readonly requiresContext: boolean;

  readonly entities: readonly unknown[];
  readonly references: readonly unknown[];
}

export interface IntelligenceResult {
  readonly requestId: string;

  readonly text: string;

  readonly decision: IntelligenceDecision;

  readonly understanding: IntelligenceUnderstanding;

  readonly capability?: CapabilityResolution;
}
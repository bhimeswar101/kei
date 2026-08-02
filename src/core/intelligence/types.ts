import type { ContextSnapshot } from "@/core/context";
export type IntelligenceInputType = "text" | "audio" | "vision" | "system";

export type IntelligenceIntent = "conversation" | "question" | "action" | "automation" | "unknown";

export type IntelligenceStatus = "idle" | "processing" | "waiting-for-tool" | "completed" | "error";

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

  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface IntelligenceDecision {
  readonly intent: IntelligenceIntent;

  readonly requiresAction: boolean;

  readonly confidence?: number;
}

export interface IntelligenceResult {
  readonly requestId: string;

  readonly text: string;

  readonly decision: IntelligenceDecision;
}

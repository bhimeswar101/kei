import type { IntelligenceResult } from "@/core/intelligence";

export type RequestOutcomeType =
  | "responded"
  | "executed"
  | "clarification-required"
  | "rejected"
  | "deferred"
  | "unsupported"
  | "failed";

export interface RequestOutcome {
  readonly requestId: string;

  readonly type: RequestOutcomeType;

  readonly success: boolean;

  readonly message: string;

  readonly intelligence: IntelligenceResult;

  readonly error?: string;
}

import type {
  IntelligenceContext,
} from "@/core/intelligence";

import type {
  ReasoningEngineContract,
  ReasoningInput,
  ReasoningResult,
  ReasoningStatus,
} from "./types";

export abstract class BaseReasoningEngine
  implements ReasoningEngineContract
{
  protected status: ReasoningStatus =
    "idle";

  abstract reason(
    context: IntelligenceContext,
    input: ReasoningInput,
  ): Promise<ReasoningResult>;

  getStatus(): ReasoningStatus {
    return this.status;
  }

  isReasoning(): boolean {
    return this.status === "reasoning";
  }
}
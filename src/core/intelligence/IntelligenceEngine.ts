import type { IntelligenceContext, IntelligenceResult, IntelligenceStatus } from "./types";

export interface IntelligenceEngineContract {
  process(context: IntelligenceContext): Promise<IntelligenceResult>;

  getStatus(): IntelligenceStatus;

  isProcessing(): boolean;
}

export abstract class BaseIntelligenceEngine implements IntelligenceEngineContract {
  protected status: IntelligenceStatus = "idle";

  abstract process(context: IntelligenceContext): Promise<IntelligenceResult>;

  getStatus(): IntelligenceStatus {
    return this.status;
  }

  isProcessing(): boolean {
    return this.status === "processing";
  }
}

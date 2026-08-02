import type { PlanningEngineContract, PlanningInput, PlanningResult } from "./types";

export abstract class BasePlanningEngine implements PlanningEngineContract {
  private processing = false;

  abstract createPlan(input: PlanningInput): Promise<PlanningResult>;

  isProcessing(): boolean {
    return this.processing;
  }

  protected beginPlanning(): void {
    if (this.processing) {
      throw new Error("The planning engine is already processing a request.");
    }

    this.processing = true;
  }

  protected endPlanning(): void {
    this.processing = false;
  }
}

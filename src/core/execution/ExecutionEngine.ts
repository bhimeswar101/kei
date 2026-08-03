import type {
  ExecutionContext,
  ExecutionEngineContract,
  ExecutionResult,
  ExecutionStatus,
} from "./types";

export abstract class BaseExecutionEngine implements ExecutionEngineContract {
  protected status: ExecutionStatus = "idle";

  protected cancellationRequested = false;

  abstract execute(context: ExecutionContext): Promise<ExecutionResult>;

  async cancel(): Promise<void> {
    if (this.status !== "running") {
      return;
    }

    this.cancellationRequested = true;
  }

  getStatus(): ExecutionStatus {
    return this.status;
  }
  reset(): void {
  if (this.isRunning()) {
    throw new Error(
      "Cannot reset the execution engine while it is running.",
    );
  }

  this.resetExecution();
}

  isRunning(): boolean {
    return this.status === "running";
  }

  protected beginExecution(): void {
    if (this.isRunning()) {
      throw new Error("The execution engine is already running.");
    }

    this.cancellationRequested = false;
    this.status = "running";
  }

  protected completeExecution(): void {
    this.status = "completed";
  }

  protected failExecution(): void {
    this.status = "failed";
  }

  protected cancelExecution(): void {
    this.status = "cancelled";
  }

  protected resetExecution(): void {
    this.cancellationRequested = false;
    this.status = "idle";
  }

  protected isCancellationRequested(): boolean {
    return this.cancellationRequested;
  }
}

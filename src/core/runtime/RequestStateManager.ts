export type RequestState = "idle" | "processing" | "completed" | "failed";

export interface RequestStateSnapshot {
  readonly state: RequestState;

  readonly requestId?: string;

  readonly startedAt?: Date;

  readonly completedAt?: Date;

  readonly error?: string;
}

export class RequestStateManager {
  private snapshot: RequestStateSnapshot = {
    state: "idle",
  };

  begin(requestId: string): void {
    if (this.isProcessing()) {
      throw new Error(`Request "${this.snapshot.requestId}" is already processing.`);
    }

    this.snapshot = {
      state: "processing",

      requestId,

      startedAt: new Date(),
    };
  }

  complete(requestId: string): void {
    this.assertActiveRequest(requestId);

    this.snapshot = {
      ...this.snapshot,

      state: "completed",

      completedAt: new Date(),

      error: undefined,
    };
  }

  fail(requestId: string, error: unknown): void {
    this.assertActiveRequest(requestId);

    this.snapshot = {
      ...this.snapshot,

      state: "failed",

      completedAt: new Date(),

      error: this.resolveErrorMessage(error),
    };
  }

  reset(): void {
    this.snapshot = {
      state: "idle",
    };
  }

  getSnapshot(): RequestStateSnapshot {
    return {
      ...this.snapshot,
    };
  }

  getState(): RequestState {
    return this.snapshot.state;
  }

  getActiveRequestId(): string | undefined {
    return this.isProcessing() ? this.snapshot.requestId : undefined;
  }

  isProcessing(): boolean {
    return this.snapshot.state === "processing";
  }

  private assertActiveRequest(requestId: string): void {
    if (!this.isProcessing() || this.snapshot.requestId !== requestId) {
      throw new Error(`Request "${requestId}" is not the active request.`);
    }
  }

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === "string") {
      return error;
    }

    return "Unknown request error.";
  }
}

export const requestStateManager = new RequestStateManager();

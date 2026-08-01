import type {
  BackgroundService,
  BackgroundServiceState,
} from "./types";

export abstract class BaseBackgroundService
  implements BackgroundService
{
  abstract readonly id: string;
  abstract readonly name: string;

  private currentState: BackgroundServiceState =
    "idle";

  getState(): BackgroundServiceState {
    return this.currentState;
  }

  isRunning(): boolean {
    return this.currentState === "running";
  }

  async start(): Promise<void> {
    if (
      this.currentState === "running" ||
      this.currentState === "starting"
    ) {
      return;
    }

    this.currentState = "starting";

    try {
      await this.onStart();

      this.currentState = "running";
    } catch (error) {
      this.currentState = "error";

      throw error;
    }
  }

  async stop(): Promise<void> {
    if (
      this.currentState === "idle" ||
      this.currentState === "stopped" ||
      this.currentState === "stopping"
    ) {
      return;
    }

    this.currentState = "stopping";

    try {
      await this.onStop();

      this.currentState = "stopped";
    } catch (error) {
      this.currentState = "error";

      throw error;
    }
  }

  protected abstract onStart(): Promise<void>;

  protected abstract onStop(): Promise<void>;
}
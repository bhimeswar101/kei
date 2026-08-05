import { appKernel } from "@/core/kernel";

import type { LifecycleContract, LifecycleState } from "./types";

export class LifecycleManager implements LifecycleContract {
  private currentState: LifecycleState = "idle";

  state(): LifecycleState {
    return this.currentState;
  }

  isRunning(): boolean {
    return this.currentState === "running";
  }

  async start(): Promise<void> {
    if (this.currentState === "running" || this.currentState === "starting") {
      return;
    }

    this.currentState = "starting";

    try {
      await appKernel.start();

      this.currentState = "running";
    } catch (error) {
      this.currentState = "idle";

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
      await appKernel.stop();

      this.currentState = "stopped";
    } catch (error) {
      this.currentState = "running";

      throw error;
    }
  }

  async restart(): Promise<void> {
    await this.stop();

    await this.start();
  }
}

export const lifecycle = new LifecycleManager();

import type { LifecycleContract, LifecycleState } from "./types";

import { appKernel } from "@/core/kernel";

export class LifecycleManager implements LifecycleContract {
  private currentState: LifecycleState = "idle";

  state(): LifecycleState {
    return this.currentState;
  }

  isRunning(): boolean {
    return this.currentState === "running";
  }

  async start(): Promise<void> {
    if (this.currentState === "running") {
      return;
    }

    this.currentState = "starting";

    await appKernel.start();

    this.currentState = "running";
  }

  async stop(): Promise<void> {
    if (this.currentState !== "running") {
      return;
    }

    this.currentState = "stopping";

    await appKernel.stop();

    this.currentState = "stopped";
  }

  async restart(): Promise<void> {
    await this.stop();
    await this.start();
  }
}

export const lifecycle = new LifecycleManager();

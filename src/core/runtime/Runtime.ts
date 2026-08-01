import { lifecycle } from "@/core/lifecycle";

import type {
  RuntimeContract,
  RuntimeState,
} from "./types";

export class Runtime implements RuntimeContract {
  private currentState: RuntimeState = "idle";

  getState(): RuntimeState {
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
      console.info("🚀 Starting Kei Runtime...");

      await lifecycle.start();

      this.currentState = "running";

      console.info("✅ Kei Runtime Running");
    } catch (error) {
      this.currentState = "error";

      console.error(
        "❌ Failed to start Kei Runtime:",
        error,
      );

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
      console.info("🛑 Stopping Kei Runtime...");

      await lifecycle.stop();

      this.currentState = "stopped";

      console.info("✅ Kei Runtime Stopped");
    } catch (error) {
      this.currentState = "error";

      console.error(
        "❌ Failed to stop Kei Runtime:",
        error,
      );

      throw error;
    }
  }

  async restart(): Promise<void> {
    await this.stop();
    await this.start();
  }
}

export const runtime = new Runtime();

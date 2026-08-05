import { validateEnvironment } from "@/core/config";

import { ErrorCodes, handleError } from "@/core/errors";

import { lifecycle } from "@/core/lifecycle";

import type { RuntimeContract, RuntimeState } from "./types";

export class Runtime implements RuntimeContract {
  private currentState: RuntimeState = "idle";

  getState(): RuntimeState {
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
      console.info("[Runtime] Starting Kei Runtime...");

      validateEnvironment();

      console.info("[Runtime] Configuration valid.");

      await lifecycle.start();

      this.currentState = "running";

      console.info("[Runtime] Kei Runtime running.");
    } catch (error) {
      this.currentState = "error";

      const appError = handleError(error, {
        code: ErrorCodes.RUNTIME,

        context: {
          operation: "start",
        },
      });

      throw appError;
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
      console.info("[Runtime] Stopping Kei Runtime...");

      await lifecycle.stop();

      this.currentState = "stopped";

      console.info("[Runtime] Kei Runtime stopped.");
    } catch (error) {
      this.currentState = "error";

      const appError = handleError(error, {
        code: ErrorCodes.RUNTIME,

        context: {
          operation: "stop",
        },
      });

      throw appError;
    }
  }

  async restart(): Promise<void> {
    await this.stop();

    await this.start();
  }
}

export const runtime = new Runtime();

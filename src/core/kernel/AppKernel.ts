// src/core/kernel/AppKernel.ts

import type { AppKernelContract, KernelState } from "./types";

import { aiProviderManager, GeminiProvider } from "@/core/ai";
import { brain } from "@/core/brain";
import { ErrorCodes, handleError } from "@/core/errors";
import { eventBus } from "@/core/events";
import { permissionManager } from "@/core/permissions";
import { serviceRegistry } from "@/core/services";
import { storage } from "@/core/storage";

export class AppKernel implements AppKernelContract {
  private state: KernelState = "idle";

  async start(): Promise<void> {
    if (this.state === "running" || this.state === "starting") {
      return;
    }

    this.state = "starting";

    try {
      console.info("🚀 Starting Kei Kernel...");

      // Core infrastructure
      void eventBus;
      void storage;
      void permissionManager;
      void serviceRegistry;

      console.info("✓ Event Bus Ready");
      console.info("✓ Storage Ready");
      console.info("✓ Permission Manager Ready");
      console.info("✓ Service Registry Ready");

      // AI provider
      const geminiProvider = new GeminiProvider();

      aiProviderManager.register(geminiProvider);

      aiProviderManager.setActive(geminiProvider.id);

      console.info("✓ Gemini Provider Registered");

      // Intelligence layer
      await brain.initialize();

      console.info("✓ Brain Ready");

      this.state = "running";

      console.info("✅ Kei Kernel Running");
    } catch (error) {
      this.state = "idle";

      const appError = handleError(error, {
        code: ErrorCodes.KERNEL,
        context: {
          operation: "start",
        },
      });

      throw appError;
    }
  }

  async stop(): Promise<void> {
    if (this.state !== "running") {
      return;
    }

    this.state = "stopping";

    try {
      console.info("🛑 Stopping Kei Kernel...");

      await brain.shutdown();

      console.info("✓ Brain Stopped");

      this.state = "stopped";

      console.info("✓ Kei Kernel Stopped");
    } catch (error) {
      this.state = "running";

      const appError = handleError(error, {
        code: ErrorCodes.KERNEL,
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

  getState(): KernelState {
    return this.state;
  }

  isRunning(): boolean {
    return this.state === "running";
  }
}

export const appKernel = new AppKernel();

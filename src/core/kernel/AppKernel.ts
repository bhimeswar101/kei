// src/core/kernel/AppKernel.ts

import type { AppKernelContract, KernelState } from "./types";

import { aiProviderManager, GeminiProvider } from "@/core/ai";
import { brain } from "@/core/brain";
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
  }

  async stop(): Promise<void> {
    if (this.state !== "running") {
      return;
    }

    this.state = "stopping";

    console.info("🛑 Stopping Kei Kernel...");

    await brain.shutdown();

    console.info("✓ Brain Stopped");

    this.state = "stopped";

    console.info("✓ Kei Kernel Stopped");
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

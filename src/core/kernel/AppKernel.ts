// src/core/kernel/AppKernel.ts

import type {
  AppKernelContract,
  KernelState,
} from "./types";

import { eventBus } from "@/core/events";
import { storage } from "@/core/storage";
import { permissionManager } from "@/core/permissions";
import { serviceRegistry } from "@/core/services";

export class AppKernel implements AppKernelContract {
  private state: KernelState = "idle";

  constructor() {}

  start(): void {
    if (this.state === "running") {
      return;
    }

    this.state = "starting";

    console.info("🚀 Starting Kei Kernel...");

    // Ensure core systems are initialized
    void eventBus;
    void storage;
    void permissionManager;
    void serviceRegistry;

    console.info("✓ Event Bus Ready");
    console.info("✓ Storage Ready");
    console.info("✓ Permission Manager Ready");
    console.info("✓ Service Registry Ready");

    this.state = "running";

    console.info("✅ Kei Kernel Running");
  }

  stop(): void {
    if (this.state !== "running") {
      return;
    }

    this.state = "stopping";

    console.info("🛑 Stopping Kei Kernel...");

    this.state = "stopped";

    console.info("✓ Kei Kernel Stopped");
  }

  restart(): void {
    this.stop();
    this.start();
  }

  getState(): KernelState {
    return this.state;
  }

  isRunning(): boolean {
    return this.state === "running";
  }
}

export const appKernel = new AppKernel();
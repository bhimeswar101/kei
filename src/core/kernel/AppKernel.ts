// src/core/kernel/AppKernel.ts

import { aiProviderManager, GeminiProvider } from "@/core/ai";

import { backgroundServiceManager } from "@/core/background";

import { brain } from "@/core/brain";

import { registerBuiltinCapabilities } from "@/core/capabilities";

import { applicationOpenHandler, capabilityHandlerRegistry } from "@/core/execution";

import { ErrorCodes, handleError } from "@/core/errors";

import { eventBus } from "@/core/events";

import { permissionManager } from "@/core/permissions";

import {
  platformApplicationAdapterManager,
  platformDetector,
  TransportNativeHostBridge,
  WindowsApplicationAdapter,
} from "@/core/platform";

import { serviceRegistry } from "@/core/services";

import { storage } from "@/core/storage";

import { desktopNativeHostTransport } from "@/integrations/native";

import type { AppKernelContract, KernelState } from "./types";

export class AppKernel implements AppKernelContract {
  private state: KernelState = "idle";

  async start(): Promise<void> {
    if (this.state === "running" || this.state === "starting") {
      return;
    }

    this.state = "starting";

    try {
      console.info("[Kernel] Starting Kei Kernel...");

      // --------------------------------------------------
      // Core infrastructure
      // --------------------------------------------------

      void eventBus;
      void storage;
      void permissionManager;
      void serviceRegistry;

      console.info("[Kernel] Event Bus ready.");

      console.info("[Kernel] Storage ready.");

      console.info("[Kernel] Permission Manager ready.");

      console.info("[Kernel] Service Registry ready.");

      // --------------------------------------------------
      // Capability awareness
      // --------------------------------------------------

      registerBuiltinCapabilities();

      console.info("[Kernel] Built-in Capabilities registered.");

      // --------------------------------------------------
      // Platform layer
      // --------------------------------------------------

      const detectedPlatform = platformDetector.detect();

      console.info("[Kernel] Detected platform:", detectedPlatform);

      if (detectedPlatform === "windows") {
        const nativeHostBridge = new TransportNativeHostBridge(desktopNativeHostTransport);

        const windowsApplicationAdapter = new WindowsApplicationAdapter(nativeHostBridge);

        if (!platformApplicationAdapterManager.has("windows")) {
          platformApplicationAdapterManager.register(windowsApplicationAdapter);
        }

        platformApplicationAdapterManager.setActive("windows");

        console.info("[Kernel] Windows Application Adapter registered.");

        console.info(
          "[Kernel] Active Platform Application Adapter:",
          platformApplicationAdapterManager.getActive().platform,
        );

        console.info("[Kernel] Desktop Native Host available:", nativeHostBridge.isAvailable());
      }

      // --------------------------------------------------
      // Execution handlers
      // --------------------------------------------------

      if (!capabilityHandlerRegistry.has(applicationOpenHandler.capabilityId)) {
        capabilityHandlerRegistry.register(applicationOpenHandler);
      }

      console.info("[Kernel] Execution Handlers registered.");

      // --------------------------------------------------
      // AI provider
      // --------------------------------------------------

      const geminiProvider = new GeminiProvider();

      aiProviderManager.register(geminiProvider);

      aiProviderManager.setActive(geminiProvider.id);

      console.info("[Kernel] Gemini Provider registered.");

      // --------------------------------------------------
      // Intelligence layer
      // --------------------------------------------------

      await brain.initialize();

      console.info("[Kernel] Brain ready.");

      // --------------------------------------------------
      // Background services
      // --------------------------------------------------

      await backgroundServiceManager.startAll();

      console.info("[Kernel] Background Services ready.");

      // --------------------------------------------------
      // Kernel ready
      // --------------------------------------------------

      this.state = "running";

      console.info("[Kernel] Kei Kernel running.");
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
      console.info("[Kernel] Stopping Kei Kernel...");

      // --------------------------------------------------
      // Background services
      // --------------------------------------------------

      await backgroundServiceManager.stopAll();

      console.info("[Kernel] Background Services stopped.");

      // --------------------------------------------------
      // Intelligence layer
      // --------------------------------------------------

      await brain.shutdown();

      console.info("[Kernel] Brain stopped.");

      // --------------------------------------------------
      // Platform layer cleanup
      // --------------------------------------------------

      platformApplicationAdapterManager.clear();

      console.info("[Kernel] Platform Application Adapters cleared.");

      // --------------------------------------------------
      // Kernel stopped
      // --------------------------------------------------

      this.state = "stopped";

      console.info("[Kernel] Kei Kernel stopped.");
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

// src/core/kernel/AppKernel.ts

import {
  aiProviderManager,
  GeminiProvider,
} from "@/core/ai";

import {
  backgroundServiceManager,
} from "@/core/background";

import { brain } from "@/core/brain";

import {
  registerBuiltinCapabilities,
} from "@/core/capabilities";

import {
  applicationOpenHandler,
  capabilityHandlerRegistry,
} from "@/core/execution";

import {
  ErrorCodes,
  handleError,
} from "@/core/errors";

import { eventBus } from "@/core/events";

import {
  permissionManager,
} from "@/core/permissions";

import {
  platformApplicationAdapterManager,
  platformDetector,
  TransportNativeHostBridge,
  WindowsApplicationAdapter,
} from "@/core/platform";

import {
  serviceRegistry,
} from "@/core/services";

import { storage } from "@/core/storage";

import {
  desktopNativeHostTransport,
} from "@/integrations/native";

import type {
  AppKernelContract,
  KernelState,
} from "./types";

export class AppKernel
  implements AppKernelContract
{
  private state: KernelState = "idle";

  async start(): Promise<void> {
    if (
      this.state === "running" ||
      this.state === "starting"
    ) {
      return;
    }

    this.state = "starting";

    try {
      console.info(
        "🚀 Starting Kei Kernel...",
      );

      // --------------------------------------------------
      // Core infrastructure
      // --------------------------------------------------

      void eventBus;
      void storage;
      void permissionManager;
      void serviceRegistry;

      console.info(
        "✓ Event Bus Ready",
      );

      console.info(
        "✓ Storage Ready",
      );

      console.info(
        "✓ Permission Manager Ready",
      );

      console.info(
        "✓ Service Registry Ready",
      );

      // --------------------------------------------------
      // Capability awareness
      // --------------------------------------------------

      registerBuiltinCapabilities();

      console.info(
        "✓ Built-in Capabilities Registered",
      );

      // --------------------------------------------------
      // Platform layer
      // --------------------------------------------------

      const detectedPlatform =
        platformDetector.detect();

      console.info(
        "✓ Detected Platform:",
        detectedPlatform,
      );

      if (detectedPlatform === "windows") {
        const nativeHostBridge =
          new TransportNativeHostBridge(
            desktopNativeHostTransport,
          );

        const windowsApplicationAdapter =
          new WindowsApplicationAdapter(
            nativeHostBridge,
          );

        if (
          !platformApplicationAdapterManager.has(
            "windows",
          )
        ) {
          platformApplicationAdapterManager.register(
            windowsApplicationAdapter,
          );
        }

        platformApplicationAdapterManager.setActive(
          "windows",
        );

        console.info(
          "✓ Windows Application Adapter Registered",
        );

        console.info(
          "✓ Active Platform Application Adapter:",
          platformApplicationAdapterManager
            .getActive()
            .platform,
        );

        console.info(
          "✓ Desktop Native Host Available:",
          nativeHostBridge.isAvailable(),
        );
      }

      // --------------------------------------------------
      // Execution handlers
      // --------------------------------------------------

      if (
        !capabilityHandlerRegistry.has(
          applicationOpenHandler.capabilityId,
        )
      ) {
        capabilityHandlerRegistry.register(
          applicationOpenHandler,
        );
      }

      console.info(
        "✓ Execution Handlers Registered",
      );

      // --------------------------------------------------
      // AI provider
      // --------------------------------------------------

      const geminiProvider =
        new GeminiProvider();

      aiProviderManager.register(
        geminiProvider,
      );

      aiProviderManager.setActive(
        geminiProvider.id,
      );

      console.info(
        "✓ Gemini Provider Registered",
      );

      // --------------------------------------------------
      // Intelligence layer
      // --------------------------------------------------

      await brain.initialize();

      console.info(
        "✓ Brain Ready",
      );

      // --------------------------------------------------
      // Background services
      // --------------------------------------------------

      await backgroundServiceManager.startAll();

      console.info(
        "✓ Background Services Ready",
      );

      // --------------------------------------------------
      // Kernel ready
      // --------------------------------------------------

      this.state = "running";

      console.info(
        "✅ Kei Kernel Running",
      );
    } catch (error) {
      this.state = "idle";

      const appError =
        handleError(
          error,
          {
            code: ErrorCodes.KERNEL,

            context: {
              operation: "start",
            },
          },
        );

      throw appError;
    }
  }

  async stop(): Promise<void> {
    if (this.state !== "running") {
      return;
    }

    this.state = "stopping";

    try {
      console.info(
        "🛑 Stopping Kei Kernel...",
      );

      // --------------------------------------------------
      // Background services
      // --------------------------------------------------

      await backgroundServiceManager.stopAll();

      console.info(
        "✓ Background Services Stopped",
      );

      // --------------------------------------------------
      // Intelligence layer
      // --------------------------------------------------

      await brain.shutdown();

      console.info(
        "✓ Brain Stopped",
      );

      // --------------------------------------------------
      // Platform layer cleanup
      // --------------------------------------------------

      platformApplicationAdapterManager.clear();

      console.info(
        "✓ Platform Application Adapters Cleared",
      );

      // --------------------------------------------------
      // Kernel stopped
      // --------------------------------------------------

      this.state = "stopped";

      console.info(
        "✓ Kei Kernel Stopped",
      );
    } catch (error) {
      this.state = "running";

      const appError =
        handleError(
          error,
          {
            code: ErrorCodes.KERNEL,

            context: {
              operation: "stop",
            },
          },
        );

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

export const appKernel =
  new AppKernel();
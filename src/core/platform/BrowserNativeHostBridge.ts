import {
  NativeHostBridge,
} from "./NativeHostBridge";

import {
  platformDetector,
} from "./PlatformDetector";

import type {
  ApplicationLaunchResult,
  PlatformType,
} from "./types";

export class BrowserNativeHostBridge
  extends NativeHostBridge
{
  isAvailable(): boolean {
    return false;
  }

  getPlatform(): PlatformType {
    return platformDetector.detect();
  }

  async openApplication(
    target: string,
  ): Promise<ApplicationLaunchResult> {
    return {
      success: false,

      target,

      error:
        "Native application launching is not available in the browser runtime.",
    };
  }
}

export const browserNativeHostBridge =
  new BrowserNativeHostBridge();
  
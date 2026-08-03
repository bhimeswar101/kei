import {
  PlatformApplicationAdapter,
} from "./PlatformApplicationAdapter";

import type {
  NativeHostBridgeContract,
} from "./NativeHostBridge";

import type {
  ApplicationLaunchResult,
  PlatformType,
} from "./types";

export class WindowsApplicationAdapter
  extends PlatformApplicationAdapter
{
  readonly platform: PlatformType =
    "windows";

  private readonly nativeHost:
    NativeHostBridgeContract;

  constructor(
    nativeHost: NativeHostBridgeContract,
  ) {
    super();

    this.nativeHost = nativeHost;
  }

  protected async launchApplication(
    target: string,
  ): Promise<ApplicationLaunchResult> {
    if (!this.nativeHost.isAvailable()) {
      return {
        success: false,
        target,
        error:
          "Native application launching is unavailable.",
      };
    }

    if (
      this.nativeHost.getPlatform() !==
      "windows"
    ) {
      return {
        success: false,
        target,
        error:
          "The active native host is not running on Windows.",
      };
    }

    return this.nativeHost.openApplication(
      target,
    );
  }
}
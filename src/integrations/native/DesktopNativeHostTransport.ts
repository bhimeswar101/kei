import { invoke } from "@tauri-apps/api/core";

import type {
  ApplicationLaunchResult,
  NativeHostTransportContract,
  PlatformType,
} from "@/core/platform";

export class DesktopNativeHostTransport
  implements NativeHostTransportContract
{
  isAvailable(): boolean {
    return (
      typeof window !== "undefined" &&
      "__TAURI_INTERNALS__" in window
    );
  }

  getPlatform(): PlatformType {
    return "windows";
  }

  async openApplication(
    target: string,
  ): Promise<ApplicationLaunchResult> {
    if (!this.isAvailable()) {
      return {
        success: false,
        target,
        error:
          "Tauri desktop native host is unavailable.",
      };
    }

    try {
      await invoke<void>(
        "open_application",
        {
          target,
        },
      );

      return {
        success: true,
        target,
      };
    } catch (error) {
      return {
        success: false,
        target,
        error:
          error instanceof Error
            ? error.message
            : typeof error === "string"
              ? error
              : "Failed to launch application.",
      };
    }
  }
}

export const desktopNativeHostTransport =
  new DesktopNativeHostTransport();
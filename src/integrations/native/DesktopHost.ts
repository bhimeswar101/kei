import type {
  ApplicationLaunchResult,
  PlatformType,
} from "@/core/platform";

import type {
  DesktopHostApiContract,
} from "./DesktopHostApi";

import type {
  WindowsApplicationLauncherContract,
} from "./windows";

import {
  windowsApplicationTargetResolver,
} from "./windows";

export class DesktopHost
  implements DesktopHostApiContract
{
  readonly platform: PlatformType;

  private readonly applicationLauncher:
    WindowsApplicationLauncherContract;

  constructor(
    platform: PlatformType,
    applicationLauncher:
      WindowsApplicationLauncherContract,
  ) {
    this.platform = platform;
    this.applicationLauncher =
      applicationLauncher;
  }

  async openApplication(
    target: string,
  ): Promise<ApplicationLaunchResult> {
    if (this.platform !== "windows") {
      return {
        success: false,
        target,
        error:
          `Application launching is not supported for platform "${this.platform}".`,
      };
    }

    const resolvedTarget =
      windowsApplicationTargetResolver.resolve(
        target,
      );

    if (!resolvedTarget) {
      return {
        success: false,
        target,
        error:
          `Application "${target}" is not an approved Windows application target.`,
      };
    }

    return this.applicationLauncher.launch(
      resolvedTarget,
    );
  }
}
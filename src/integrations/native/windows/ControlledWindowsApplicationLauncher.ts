import type {
  ApplicationLaunchResult,
} from "@/core/platform";

import {
  WindowsApplicationLauncher,
} from "./WindowsApplicationLauncher";

import type {
  WindowsApplicationTarget,
} from "./WindowsApplicationTargetResolver";

export type WindowsLaunchExecutor = (
  launchTarget: string,
) => Promise<void>;

export class ControlledWindowsApplicationLauncher
  extends WindowsApplicationLauncher
{
  private readonly executor:
    WindowsLaunchExecutor;

  constructor(
    executor: WindowsLaunchExecutor,
  ) {
    super();

    this.executor = executor;
  }

  async launch(
    target: WindowsApplicationTarget,
  ): Promise<ApplicationLaunchResult> {
    try {
      await this.executor(
        target.launchTarget,
      );

      return {
        success: true,
        target: target.displayName,
      };
    } catch (error) {
      return {
        success: false,
        target: target.displayName,
        error:
          error instanceof Error
            ? error.message
            : "Windows application launch failed.",
      };
    }
  }
}
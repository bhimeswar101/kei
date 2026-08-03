import type { ApplicationLaunchResult } from "@/core/platform";

import type { WindowsApplicationTarget } from "./WindowsApplicationTargetResolver";

export interface WindowsApplicationLauncherContract {
  launch(target: WindowsApplicationTarget): Promise<ApplicationLaunchResult>;
}

export abstract class WindowsApplicationLauncher implements WindowsApplicationLauncherContract {
  abstract launch(target: WindowsApplicationTarget): Promise<ApplicationLaunchResult>;
}

import type { ApplicationLaunchResult, PlatformType } from "./types";

export interface NativeHostTransportContract {
  isAvailable(): boolean;

  getPlatform(): PlatformType;

  openApplication(target: string): Promise<ApplicationLaunchResult>;
}

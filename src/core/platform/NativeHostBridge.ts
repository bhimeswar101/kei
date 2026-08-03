import type { ApplicationLaunchResult, PlatformType } from "./types";

export interface NativeHostBridgeContract {
  isAvailable(): boolean;

  getPlatform(): PlatformType;

  openApplication(target: string): Promise<ApplicationLaunchResult>;
}

export abstract class NativeHostBridge implements NativeHostBridgeContract {
  abstract isAvailable(): boolean;

  abstract getPlatform(): PlatformType;

  abstract openApplication(target: string): Promise<ApplicationLaunchResult>;
}

import type {
  ApplicationLaunchResult,
  PlatformType,
} from "@/core/platform";

export interface DesktopHostApiContract {
  readonly platform: PlatformType;

  openApplication(
    target: string,
  ): Promise<ApplicationLaunchResult>;
}
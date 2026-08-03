export type PlatformType = "windows" | "macos" | "linux" | "unknown";

export interface ApplicationLaunchRequest {
  readonly target: string;
}

export interface ApplicationLaunchResult {
  readonly success: boolean;

  readonly target: string;

  readonly error?: string;
}

export interface PlatformApplicationAdapterContract {
  readonly platform: PlatformType;

  openApplication(request: ApplicationLaunchRequest): Promise<ApplicationLaunchResult>;
}

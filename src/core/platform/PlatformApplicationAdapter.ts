import type {
  ApplicationLaunchRequest,
  ApplicationLaunchResult,
  PlatformApplicationAdapterContract,
  PlatformType,
} from "./types";

export abstract class PlatformApplicationAdapter
  implements PlatformApplicationAdapterContract
{
  abstract readonly platform: PlatformType;

  async openApplication(
    request: ApplicationLaunchRequest,
  ): Promise<ApplicationLaunchResult> {
    const target = request.target.trim();

    if (!target) {
      return {
        success: false,
        target,
        error:
          "Application target cannot be empty.",
      };
    }

    try {
      return await this.launchApplication(
        target,
      );
    } catch (error) {
      return {
        success: false,
        target,
        error:
          error instanceof Error
            ? error.message
            : "Application launch failed.",
      };
    }
  }

  protected abstract launchApplication(
    target: string,
  ): Promise<ApplicationLaunchResult>;
}

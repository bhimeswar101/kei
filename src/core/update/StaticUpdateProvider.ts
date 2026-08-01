import type { UpdateInfo } from "./types";
import type { UpdateProvider } from "./UpdateProvider";
import { isNewerVersion } from "./version";

export class StaticUpdateProvider
  implements UpdateProvider
{
  readonly id = "static";

  private readonly latestVersion: string;

  constructor(latestVersion: string) {
    this.latestVersion = latestVersion;
  }

  async check(
    currentVersion: string,
  ): Promise<UpdateInfo> {
    const available = isNewerVersion(
      currentVersion,
      this.latestVersion,
    );

    return {
      currentVersion,
      latestVersion: this.latestVersion,
      available,
    };
  }
}
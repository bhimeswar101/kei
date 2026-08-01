import {
  ErrorCodes,
  handleError,
} from "@/core/errors";

import type {
  UpdateInfo,
  UpdateManagerContract,
  UpdateState,
} from "./types";
import type { UpdateProvider } from "./UpdateProvider";

export class UpdateManager
  implements UpdateManagerContract
{
  private state: UpdateState = "idle";

  private updateInfo: UpdateInfo | null = null;

  private readonly currentVersion: string;

  private readonly provider: UpdateProvider;

  constructor(
    currentVersion: string,
    provider: UpdateProvider,
  ) {
    this.currentVersion = currentVersion;
    this.provider = provider;
  }

  getState(): UpdateState {
    return this.state;
  }

  getCurrentVersion(): string {
    return this.currentVersion;
  }

  getUpdateInfo(): UpdateInfo | null {
    return this.updateInfo;
  }

  async checkForUpdates(): Promise<UpdateInfo> {
    if (this.state === "checking") {
      throw new Error(
        "An update check is already in progress.",
      );
    }

    this.state = "checking";

    try {
      const info = await this.provider.check(
        this.currentVersion,
      );

      this.updateInfo = info;

      this.state = info.available
        ? "available"
        : "up-to-date";

      return info;
    } catch (error) {
      this.state = "error";

      const appError = handleError(error, {
        code: ErrorCodes.UPDATE,
        context: {
          operation: "checkForUpdates",
          providerId: this.provider.id,
          currentVersion: this.currentVersion,
        },
      });

      throw appError;
    }
  }
}
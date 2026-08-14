import {
  PlatformApplicationAdapter,
} from "./PlatformApplicationAdapter";

import type {
  NativeHostBridgeContract,
} from "./NativeHostBridge";

import type {
  ApplicationLaunchResult,
  ApplicationCloseResult,
  BrowserOpenResult,
  BrowserSearchResult,
  MediaControlResult,
  FileSearchResult,
  FileReadResult,
  AutomationCreateResult,
  PlatformType,
} from "./types";

export class WindowsApplicationAdapter
  extends PlatformApplicationAdapter
{
  readonly platform: PlatformType =
    "windows";

  private readonly nativeHost:
    NativeHostBridgeContract;

  constructor(
    nativeHost: NativeHostBridgeContract,
  ) {
    super();

    this.nativeHost = nativeHost;
  }

  protected async launchApplication(
    target: string,
  ): Promise<ApplicationLaunchResult> {
    if (!this.nativeHost.isAvailable()) {
      return {
        success: false,
        target,
        error:
          "Native application launching is unavailable.",
      };
    }

    if (
      this.nativeHost.getPlatform() !==
      "windows"
    ) {
      return {
        success: false,
        target,
        error:
          "The active native host is not running on Windows.",
      };
    }

    return this.nativeHost.openApplication(
      target,
    );
  }

  protected async terminateApplication(
    target: string,
  ): Promise<ApplicationCloseResult> {
    if (!this.nativeHost.isAvailable()) {
      return {
        success: false,
        target,
        error:
          "Native application close is unavailable.",
      };
    }

    if (
      this.nativeHost.getPlatform() !==
      "windows"
    ) {
      return {
        success: false,
        target,
        error:
          "The active native host is not running on Windows.",
      };
    }

    return this.nativeHost.closeApplication(
      target,
    );
  }

  protected async launchBrowser(
    url: string,
  ): Promise<BrowserOpenResult> {
    if (!this.nativeHost.isAvailable()) {
      return {
        success: false,
        url,
        error:
          "Native browser opening is unavailable.",
      };
    }

    return this.nativeHost.openBrowser(url);
  }

  protected async launchSearch(
    query: string,
  ): Promise<BrowserSearchResult> {
    if (!this.nativeHost.isAvailable()) {
      return {
        success: false,
        query,
        error:
          "Native browser search is unavailable.",
      };
    }

    return this.nativeHost.searchBrowser(query);
  }

  protected async triggerMedia(
    action: "play" | "pause",
  ): Promise<MediaControlResult> {
    if (!this.nativeHost.isAvailable()) {
      return {
        success: false,
        action,
        error:
          "Native media control is unavailable.",
      };
    }

    return this.nativeHost.controlMedia(action);
  }

  protected async findFiles(
    query: string,
  ): Promise<FileSearchResult> {
    if (!this.nativeHost.isAvailable()) {
      return {
        success: false,
        query,
        files: [],
        error:
          "Native file search is unavailable.",
      };
    }

    return this.nativeHost.searchFiles(query);
  }

  protected async readContent(
    path: string,
  ): Promise<FileReadResult> {
    if (!this.nativeHost.isAvailable()) {
      return {
        success: false,
        path,
        error:
          "Native file read is unavailable.",
      };
    }

    return this.nativeHost.readFile(path);
  }

  protected async registerAutomation(
    trigger: string,
    action: string,
  ): Promise<AutomationCreateResult> {
    if (!this.nativeHost.isAvailable()) {
      return {
        success: false,
        trigger,
        action,
        error:
          "Native automation creation is unavailable.",
      };
    }

    return this.nativeHost.createAutomation(
      trigger,
      action,
    );
  }
}
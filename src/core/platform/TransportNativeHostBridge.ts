import type {
  NativeHostBridgeContract,
} from "./NativeHostBridge";

import type {
  NativeHostTransportContract,
} from "./NativeHostTransport";

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

export class TransportNativeHostBridge
  implements NativeHostBridgeContract
{
  private readonly transport:
    NativeHostTransportContract;

  constructor(
    transport: NativeHostTransportContract,
  ) {
    this.transport = transport;
  }

  isAvailable(): boolean {
    return this.transport.isAvailable();
  }

  getPlatform(): PlatformType {
    return this.transport.getPlatform();
  }

  async openApplication(
    target: string,
  ): Promise<ApplicationLaunchResult> {
    if (!this.transport.isAvailable()) {
      return {
        success: false,
        target,
        error:
          "Native host transport is unavailable.",
      };
    }

    return this.transport.openApplication(
      target,
    );
  }

  async closeApplication(
    target: string,
  ): Promise<ApplicationCloseResult> {
    if (!this.transport.isAvailable()) {
      return {
        success: false,
        target,
        error:
          "Native host transport is unavailable.",
      };
    }

    return this.transport.closeApplication(
      target,
    );
  }

  async openBrowser(
    url: string,
  ): Promise<BrowserOpenResult> {
    if (!this.transport.isAvailable()) {
      return {
        success: false,
        url,
        error:
          "Native host transport is unavailable.",
      };
    }

    return this.transport.openBrowser(url);
  }

  async searchBrowser(
    query: string,
  ): Promise<BrowserSearchResult> {
    if (!this.transport.isAvailable()) {
      return {
        success: false,
        query,
        error:
          "Native host transport is unavailable.",
      };
    }

    return this.transport.searchBrowser(query);
  }

  async controlMedia(
    action: "play" | "pause",
  ): Promise<MediaControlResult> {
    if (!this.transport.isAvailable()) {
      return {
        success: false,
        action,
        error:
          "Native host transport is unavailable.",
      };
    }

    return this.transport.controlMedia(action);
  }

  async searchFiles(
    query: string,
  ): Promise<FileSearchResult> {
    if (!this.transport.isAvailable()) {
      return {
        success: false,
        query,
        files: [],
        error:
          "Native host transport is unavailable.",
      };
    }

    return this.transport.searchFiles(query);
  }

  async readFile(
    path: string,
  ): Promise<FileReadResult> {
    if (!this.transport.isAvailable()) {
      return {
        success: false,
        path,
        error:
          "Native host transport is unavailable.",
      };
    }

    return this.transport.readFile(path);
  }

  async createAutomation(
    trigger: string,
    action: string,
  ): Promise<AutomationCreateResult> {
    if (!this.transport.isAvailable()) {
      return {
        success: false,
        trigger,
        action,
        error:
          "Native host transport is unavailable.",
      };
    }

    return this.transport.createAutomation(
      trigger,
      action,
    );
  }
}

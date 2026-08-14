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

export interface NativeHostBridgeContract {
  isAvailable(): boolean;

  getPlatform(): PlatformType;

  openApplication(target: string): Promise<ApplicationLaunchResult>;

  closeApplication(target: string): Promise<ApplicationCloseResult>;

  openBrowser(url: string): Promise<BrowserOpenResult>;

  searchBrowser(query: string): Promise<BrowserSearchResult>;

  controlMedia(action: "play" | "pause"): Promise<MediaControlResult>;

  searchFiles(query: string): Promise<FileSearchResult>;

  readFile(path: string): Promise<FileReadResult>;

  createAutomation(trigger: string, action: string): Promise<AutomationCreateResult>;
}

export abstract class NativeHostBridge implements NativeHostBridgeContract {
  abstract isAvailable(): boolean;

  abstract getPlatform(): PlatformType;

  abstract openApplication(target: string): Promise<ApplicationLaunchResult>;

  abstract closeApplication(target: string): Promise<ApplicationCloseResult>;

  abstract openBrowser(url: string): Promise<BrowserOpenResult>;

  abstract searchBrowser(query: string): Promise<BrowserSearchResult>;

  abstract controlMedia(action: "play" | "pause"): Promise<MediaControlResult>;

  abstract searchFiles(query: string): Promise<FileSearchResult>;

  abstract readFile(path: string): Promise<FileReadResult>;

  abstract createAutomation(trigger: string, action: string): Promise<AutomationCreateResult>;
}

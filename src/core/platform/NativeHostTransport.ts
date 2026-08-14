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

export interface NativeHostTransportContract {
  isAvailable(): boolean;

  getPlatform(): PlatformType;

  openApplication(
    target: string,
  ): Promise<ApplicationLaunchResult>;

  closeApplication(
    target: string,
  ): Promise<ApplicationCloseResult>;

  openBrowser(
    url: string,
  ): Promise<BrowserOpenResult>;

  searchBrowser(
    query: string,
  ): Promise<BrowserSearchResult>;

  controlMedia(
    action: "play" | "pause",
  ): Promise<MediaControlResult>;

  searchFiles(
    query: string,
  ): Promise<FileSearchResult>;

  readFile(
    path: string,
  ): Promise<FileReadResult>;

  createAutomation(
    trigger: string,
    action: string,
  ): Promise<AutomationCreateResult>;

  generateAIResponse(
    prompt: string,
  ): Promise<string>;
}
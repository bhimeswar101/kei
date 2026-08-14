export type PlatformType = "windows" | "macos" | "linux" | "unknown";

export interface ApplicationLaunchRequest {
  readonly target: string;
}

export interface ApplicationLaunchResult {
  readonly success: boolean;
  readonly target: string;
  readonly error?: string;
}

export interface ApplicationCloseRequest {
  readonly target: string;
}

export interface ApplicationCloseResult {
  readonly success: boolean;
  readonly target: string;
  readonly error?: string;
}

export interface BrowserOpenRequest {
  readonly url: string;
}

export interface BrowserOpenResult {
  readonly success: boolean;
  readonly url: string;
  readonly error?: string;
}

export interface BrowserSearchRequest {
  readonly query: string;
}

export interface BrowserSearchResult {
  readonly success: boolean;
  readonly query: string;
  readonly error?: string;
}

export interface MediaControlRequest {
  readonly action: "play" | "pause";
}

export interface MediaControlResult {
  readonly success: boolean;
  readonly action: "play" | "pause";
  readonly error?: string;
}

export interface FileSearchRequest {
  readonly query: string;
}

export interface FileSearchResult {
  readonly success: boolean;
  readonly query: string;
  readonly files: string[];
  readonly error?: string;
}

export interface FileReadRequest {
  readonly path: string;
}

export interface FileReadResult {
  readonly success: boolean;
  readonly path: string;
  readonly content?: string;
  readonly error?: string;
}

export interface AutomationCreateRequest {
  readonly trigger: string;
  readonly action: string;
}

export interface AutomationCreateResult {
  readonly success: boolean;
  readonly trigger: string;
  readonly action: string;
  readonly error?: string;
}

export interface PlatformApplicationAdapterContract {
  readonly platform: PlatformType;
  openApplication(request: ApplicationLaunchRequest): Promise<ApplicationLaunchResult>;
  closeApplication(request: ApplicationCloseRequest): Promise<ApplicationCloseResult>;
  openBrowser(request: BrowserOpenRequest): Promise<BrowserOpenResult>;
  searchBrowser(request: BrowserSearchRequest): Promise<BrowserSearchResult>;
  controlMedia(request: MediaControlRequest): Promise<MediaControlResult>;
  searchFiles(request: FileSearchRequest): Promise<FileSearchResult>;
  readFile(request: FileReadRequest): Promise<FileReadResult>;
  createAutomation(request: AutomationCreateRequest): Promise<AutomationCreateResult>;
}

import type {
  ApplicationLaunchRequest,
  ApplicationLaunchResult,
  ApplicationCloseRequest,
  ApplicationCloseResult,
  BrowserOpenRequest,
  BrowserOpenResult,
  BrowserSearchRequest,
  BrowserSearchResult,
  MediaControlRequest,
  MediaControlResult,
  FileSearchRequest,
  FileSearchResult,
  FileReadRequest,
  FileReadResult,
  AutomationCreateRequest,
  AutomationCreateResult,
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

  async closeApplication(
    request: ApplicationCloseRequest,
  ): Promise<ApplicationCloseResult> {
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
      return await this.terminateApplication(
        target,
      );
    } catch (error) {
      return {
        success: false,
        target,
        error:
          error instanceof Error
            ? error.message
            : "Application termination failed.",
      };
    }
  }

  async openBrowser(
    request: BrowserOpenRequest,
  ): Promise<BrowserOpenResult> {
    const url = request.url.trim();

    if (!url) {
      return {
        success: false,
        url,
        error: "URL cannot be empty.",
      };
    }

    try {
      return await this.launchBrowser(url);
    } catch (error) {
      return {
        success: false,
        url,
        error:
          error instanceof Error
            ? error.message
            : "Browser launch failed.",
      };
    }
  }

  async searchBrowser(
    request: BrowserSearchRequest,
  ): Promise<BrowserSearchResult> {
    const query = request.query.trim();

    if (!query) {
      return {
        success: false,
        query,
        error: "Search query cannot be empty.",
      };
    }

    try {
      return await this.launchSearch(query);
    } catch (error) {
      return {
        success: false,
        query,
        error:
          error instanceof Error
            ? error.message
            : "Browser search failed.",
      };
    }
  }

  async controlMedia(
    request: MediaControlRequest,
  ): Promise<MediaControlResult> {
    try {
      return await this.triggerMedia(request.action);
    } catch (error) {
      return {
        success: false,
        action: request.action,
        error:
          error instanceof Error
            ? error.message
            : "Media control failed.",
      };
    }
  }

  async searchFiles(
    request: FileSearchRequest,
  ): Promise<FileSearchResult> {
    const query = request.query.trim();

    try {
      return await this.findFiles(query);
    } catch (error) {
      return {
        success: false,
        query,
        files: [],
        error:
          error instanceof Error
            ? error.message
            : "File search failed.",
      };
    }
  }

  async readFile(
    request: FileReadRequest,
  ): Promise<FileReadResult> {
    const path = request.path.trim();

    if (!path) {
      return {
        success: false,
        path,
        error: "File path cannot be empty.",
      };
    }

    try {
      return await this.readContent(path);
    } catch (error) {
      return {
        success: false,
        path,
        error:
          error instanceof Error
            ? error.message
            : "File read failed.",
      };
    }
  }

  async createAutomation(
    request: AutomationCreateRequest,
  ): Promise<AutomationCreateResult> {
    const trigger = request.trigger.trim();
    const action = request.action.trim();

    if (!trigger || !action) {
      return {
        success: false,
        trigger,
        action,
        error: "Trigger and action are required.",
      };
    }

    try {
      return await this.registerAutomation(trigger, action);
    } catch (error) {
      return {
        success: false,
        trigger,
        action,
        error:
          error instanceof Error
            ? error.message
            : "Automation registration failed.",
      };
    }
  }

  protected abstract launchApplication(
    target: string,
  ): Promise<ApplicationLaunchResult>;

  protected abstract terminateApplication(
    target: string,
  ): Promise<ApplicationCloseResult>;

  protected abstract launchBrowser(
    url: string,
  ): Promise<BrowserOpenResult>;

  protected abstract launchSearch(
    query: string,
  ): Promise<BrowserSearchResult>;

  protected abstract triggerMedia(
    action: "play" | "pause",
  ): Promise<MediaControlResult>;

  protected abstract findFiles(
    query: string,
  ): Promise<FileSearchResult>;

  protected abstract readContent(
    path: string,
  ): Promise<FileReadResult>;

  protected abstract registerAutomation(
    trigger: string,
    action: string,
  ): Promise<AutomationCreateResult>;
}

import { invoke } from "@tauri-apps/api/core";

import type {
  ApplicationLaunchResult,
  ApplicationCloseResult,
  BrowserOpenResult,
  BrowserSearchResult,
  MediaControlResult,
  FileSearchResult,
  FileReadResult,
  AutomationCreateResult,
  NativeHostTransportContract,
  PlatformType,
} from "@/core/platform";

export class DesktopNativeHostTransport
  implements NativeHostTransportContract
{
  isAvailable(): boolean {
    return (
      typeof window !== "undefined" &&
      "__TAURI_INTERNALS__" in window
    );
  }

  getPlatform(): PlatformType {
    return "windows";
  }

  async openApplication(
    target: string,
  ): Promise<ApplicationLaunchResult> {
    if (!this.isAvailable()) {
      return {
        success: false,
        target,
        error:
          "Tauri desktop native host is unavailable.",
      };
    }

    try {
      await invoke<void>(
        "open_application",
        {
          target,
        },
      );

      return {
        success: true,
        target,
      };
    } catch (error) {
      return {
        success: false,
        target,
        error:
          error instanceof Error
            ? error.message
            : typeof error === "string"
              ? error
              : "Failed to launch application.",
      };
    }
  }

  async closeApplication(
    target: string,
  ): Promise<ApplicationCloseResult> {
    if (!this.isAvailable()) {
      return {
        success: false,
        target,
        error:
          "Tauri desktop native host is unavailable.",
      };
    }

    try {
      await invoke<void>(
        "close_application",
        {
          target,
        },
      );

      return {
        success: true,
        target,
      };
    } catch (error) {
      return {
        success: false,
        target,
        error:
          error instanceof Error
            ? error.message
            : typeof error === "string"
              ? error
              : "Failed to close application.",
      };
    }
  }

  async openBrowser(
    url: string,
  ): Promise<BrowserOpenResult> {
    if (!this.isAvailable()) {
      return {
        success: false,
        url,
        error:
          "Tauri desktop native host is unavailable.",
      };
    }

    try {
      await invoke<void>(
        "open_browser_url",
        {
          url,
        },
      );

      return {
        success: true,
        url,
      };
    } catch (error) {
      return {
        success: false,
        url,
        error:
          error instanceof Error
            ? error.message
            : typeof error === "string"
              ? error
              : "Failed to open browser URL.",
      };
    }
  }

  async searchBrowser(
    query: string,
  ): Promise<BrowserSearchResult> {
    if (!this.isAvailable()) {
      return {
        success: false,
        query,
        error:
          "Tauri desktop native host is unavailable.",
      };
    }

    try {
      await invoke<void>(
        "search_browser",
        {
          query,
        },
      );

      return {
        success: true,
        query,
      };
    } catch (error) {
      return {
        success: false,
        query,
        error:
          error instanceof Error
            ? error.message
            : typeof error === "string"
              ? error
              : "Failed browser search.",
      };
    }
  }

  async controlMedia(
    action: "play" | "pause",
  ): Promise<MediaControlResult> {
    if (!this.isAvailable()) {
      return {
        success: false,
        action,
        error:
          "Tauri desktop native host is unavailable.",
      };
    }

    try {
      await invoke<void>(
        "control_media",
        {
          action,
        },
      );

      return {
        success: true,
        action,
      };
    } catch (error) {
      return {
        success: false,
        action,
        error:
          error instanceof Error
            ? error.message
            : typeof error === "string"
              ? error
              : "Failed media control.",
      };
    }
  }

  async searchFiles(
    query: string,
  ): Promise<FileSearchResult> {
    if (!this.isAvailable()) {
      return {
        success: false,
        query,
        files: [],
        error:
          "Tauri desktop native host is unavailable.",
      };
    }

    try {
      const files = await invoke<string[]>(
        "search_files",
        {
          query,
        },
      );

      return {
        success: true,
        query,
        files,
      };
    } catch (error) {
      return {
        success: false,
        query,
        files: [],
        error:
          error instanceof Error
            ? error.message
            : typeof error === "string"
              ? error
              : "Failed file search.",
      };
    }
  }

  async readFile(
    path: string,
  ): Promise<FileReadResult> {
    if (!this.isAvailable()) {
      return {
        success: false,
        path,
        error:
          "Tauri desktop native host is unavailable.",
      };
    }

    try {
      const content = await invoke<string>(
        "read_file",
        {
          path,
        },
      );

      return {
        success: true,
        path,
        content,
      };
    } catch (error) {
      return {
        success: false,
        path,
        error:
          error instanceof Error
            ? error.message
            : typeof error === "string"
              ? error
              : "Failed to read file.",
      };
    }
  }

  async createAutomation(
    trigger: string,
    action: string,
  ): Promise<AutomationCreateResult> {
    if (!this.isAvailable()) {
      return {
        success: false,
        trigger,
        action,
        error:
          "Tauri desktop native host is unavailable.",
      };
    }

    try {
      await invoke<void>(
        "create_automation",
        {
          trigger,
          action,
        },
      );

      return {
        success: true,
        trigger,
        action,
      };
    } catch (error) {
      return {
        success: false,
        trigger,
        action,
        error:
          error instanceof Error
            ? error.message
            : typeof error === "string"
              ? error
              : "Failed to create automation.",
      };
    }
  }

  async generateAIResponse(
    prompt: string,
  ): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error(
        "Tauri desktop native host is unavailable.",
      );
    }

    const normalizedPrompt =
      prompt.trim();

    if (!normalizedPrompt) {
      throw new Error(
        "AI prompt cannot be empty.",
      );
    }

    try {
      return await invoke<string>(
        "gemini_generate",
        {
          prompt: normalizedPrompt,
        },
      );
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : "Native Gemini request failed.",
      );
    }
  }
}

export const desktopNativeHostTransport =
  new DesktopNativeHostTransport();
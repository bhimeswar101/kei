import type { PlatformType } from "./types";

export class PlatformDetector {
  detect(): PlatformType {
    if (typeof navigator === "undefined") {
      return "unknown";
    }

    const platform = navigator.platform.toLowerCase();

    const userAgent = navigator.userAgent.toLowerCase();

    if (platform.includes("win") || userAgent.includes("windows")) {
      return "windows";
    }

    if (platform.includes("mac") || userAgent.includes("macintosh")) {
      return "macos";
    }

    if (platform.includes("linux") || userAgent.includes("linux")) {
      return "linux";
    }

    return "unknown";
  }
}

export const platformDetector = new PlatformDetector();

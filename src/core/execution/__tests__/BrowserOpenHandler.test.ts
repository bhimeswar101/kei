import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BrowserOpenHandler } from "../BrowserOpenHandler";
import { platformApplicationAdapterManager } from "@/core/platform";

describe("BrowserOpenHandler", () => {
  let mockAdapter: any;

  beforeEach(() => {
    mockAdapter = {
      openBrowser: vi.fn(),
    };
    vi.spyOn(platformApplicationAdapterManager, "getActive").mockReturnValue(mockAdapter);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fails execution with invalid URL scheme", async () => {
    const handler = new BrowserOpenHandler();
    const context = {
      step: {
        id: "step-1",
        arguments: { url: "file:///C:/Windows" },
        capability: { id: "browser.open" },
      },
    };
    const result = await handler.execute(context as any);
    expect(result.status).toBe("failed");
    expect(result.error).toContain("schemes are allowed");
  });

  it("successfully calls active platform adapter with HTTP URL", async () => {
    mockAdapter.openBrowser.mockResolvedValue({ success: true, url: "https://example.com" });
    const handler = new BrowserOpenHandler();
    const context = {
      step: {
        id: "step-1",
        arguments: { url: "https://example.com" },
        capability: { id: "browser.open" },
      },
    };
    const result = await handler.execute(context as any);
    expect(result.status).toBe("completed");
    expect(mockAdapter.openBrowser).toHaveBeenCalledWith({ url: "https://example.com" });
  });
});

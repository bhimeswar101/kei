import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BrowserSearchHandler } from "../BrowserSearchHandler";
import { platformApplicationAdapterManager } from "@/core/platform";

describe("BrowserSearchHandler", () => {
  let mockAdapter: any;

  beforeEach(() => {
    mockAdapter = {
      searchBrowser: vi.fn(),
    };
    vi.spyOn(platformApplicationAdapterManager, "getActive").mockReturnValue(mockAdapter);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fails execution with invalid query", async () => {
    const handler = new BrowserSearchHandler();
    const context = {
      step: {
        id: "step-1",
        arguments: {},
        capability: { id: "browser.search" },
      },
    };
    const result = await handler.execute(context as any);
    expect(result.status).toBe("failed");
    expect(result.error).toContain("required");
  });

  it("successfully calls active platform adapter with valid query", async () => {
    mockAdapter.searchBrowser.mockResolvedValue({ success: true, query: "search test" });
    const handler = new BrowserSearchHandler();
    const context = {
      step: {
        id: "step-1",
        arguments: { query: "search test" },
        capability: { id: "browser.search" },
      },
    };
    const result = await handler.execute(context as any);
    expect(result.status).toBe("completed");
    expect(mockAdapter.searchBrowser).toHaveBeenCalledWith({ query: "search test" });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FileSearchHandler } from "../FileSearchHandler";
import { platformApplicationAdapterManager } from "@/core/platform";

describe("FileSearchHandler", () => {
  let mockAdapter: any;

  beforeEach(() => {
    mockAdapter = {
      searchFiles: vi.fn(),
    };
    vi.spyOn(platformApplicationAdapterManager, "getActive").mockReturnValue(mockAdapter);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fails execution with invalid query", async () => {
    const handler = new FileSearchHandler();
    const context = {
      step: {
        id: "step-1",
        arguments: {},
        capability: { id: "file.search" },
      },
    };
    const result = await handler.execute(context as any);
    expect(result.status).toBe("failed");
    expect(result.error).toContain("required");
  });

  it("successfully calls active platform adapter with valid query", async () => {
    mockAdapter.searchFiles.mockResolvedValue({ success: true, query: "test", files: ["test.txt"] });
    const handler = new FileSearchHandler();
    const context = {
      step: {
        id: "step-1",
        arguments: { query: "test" },
        capability: { id: "file.search" },
      },
    };
    const result = await handler.execute(context as any);
    expect(result.status).toBe("completed");
    expect(mockAdapter.searchFiles).toHaveBeenCalledWith({ query: "test" });
  });
});

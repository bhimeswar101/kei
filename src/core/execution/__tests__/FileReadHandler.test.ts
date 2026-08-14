import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FileReadHandler } from "../FileReadHandler";
import { platformApplicationAdapterManager } from "@/core/platform";

describe("FileReadHandler", () => {
  let mockAdapter: any;

  beforeEach(() => {
    mockAdapter = {
      readFile: vi.fn(),
    };
    vi.spyOn(platformApplicationAdapterManager, "getActive").mockReturnValue(mockAdapter);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fails execution with invalid path", async () => {
    const handler = new FileReadHandler();
    const context = {
      step: {
        id: "step-1",
        arguments: {},
        capability: { id: "file.read" },
      },
    };
    const result = await handler.execute(context as any);
    expect(result.status).toBe("failed");
    expect(result.error).toContain("required");
  });

  it("successfully calls active platform adapter with valid path", async () => {
    mockAdapter.readFile.mockResolvedValue({ success: true, path: "test.txt", content: "hello" });
    const handler = new FileReadHandler();
    const context = {
      step: {
        id: "step-1",
        arguments: { path: "test.txt" },
        capability: { id: "file.read" },
      },
    };
    const result = await handler.execute(context as any);
    expect(result.status).toBe("completed");
    expect(mockAdapter.readFile).toHaveBeenCalledWith({ path: "test.txt" });
  });
});

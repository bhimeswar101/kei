import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApplicationCloseHandler } from "../ApplicationCloseHandler";
import { platformApplicationAdapterManager } from "@/core/platform";

describe("ApplicationCloseHandler", () => {
  let mockAdapter: any;

  beforeEach(() => {
    mockAdapter = {
      closeApplication: vi.fn(),
    };
    vi.spyOn(platformApplicationAdapterManager, "getActive").mockReturnValue(mockAdapter);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fails execution with invalid target argument", async () => {
    const handler = new ApplicationCloseHandler();
    const context = {
      step: {
        id: "step-1",
        arguments: {},
        capability: { id: "application.close" },
      },
    };
    const result = await handler.execute(context as any);
    expect(result.status).toBe("failed");
    expect(result.error).toContain("required");
  });

  it("fails execution with non-whitelisted target application", async () => {
    const handler = new ApplicationCloseHandler();
    const context = {
      step: {
        id: "step-1",
        arguments: { target: "malicious.exe" },
        capability: { id: "application.close" },
      },
    };
    const result = await handler.execute(context as any);
    expect(result.status).toBe("failed");
    expect(result.error).toContain("not an approved target");
  });

  it("successfully calls active platform adapter with whitelisted target", async () => {
    mockAdapter.closeApplication.mockResolvedValue({ success: true, target: "notepad" });
    const handler = new ApplicationCloseHandler();
    const context = {
      step: {
        id: "step-1",
        arguments: { target: "notepad" },
        capability: { id: "application.close" },
      },
    };
    const result = await handler.execute(context as any);
    expect(result.status).toBe("completed");
    expect(mockAdapter.closeApplication).toHaveBeenCalledWith({ target: "notepad" });
  });
});

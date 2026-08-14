import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApplicationOpenHandler } from "../ApplicationOpenHandler";
import { platformApplicationAdapterManager } from "@/core/platform";

describe("ApplicationOpenHandler", () => {
  let mockAdapter: any;

  beforeEach(() => {
    mockAdapter = {
      openApplication: vi.fn(),
    };
    vi.spyOn(platformApplicationAdapterManager, "getActive").mockReturnValue(mockAdapter);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fails execution with invalid target argument", async () => {
    const handler = new ApplicationOpenHandler();
    const context = {
      step: {
        id: "step-1",
        arguments: {},
        capability: { id: "application.open" },
      },
    };
    const result = await handler.execute(context as any);
    expect(result.status).toBe("failed");
    expect(result.error).toContain("required");
  });

  it("successfully calls active platform adapter", async () => {
    mockAdapter.openApplication.mockResolvedValue({ success: true, target: "calc" });
    const handler = new ApplicationOpenHandler();
    const context = {
      step: {
        id: "step-1",
        arguments: { target: "calc" },
        capability: { id: "application.open" },
      },
    };
    const result = await handler.execute(context as any);
    expect(result.status).toBe("completed");
    expect(mockAdapter.openApplication).toHaveBeenCalledWith({ target: "calc" });
  });

  it("handles launch failure from platform adapter", async () => {
    mockAdapter.openApplication.mockResolvedValue({ success: false, target: "calc", error: "Launch error" });
    const handler = new ApplicationOpenHandler();
    const context = {
      step: {
        id: "step-1",
        arguments: { target: "calc" },
        capability: { id: "application.open" },
      },
    };
    const result = await handler.execute(context as any);
    expect(result.status).toBe("failed");
    expect(result.error).toBe("Launch error");
  });
});

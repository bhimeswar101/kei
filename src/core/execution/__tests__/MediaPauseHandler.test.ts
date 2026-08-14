import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MediaPauseHandler } from "../MediaPauseHandler";
import { platformApplicationAdapterManager } from "@/core/platform";

describe("MediaPauseHandler", () => {
  let mockAdapter: any;

  beforeEach(() => {
    mockAdapter = {
      controlMedia: vi.fn(),
    };
    vi.spyOn(platformApplicationAdapterManager, "getActive").mockReturnValue(mockAdapter);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("successfully calls active platform adapter to trigger pause", async () => {
    mockAdapter.controlMedia.mockResolvedValue({ success: true, action: "pause" });
    const handler = new MediaPauseHandler();
    const context = {
      step: {
        id: "step-1",
        arguments: {},
        capability: { id: "media.pause" },
      },
    };
    const result = await handler.execute(context as any);
    expect(result.status).toBe("completed");
    expect(mockAdapter.controlMedia).toHaveBeenCalledWith({ action: "pause" });
  });
});

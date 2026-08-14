import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MediaPlayHandler } from "../MediaPlayHandler";
import { platformApplicationAdapterManager } from "@/core/platform";

describe("MediaPlayHandler", () => {
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

  it("successfully calls active platform adapter to trigger play", async () => {
    mockAdapter.controlMedia.mockResolvedValue({ success: true, action: "play" });
    const handler = new MediaPlayHandler();
    const context = {
      step: {
        id: "step-1",
        arguments: {},
        capability: { id: "media.play" },
      },
    };
    const result = await handler.execute(context as any);
    expect(result.status).toBe("completed");
    expect(mockAdapter.controlMedia).toHaveBeenCalledWith({ action: "play" });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AutomationCreateHandler } from "../AutomationCreateHandler";
import { platformApplicationAdapterManager } from "@/core/platform";

describe("AutomationCreateHandler", () => {
  let mockAdapter: any;

  beforeEach(() => {
    mockAdapter = {
      createAutomation: vi.fn(),
    };
    vi.spyOn(platformApplicationAdapterManager, "getActive").mockReturnValue(mockAdapter);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fails execution with invalid trigger or action arguments", async () => {
    const handler = new AutomationCreateHandler();
    const context = {
      step: {
        id: "step-1",
        arguments: { trigger: "tomorrow" },
        capability: { id: "automation.create" },
      },
    };
    const result = await handler.execute(context as any);
    expect(result.status).toBe("failed");
    expect(result.error).toContain("required");
  });

  it("successfully calls active platform adapter with valid trigger and action", async () => {
    mockAdapter.createAutomation.mockResolvedValue({ success: true, trigger: "tomorrow", action: "email" });
    const handler = new AutomationCreateHandler();
    const context = {
      step: {
        id: "step-1",
        arguments: { trigger: "tomorrow", action: "email" },
        capability: { id: "automation.create" },
      },
    };
    const result = await handler.execute(context as any);
    expect(result.status).toBe("completed");
    expect(mockAdapter.createAutomation).toHaveBeenCalledWith({ trigger: "tomorrow", action: "email" });
  });
});

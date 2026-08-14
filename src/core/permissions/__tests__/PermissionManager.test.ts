import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { permissionManager } from "../PermissionManager";
import { storage } from "@/core/storage";

describe("PermissionManager", () => {
  let store: Record<string, any> = {};

  beforeEach(() => {
    store = {};
    vi.spyOn(storage, "get").mockImplementation((key) => store[key] ?? null);
    vi.spyOn(storage, "set").mockImplementation((key, value) => {
      store[key] = value;
    });
    vi.spyOn(storage, "remove").mockImplementation((key) => {
      delete store[key];
    });
    permissionManager.resetAll();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns default status 'prompt'", () => {
    expect(permissionManager.getStatus("microphone")).toBe("prompt");
    expect(permissionManager.isGranted("microphone")).toBe(false);
  });

  it("grants and denies permission successfully", () => {
    permissionManager.grant("microphone");
    expect(permissionManager.getStatus("microphone")).toBe("granted");
    expect(permissionManager.isGranted("microphone")).toBe(true);

    permissionManager.deny("microphone");
    expect(permissionManager.getStatus("microphone")).toBe("denied");
    expect(permissionManager.isGranted("microphone")).toBe(false);
  });

  it("handles missing mediaDevices gracefully", async () => {
    vi.stubGlobal("navigator", {});
    const status = await permissionManager.request("microphone");
    expect(status).toBe("denied");
    expect(permissionManager.getStatus("microphone")).toBe("denied");
  });

  it("handles successful getUserMedia request", async () => {
    const stopMock = vi.fn();
    const streamMock = {
      getTracks: () => [{ stop: stopMock }],
    };
    const getUserMediaMock = vi.fn().mockResolvedValue(streamMock);

    vi.stubGlobal("navigator", {
      mediaDevices: {
        getUserMedia: getUserMediaMock,
      },
    });

    const status = await permissionManager.request("microphone");
    expect(getUserMediaMock).toHaveBeenCalled();
    expect(stopMock).toHaveBeenCalled();
    expect(status).toBe("granted");
    expect(permissionManager.getStatus("microphone")).toBe("granted");
  });

  it("handles failed getUserMedia request", async () => {
    const getUserMediaMock = vi.fn().mockRejectedValue(new Error("Hardware error"));

    vi.stubGlobal("navigator", {
      mediaDevices: {
        getUserMedia: getUserMediaMock,
      },
    });

    const status = await permissionManager.request("microphone");
    expect(getUserMediaMock).toHaveBeenCalled();
    expect(status).toBe("denied");
    expect(permissionManager.getStatus("microphone")).toBe("denied");
  });
});

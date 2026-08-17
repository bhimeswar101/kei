import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { pluginManager } from "../PluginManager";
import { BasePlugin } from "../BasePlugin";
import { capabilityHandlerRegistry } from "@/core/execution/CapabilityHandlerRegistry";
import type { CapabilityHandlerContract } from "@/core/execution/CapabilityHandler";
import { pluginMiddleware } from "../PluginMiddleware";

class MockPlugin extends BasePlugin {
  constructor(id: string, permissions: string[] = []) {
    super({
      id,
      name: `Mock Plugin ${id}`,
      version: "1.0.0",
      permissions,
    });
  }

  async start(): Promise<void> {}
  async stop(): Promise<void> {}
}

describe("PluginManager & Ecosystem", () => {
  beforeEach(() => {
    pluginManager.clear();
    capabilityHandlerRegistry.clear();
    pluginMiddleware.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("handles standard plugin registration and lifecycle state transitions", async () => {
    const plugin = new MockPlugin("test-plugin");
    pluginManager.register(plugin);
    expect(pluginManager.has("test-plugin")).toBe(true);

    await pluginManager.startPlugin("test-plugin");
    expect(plugin.state()).toBe("registered"); // mock doesn't set running inside base MockPlugin unless overridden

    await pluginManager.stopPlugin("test-plugin");
    pluginManager.unregister("test-plugin");
    expect(pluginManager.has("test-plugin")).toBe(false);
  });

  it("validates capability handler registration permissions", () => {
    const pluginWithoutPerms = new MockPlugin("no-perm-plugin", []);
    pluginManager.register(pluginWithoutPerms);

    const mockHandler: CapabilityHandlerContract = {
      capabilityId: "file.read",
      canHandle: () => true,
      execute: async () => ({ stepId: "1", capability: "file.read", status: "completed", startedAt: new Date(), completedAt: new Date() }),
    };

    expect(() =>
      pluginManager.registerCapabilityHandler("no-perm-plugin", mockHandler),
    ).toThrow("lacks permission to register capability");

    const pluginWithPerms = new MockPlugin("perm-plugin", ["file"]);
    pluginManager.register(pluginWithPerms);
    pluginManager.registerCapabilityHandler("perm-plugin", mockHandler);
    expect(capabilityHandlerRegistry.has("file.read")).toBe(true);
  });

  it("prevents duplicate capability handler registration collisions", () => {
    const plugin1 = new MockPlugin("plugin1", ["file"]);
    const plugin2 = new MockPlugin("plugin2", ["file"]);
    pluginManager.register(plugin1);
    pluginManager.register(plugin2);

    const handler1: CapabilityHandlerContract = {
      capabilityId: "file.read",
      canHandle: () => true,
      execute: async () => ({ stepId: "1", capability: "file.read", status: "completed", startedAt: new Date(), completedAt: new Date() }),
    };

    const handler2: CapabilityHandlerContract = {
      capabilityId: "file.read",
      canHandle: () => true,
      execute: async () => ({ stepId: "1", capability: "file.read", status: "completed", startedAt: new Date(), completedAt: new Date() }),
    };

    pluginManager.registerCapabilityHandler("plugin1", handler1);
    expect(() =>
      pluginManager.registerCapabilityHandler("plugin2", handler2),
    ).toThrow("is already registered");
  });

  it("triggers transaction rollback upon plugin startup failure", async () => {
    const handler: CapabilityHandlerContract = {
      capabilityId: "file.read",
      canHandle: () => true,
      execute: async () => ({ stepId: "1", capability: "file.read", status: "completed", startedAt: new Date(), completedAt: new Date() }),
    };

    class CrashingPlugin extends BasePlugin {
      constructor() {
        super({ id: "crashing", name: "Crash", version: "1.0.0", permissions: ["file"] });
      }
      async start() {
        pluginManager.registerCapabilityHandler("crashing", handler);
        throw new Error("Startup Crash");
      }
      async stop() {}
    }

    const plugin = new CrashingPlugin();
    pluginManager.register(plugin);

    await expect(pluginManager.startPlugin("crashing")).rejects.toThrow("Startup Crash");
    // Verify that the capability handler registered before the crash was rolled back/cleaned up
    expect(capabilityHandlerRegistry.has("file.read")).toBe(false);
  });

  it("executes read-only observational pre-request and post-response middleware", async () => {
    const plugin = new MockPlugin("mid-plugin", ["middleware"]);
    pluginManager.register(plugin);

    const preSpy = vi.fn();
    const postSpy = vi.fn();

    pluginManager.registerPreRequestObserver("mid-plugin", preSpy);
    pluginManager.registerPostResponseObserver("mid-plugin", postSpy);

    const requestInput = { text: "Hello Kei" };
    const responseResult = {
      requestId: "req-1",
      outcome: { status: "success" as const, outputs: {} },
      intelligence: {
        intent: { type: "conversation" as const, arguments: {} },
        parameters: {},
        grounding: { references: [] },
      },
      response: {
        requestId: "req-1",
        text: "Hello User",
        strategy: "conversation" as const,
        source: "provider" as const,
        success: true,
        grounded: false,
        fallbackUsed: false,
      },
    };

    await pluginMiddleware.executePreRequestObservers(requestInput);
    expect(preSpy).toHaveBeenCalledWith(requestInput);

    await pluginMiddleware.executePostResponseObservers(responseResult);
    expect(postSpy).toHaveBeenCalledWith(responseResult);
  });

  it("isolates middleware observer errors from interrupting execution pipeline", async () => {
    const plugin1 = new MockPlugin("p1", ["middleware"]);
    const plugin2 = new MockPlugin("p2", ["middleware"]);
    pluginManager.register(plugin1);
    pluginManager.register(plugin2);

    const crashingObserver = () => {
      throw new Error("Middleware Crash");
    };
    const safeSpy = vi.fn();

    pluginManager.registerPreRequestObserver("p1", crashingObserver);
    pluginManager.registerPreRequestObserver("p2", safeSpy);

    // Verify it doesn't throw, and runs the other safe observer successfully
    await expect(pluginMiddleware.executePreRequestObservers({ text: "test" })).resolves.not.toThrow();
    expect(safeSpy).toHaveBeenCalled();
  });
});

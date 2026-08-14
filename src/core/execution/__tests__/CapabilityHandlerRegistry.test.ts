import { beforeEach, describe, expect, it, vi } from "vitest";
import { CapabilityHandlerRegistry } from "../CapabilityHandlerRegistry";
import type { CapabilityHandlerContract } from "../CapabilityHandler";

describe("CapabilityHandlerRegistry", () => {
  let registry: CapabilityHandlerRegistry;
  let mockHandler: CapabilityHandlerContract;

  beforeEach(() => {
    registry = new CapabilityHandlerRegistry();
    mockHandler = {
      capabilityId: "test.capability",
      canHandle: vi.fn().mockReturnValue(true),
      execute: vi.fn(),
    };
  });

  it("registers and resolves handlers correctly", () => {
    registry.register(mockHandler);
    expect(registry.has("test.capability")).toBe(true);
    expect(registry.get("test.capability")).toBe(mockHandler);

    const definition = {
      id: "test.capability",
      name: "Test",
      category: "test",
      supportedIntents: ["action"],
      riskLevel: "low",
      requiresPermission: false,
    };
    const resolved = registry.resolve(definition as any);
    expect(resolved).toBe(mockHandler);
  });

  it("throws error on duplicate handler registration", () => {
    registry.register(mockHandler);
    expect(() => registry.register(mockHandler)).toThrow();
  });

  it("unregisters handlers correctly", () => {
    registry.register(mockHandler);
    expect(registry.unregister("test.capability")).toBe(true);
    expect(registry.has("test.capability")).toBe(false);
  });
});

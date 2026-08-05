import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type {
  ContextEngineContract,
  ContextSnapshot,
  ContextValue,
} from "@/core/context";

import {
  MemoryContextBridge,
} from "../MemoryContextBridge";

import type {
  MemoryEngineContract,
  MemoryEntry,
} from "../types";

describe("MemoryContextBridge", () => {
  it("hydrates memory entries into the memory context namespace", async () => {
    const entries: readonly MemoryEntry[] = [
      {
        id: "memory-1",
        type: "long-term",
        key: "user.name",
        value: "Alex",
        source: "user",
        metadata: {
          importance: 0.9,
          confidence: 1,
          accessCount: 0,
        },
        createdAt: 1000,
        updatedAt: 1000,
      },
      {
        id: "memory-2",
        type: "short-term",
        key: "conversation.topic",
        value: "project planning",
        source: "assistant",
        metadata: {
          importance: 0.6,
          confidence: 0.9,
          accessCount: 0,
        },
        createdAt: 2000,
        updatedAt: 2000,
      },
    ];

    const memoryEngine: MemoryEngineContract = {
      write: vi.fn(),
      get: vi.fn(),
      query: vi.fn().mockResolvedValue(entries),
      remove: vi.fn(),
      clear: vi.fn(),
      getStatus: vi.fn().mockReturnValue("idle"),
      isBusy: vi.fn().mockReturnValue(false),
    };

    const set = vi.fn();

    const contextEngine: ContextEngineContract = {
      set: set as ContextEngineContract["set"],

      get: vi.fn() as <T extends ContextValue>(
        key: string,
      ) => T | undefined,

      has: vi.fn().mockReturnValue(false),

      remove: vi.fn().mockReturnValue(false),

      clear: vi.fn(),

      createSnapshot: vi.fn().mockReturnValue({
        requestId: "request-1",
        createdAt: 3000,
        entries: new Map(),
      } satisfies ContextSnapshot),
    };

    const bridge = new MemoryContextBridge(
      memoryEngine,
      contextEngine,
    );

    const result = await bridge.hydrate();

    expect(memoryEngine.query).toHaveBeenCalledTimes(1);
    expect(memoryEngine.query).toHaveBeenCalledWith({});

    expect(set).toHaveBeenCalledTimes(2);

    expect(set).toHaveBeenNthCalledWith(
      1,
      "memory.user.name",
      "Alex",
      "memory",
    );

    expect(set).toHaveBeenNthCalledWith(
      2,
      "memory.conversation.topic",
      "project planning",
      "memory",
    );

    expect(result.entries).toEqual(entries);
    expect(result.hydratedCount).toBe(2);
  });

  it("does not hydrate expired memory entries", async () => {
    const now = Date.now();

    const entries: readonly MemoryEntry[] = [
      {
        id: "memory-active",
        type: "long-term",
        key: "user.preference",
        value: "dark mode",
        source: "user",
        metadata: {
          importance: 0.8,
          confidence: 1,
          accessCount: 0,
        },
        createdAt: now - 2000,
        updatedAt: now - 2000,
      },
      {
        id: "memory-expired",
        type: "short-term",
        key: "conversation.temp",
        value: "expired value",
        source: "assistant",
        metadata: {
          importance: 0.5,
          confidence: 1,
          accessCount: 0,
          expiresAt: now - 1000,
        },
        createdAt: now - 3000,
        updatedAt: now - 3000,
      },
    ];

    const memoryEngine: MemoryEngineContract = {
      write: vi.fn(),
      get: vi.fn(),
      query: vi.fn().mockResolvedValue(entries),
      remove: vi.fn(),
      clear: vi.fn(),
      getStatus: vi.fn().mockReturnValue("idle"),
      isBusy: vi.fn().mockReturnValue(false),
    };

    const set = vi.fn();

    const contextEngine: ContextEngineContract = {
      set: set as ContextEngineContract["set"],

      get: vi.fn() as <T extends ContextValue>(
        key: string,
      ) => T | undefined,

      has: vi.fn().mockReturnValue(false),

      remove: vi.fn().mockReturnValue(false),

      clear: vi.fn(),

      createSnapshot: vi.fn().mockReturnValue({
        requestId: "request-1",
        createdAt: now,
        entries: new Map(),
      } satisfies ContextSnapshot),
    };

    const bridge = new MemoryContextBridge(
      memoryEngine,
      contextEngine,
    );

    const result = await bridge.hydrate();

    expect(set).toHaveBeenCalledTimes(1);

    expect(set).toHaveBeenCalledWith(
      "memory.user.preference",
      "dark mode",
      "memory",
    );

    expect(result.entries).toEqual([
      entries[0],
    ]);

    expect(result.hydratedCount).toBe(1);
  });

  it("removes previously hydrated memory before rehydrating current memory", async () => {
    const firstEntries: readonly MemoryEntry[] = [
      {
        id: "memory-old",
        type: "long-term",
        key: "user.preference",
        value: "old value",
        source: "user",
        metadata: {
          importance: 0.8,
          confidence: 1,
          accessCount: 0,
        },
        createdAt: 1000,
        updatedAt: 1000,
      },
    ];

    const secondEntries: readonly MemoryEntry[] = [
      {
        id: "memory-new",
        type: "long-term",
        key: "user.name",
        value: "Alex",
        source: "user",
        metadata: {
          importance: 0.9,
          confidence: 1,
          accessCount: 0,
        },
        createdAt: 2000,
        updatedAt: 2000,
      },
    ];

    const query = vi
      .fn()
      .mockResolvedValueOnce(firstEntries)
      .mockResolvedValueOnce(secondEntries);

    const memoryEngine: MemoryEngineContract = {
      write: vi.fn(),
      get: vi.fn(),
      query,
      remove: vi.fn(),
      clear: vi.fn(),
      getStatus: vi.fn().mockReturnValue("idle"),
      isBusy: vi.fn().mockReturnValue(false),
    };

    const set = vi.fn();
    const remove = vi.fn().mockReturnValue(true);

    const contextEngine: ContextEngineContract = {
      set: set as ContextEngineContract["set"],

      get: vi.fn() as <T extends ContextValue>(
        key: string,
      ) => T | undefined,

      has: vi.fn().mockReturnValue(false),

      remove,

      clear: vi.fn(),

      createSnapshot: vi.fn().mockReturnValue({
        requestId: "request-1",
        createdAt: 3000,
        entries: new Map(),
      } satisfies ContextSnapshot),
    };

    const bridge = new MemoryContextBridge(
      memoryEngine,
      contextEngine,
    );

    await bridge.hydrate();

    expect(remove).not.toHaveBeenCalled();

    await bridge.hydrate();

    expect(query).toHaveBeenCalledTimes(2);

    expect(remove).toHaveBeenCalledTimes(1);

    expect(remove).toHaveBeenCalledWith(
      "memory.user.preference",
    );

    expect(set).toHaveBeenCalledTimes(2);

    expect(set).toHaveBeenNthCalledWith(
      1,
      "memory.user.preference",
      "old value",
      "memory",
    );

    expect(set).toHaveBeenNthCalledWith(
      2,
      "memory.user.name",
      "Alex",
      "memory",
    );
  });
});
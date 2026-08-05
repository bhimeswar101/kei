import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { storage } from "@/core/storage";

import {
  LocalMemoryRepository,
} from "../LocalMemoryRepository";

import type {
  MemoryEntry,
} from "../types";

describe("LocalMemoryRepository", () => {
  const repository =
    new LocalMemoryRepository();

  let storedEntries: MemoryEntry[];

  beforeEach(() => {
    storedEntries = [];

    vi.spyOn(storage, "get").mockImplementation(
      () => storedEntries,
    );

    vi.spyOn(storage, "set").mockImplementation(
      (_key, value) => {
        storedEntries = [
          ...(value as MemoryEntry[]),
        ];
      },
    );

    vi.spyOn(storage, "remove").mockImplementation(
      () => {
        storedEntries = [];
      },
    );
  });

  it("persists and retrieves a memory entry", async () => {
    const entry: MemoryEntry = {
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
    };

    await repository.save(entry);

    const result =
      await repository.get("memory-1");

    expect(result).toEqual(entry);
  });

  it("replaces an existing entry with the same id", async () => {
    const original: MemoryEntry = {
      id: "memory-1",
      type: "working",
      key: "task",
      value: "old",
      source: "system",
      metadata: {
        importance: 0.5,
        confidence: 1,
        accessCount: 0,
      },
      createdAt: 1000,
      updatedAt: 1000,
    };

    const updated: MemoryEntry = {
      ...original,
      value: "new",
      updatedAt: 2000,
    };

    await repository.save(original);
    await repository.save(updated);

    const results =
      await repository.query({});

    expect(results).toHaveLength(1);
    expect(results[0]).toEqual(updated);
  });

  it("filters memory entries using query criteria", async () => {
    const entries: MemoryEntry[] = [
      {
        id: "memory-1",
        type: "long-term",
        key: "preference",
        value: "coffee",
        source: "user",
        metadata: {
          importance: 0.9,
          confidence: 0.95,
          accessCount: 0,
        },
        createdAt: 1000,
        updatedAt: 1000,
      },
      {
        id: "memory-2",
        type: "short-term",
        key: "preference",
        value: "tea",
        source: "assistant",
        metadata: {
          importance: 0.4,
          confidence: 0.8,
          accessCount: 0,
        },
        createdAt: 2000,
        updatedAt: 2000,
      },
    ];

    for (const entry of entries) {
      await repository.save(entry);
    }

    const results =
      await repository.query({
        key: "preference",
        type: "long-term",
        source: "user",
        minimumImportance: 0.8,
        minimumConfidence: 0.9,
      });

    expect(results).toEqual([entries[0]]);
  });

  it("removes an existing memory entry", async () => {
    const entry: MemoryEntry = {
      id: "memory-1",
      type: "working",
      key: "active-task",
      value: "test",
      source: "system",
      metadata: {
        importance: 0.5,
        confidence: 1,
        accessCount: 0,
      },
      createdAt: 1000,
      updatedAt: 1000,
    };

    await repository.save(entry);

    expect(
      await repository.remove(entry.id),
    ).toBe(true);

    expect(
      await repository.get(entry.id),
    ).toBeUndefined();
  });

  it("clears only the requested memory type", async () => {
    const working: MemoryEntry = {
      id: "working-1",
      type: "working",
      key: "task",
      value: "temporary",
      source: "system",
      metadata: {
        importance: 0.5,
        confidence: 1,
        accessCount: 0,
      },
      createdAt: 1000,
      updatedAt: 1000,
    };

    const longTerm: MemoryEntry = {
      id: "long-term-1",
      type: "long-term",
      key: "preference",
      value: "persistent",
      source: "user",
      metadata: {
        importance: 0.9,
        confidence: 1,
        accessCount: 0,
      },
      createdAt: 2000,
      updatedAt: 2000,
    };

    await repository.save(working);
    await repository.save(longTerm);

    await repository.clear("working");

    const results =
      await repository.query({});

    expect(results).toEqual([longTerm]);
  });

  it("clears all memory entries", async () => {
    const entry: MemoryEntry = {
      id: "memory-1",
      type: "short-term",
      key: "temporary",
      value: true,
      source: "system",
      metadata: {
        importance: 0.5,
        confidence: 1,
        accessCount: 0,
      },
      createdAt: 1000,
      updatedAt: 1000,
    };

    await repository.save(entry);

    await repository.clear();

    expect(
      await repository.query({}),
    ).toEqual([]);
  });
});

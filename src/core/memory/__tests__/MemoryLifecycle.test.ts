import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  MemoryLifecycle,
} from "../MemoryLifecycle";

import type {
  MemoryRepositoryContract,
} from "../MemoryRepository";

import type {
  MemoryEntry,
} from "../types";

const createEntry = (
  overrides: Partial<MemoryEntry> = {},
): MemoryEntry => ({
  id: "memory-1",

  type: "short-term",

  key: "conversation.latest",

  value: {
    userMessage: "Hello",
    assistantMessage: "Hi",
  },

  source: "assistant",

  metadata: {
    importance: 0.8,
    confidence: 1,
    accessCount: 0,
    ...overrides.metadata,
  },

  createdAt: 1_000,

  updatedAt: 1_000,

  ...overrides,
});

describe(
  "MemoryLifecycle",
  () => {
    it(
      "identifies an expired memory",
      () => {
        const repository:
          MemoryRepositoryContract = {
            save: vi.fn(),
            get: vi.fn(),
            query: vi.fn(),
            remove: vi.fn(),
            clear: vi.fn(),
          };

        const lifecycle =
          new MemoryLifecycle(repository);

        const entry =
          createEntry({
            metadata: {
              importance: 0.8,
              confidence: 1,
              accessCount: 0,
              expiresAt: 900,
            },
          });

        expect(
          lifecycle.isExpired(
            entry,
            1_000,
          ),
        ).toBe(true);
      },
    );

    it(
      "does not expire a memory without an expiration time",
      () => {
        const repository:
          MemoryRepositoryContract = {
            save: vi.fn(),
            get: vi.fn(),
            query: vi.fn(),
            remove: vi.fn(),
            clear: vi.fn(),
          };

        const lifecycle =
          new MemoryLifecycle(repository);

        const entry =
          createEntry();

        expect(
          lifecycle.isExpired(
            entry,
            1_000,
          ),
        ).toBe(false);
      },
    );

    it(
      "does not expire a memory whose expiration time is in the future",
      () => {
        const repository:
          MemoryRepositoryContract = {
            save: vi.fn(),
            get: vi.fn(),
            query: vi.fn(),
            remove: vi.fn(),
            clear: vi.fn(),
          };

        const lifecycle =
          new MemoryLifecycle(repository);

        const entry =
          createEntry({
            metadata: {
              importance: 0.8,
              confidence: 1,
              accessCount: 0,
              expiresAt: 2_000,
            },
          });

        expect(
          lifecycle.isExpired(
            entry,
            1_000,
          ),
        ).toBe(false);
      },
    );

    it(
      "removes expired memories",
      async () => {
        const expiredEntry =
          createEntry({
            id: "expired-memory",
            metadata: {
              importance: 0.5,
              confidence: 1,
              accessCount: 0,
              expiresAt: 900,
            },
          });

        const activeEntry =
          createEntry({
            id: "active-memory",
            metadata: {
              importance: 0.8,
              confidence: 1,
              accessCount: 0,
              expiresAt: 2_000,
            },
          });

        const query =
          vi.fn().mockResolvedValue([
            expiredEntry,
            activeEntry,
          ]);

        const remove =
          vi.fn().mockResolvedValue(true);

        const repository:
          MemoryRepositoryContract = {
            save: vi.fn(),
            get: vi.fn(),
            query,
            remove,
            clear: vi.fn(),
          };

        const lifecycle =
          new MemoryLifecycle(repository);

        const removedCount =
          await lifecycle.cleanupExpired(
            1_000,
          );

        expect(
          query,
        ).toHaveBeenCalledWith({});

        expect(
          remove,
        ).toHaveBeenCalledTimes(1);

        expect(
          remove,
        ).toHaveBeenCalledWith(
          "expired-memory",
        );

        expect(
          removedCount,
        ).toBe(1);
      },
    );

    it(
      "returns zero when no memories are expired",
      async () => {
        const query =
          vi.fn().mockResolvedValue([
            createEntry({
              metadata: {
                importance: 0.8,
                confidence: 1,
                accessCount: 0,
                expiresAt: 2_000,
              },
            }),
          ]);

        const remove =
          vi.fn();

        const repository:
          MemoryRepositoryContract = {
            save: vi.fn(),
            get: vi.fn(),
            query,
            remove,
            clear: vi.fn(),
          };

        const lifecycle =
          new MemoryLifecycle(repository);

        const removedCount =
          await lifecycle.cleanupExpired(
            1_000,
          );

        expect(
          remove,
        ).not.toHaveBeenCalled();

        expect(
          removedCount,
        ).toBe(0);
      },
    );

    it(
      "does not count a memory when repository removal fails",
      async () => {
        const expiredEntry =
          createEntry({
            id: "expired-memory",
            metadata: {
              importance: 0.5,
              confidence: 1,
              accessCount: 0,
              expiresAt: 900,
            },
          });

        const query =
          vi.fn().mockResolvedValue([
            expiredEntry,
          ]);

        const remove =
          vi.fn().mockResolvedValue(false);

        const repository:
          MemoryRepositoryContract = {
            save: vi.fn(),
            get: vi.fn(),
            query,
            remove,
            clear: vi.fn(),
          };

        const lifecycle =
          new MemoryLifecycle(repository);

        const removedCount =
          await lifecycle.cleanupExpired(
            1_000,
          );

        expect(
          remove,
        ).toHaveBeenCalledWith(
          "expired-memory",
        );

        expect(
          removedCount,
        ).toBe(0);
      },
    );
  },
);
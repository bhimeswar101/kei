import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  KeiMemoryEngine,
} from "../KeiMemoryEngine";

import type {
  MemoryEntryFactoryContract,
} from "../MemoryEntryFactory";

import type {
  MemoryEntryValidator,
} from "../MemoryEntryValidator";

import type {
  MemoryRepositoryContract,
} from "../MemoryRepository";

import type {
  MemoryEntry,
  MemoryWriteInput,
} from "../types";

describe("KeiMemoryEngine", () => {
  it("validates, creates, and persists a memory entry", async () => {
    const input: MemoryWriteInput<string> = {
      type: "long-term",
      key: "user.name",
      value: "Alex",
      source: "user",
      importance: 0.9,
      confidence: 1,
    };

    const entry: MemoryEntry<string> = {
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

    const repository: MemoryRepositoryContract = {
      save: vi.fn().mockResolvedValue(undefined),
      get: vi.fn(),
      query: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    };

    const factory: MemoryEntryFactoryContract = {
      create: vi.fn().mockReturnValue(entry),
    };

    const validator = {
      validate: vi.fn().mockReturnValue({
        valid: true,
      }),
    } as unknown as MemoryEntryValidator;

    const engine = new KeiMemoryEngine(
      repository,
      factory,
      validator,
    );

    expect(engine.getStatus()).toBe("idle");
    expect(engine.isBusy()).toBe(false);

    const result = await engine.write(input);

    expect(validator.validate).toHaveBeenCalledTimes(1);
    expect(validator.validate).toHaveBeenCalledWith(input);

    expect(factory.create).toHaveBeenCalledTimes(1);
    expect(factory.create).toHaveBeenCalledWith(input);

    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledWith(entry);

    expect(result).toBe(entry);

    expect(engine.getStatus()).toBe("idle");
    expect(engine.isBusy()).toBe(false);
  });

  it("rejects invalid memory before creation or persistence", async () => {
    const input: MemoryWriteInput<string> = {
      type: "long-term",
      key: "",
      value: "Alex",
      source: "user",
    };

    const repository: MemoryRepositoryContract = {
      save: vi.fn(),
      get: vi.fn(),
      query: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    };

    const factory: MemoryEntryFactoryContract = {
      create: vi.fn(),
    };

    const validator = {
      validate: vi.fn().mockReturnValue({
        valid: false,
        error: "Memory key must not be empty.",
      }),
    } as unknown as MemoryEntryValidator;

    const engine = new KeiMemoryEngine(
      repository,
      factory,
      validator,
    );

    await expect(
      engine.write(input),
    ).rejects.toThrow(
      "Memory key must not be empty.",
    );

    expect(
      validator.validate,
    ).toHaveBeenCalledWith(input);

    expect(
      factory.create,
    ).not.toHaveBeenCalled();

    expect(
      repository.save,
    ).not.toHaveBeenCalled();

    expect(engine.getStatus()).toBe("error");
    expect(engine.isBusy()).toBe(false);
  });

  it("retrieves a memory entry through the repository", async () => {
    const entry: MemoryEntry<string> = {
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

    const repository: MemoryRepositoryContract = {
      save: vi.fn(),
      get: vi.fn().mockResolvedValue(entry),
      query: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    };

    const factory: MemoryEntryFactoryContract = {
      create: vi.fn(),
    };

    const validator = {
      validate: vi.fn(),
    } as unknown as MemoryEntryValidator;

    const engine = new KeiMemoryEngine(
      repository,
      factory,
      validator,
    );

    expect(engine.getStatus()).toBe("idle");

    const result =
      await engine.get<string>("memory-1");

    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(repository.get).toHaveBeenCalledWith(
      "memory-1",
    );

    expect(result).toBe(entry);

    expect(factory.create).not.toHaveBeenCalled();
    expect(validator.validate).not.toHaveBeenCalled();

    expect(engine.getStatus()).toBe("idle");
    expect(engine.isBusy()).toBe(false);
  });
  it("queries memory entries through the repository", async () => {
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
        type: "long-term",
        key: "preference",
        value: "tea",
        source: "user",
        metadata: {
          importance: 0.8,
          confidence: 0.9,
          accessCount: 0,
        },
        createdAt: 2000,
        updatedAt: 2000,
      },
    ];

    const repository: MemoryRepositoryContract = {
      save: vi.fn(),
      get: vi.fn(),
      query: vi.fn().mockResolvedValue(entries),
      remove: vi.fn(),
      clear: vi.fn(),
    };

    const factory: MemoryEntryFactoryContract = {
      create: vi.fn(),
    };

    const validator = {
      validate: vi.fn(),
    } as unknown as MemoryEntryValidator;

    const engine = new KeiMemoryEngine(
      repository,
      factory,
      validator,
    );

    const query = {
      type: "long-term" as const,
      source: "user" as const,
      minimumImportance: 0.8,
      limit: 2,
    };

    expect(engine.getStatus()).toBe("idle");

    const result =
      await engine.query(query);

    expect(repository.query).toHaveBeenCalledTimes(1);
    expect(repository.query).toHaveBeenCalledWith(query);

    expect(result).toBe(entries);

    expect(factory.create).not.toHaveBeenCalled();
    expect(validator.validate).not.toHaveBeenCalled();

    expect(engine.getStatus()).toBe("idle");
    expect(engine.isBusy()).toBe(false);
  });
  it("removes a memory entry through the repository", async () => {
    const repository: MemoryRepositoryContract = {
      save: vi.fn(),
      get: vi.fn(),
      query: vi.fn(),
      remove: vi.fn().mockResolvedValue(true),
      clear: vi.fn(),
    };

    const factory: MemoryEntryFactoryContract = {
      create: vi.fn(),
    };

    const validator = {
      validate: vi.fn(),
    } as unknown as MemoryEntryValidator;

    const engine = new KeiMemoryEngine(
      repository,
      factory,
      validator,
    );

    expect(engine.getStatus()).toBe("idle");

    const result =
      await engine.remove("memory-1");

    expect(repository.remove).toHaveBeenCalledTimes(1);
    expect(repository.remove).toHaveBeenCalledWith(
      "memory-1",
    );

    expect(result).toBe(true);

    expect(factory.create).not.toHaveBeenCalled();
    expect(validator.validate).not.toHaveBeenCalled();

    expect(engine.getStatus()).toBe("idle");
    expect(engine.isBusy()).toBe(false);
  });

  it("clears a requested memory type through the repository", async () => {
    const repository: MemoryRepositoryContract = {
      save: vi.fn(),
      get: vi.fn(),
      query: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn().mockResolvedValue(undefined),
    };

    const factory: MemoryEntryFactoryContract = {
      create: vi.fn(),
    };

    const validator = {
      validate: vi.fn(),
    } as unknown as MemoryEntryValidator;

    const engine = new KeiMemoryEngine(
      repository,
      factory,
      validator,
    );

    expect(engine.getStatus()).toBe("idle");

    await engine.clear("short-term");

    expect(repository.clear).toHaveBeenCalledTimes(1);
    expect(repository.clear).toHaveBeenCalledWith(
      "short-term",
    );

    expect(factory.create).not.toHaveBeenCalled();
    expect(validator.validate).not.toHaveBeenCalled();

    expect(engine.getStatus()).toBe("idle");
    expect(engine.isBusy()).toBe(false);
  });
  it("enters the error state when the repository fails", async () => {
    const repositoryError =
      new Error("Memory repository failure.");

    const repository: MemoryRepositoryContract = {
      save: vi.fn(),
      get: vi.fn().mockRejectedValue(repositoryError),
      query: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    };

    const factory: MemoryEntryFactoryContract = {
      create: vi.fn(),
    };

    const validator = {
      validate: vi.fn(),
    } as unknown as MemoryEntryValidator;

    const engine = new KeiMemoryEngine(
      repository,
      factory,
      validator,
    );

    expect(engine.getStatus()).toBe("idle");

    await expect(
      engine.get("memory-1"),
    ).rejects.toBe(repositoryError);

    expect(repository.get).toHaveBeenCalledTimes(1);
    expect(repository.get).toHaveBeenCalledWith(
      "memory-1",
    );

    expect(engine.getStatus()).toBe("error");
    expect(engine.isBusy()).toBe(false);

    expect(factory.create).not.toHaveBeenCalled();
    expect(validator.validate).not.toHaveBeenCalled();
  });});





import {
  BaseMemoryEngine,
} from "./MemoryEngine";

import {
  memoryEntryFactory,
} from "./MemoryEntryFactory";

import {
  memoryEntryValidator,
} from "./MemoryEntryValidator";

import {
  memoryRepository,
} from "./LocalMemoryRepository";

import type {
  MemoryEntryFactoryContract,
} from "./MemoryEntryFactory";

import type {
  MemoryEntryValidator,
} from "./MemoryEntryValidator";

import type {
  MemoryRepositoryContract,
} from "./MemoryRepository";

import type {
  MemoryEntry,
  MemoryQuery,
  MemoryType,
  MemoryValue,
  MemoryWriteInput,
} from "./types";

export class KeiMemoryEngine
  extends BaseMemoryEngine
{
  private readonly repository:
    MemoryRepositoryContract;

  private readonly factory:
    MemoryEntryFactoryContract;

  private readonly validator:
    MemoryEntryValidator;

  constructor(
    repository: MemoryRepositoryContract =
      memoryRepository,
    factory: MemoryEntryFactoryContract =
      memoryEntryFactory,
    validator: MemoryEntryValidator =
      memoryEntryValidator,
  ) {
    super();

    this.repository = repository;
    this.factory = factory;
    this.validator = validator;
  }

  async write<T extends MemoryValue>(
    input: MemoryWriteInput<T>,
  ): Promise<MemoryEntry<T>> {
    this.status = "writing";

    try {
      const validation =
        this.validator.validate(input);

      if (!validation.valid) {
        throw new Error(
          validation.error ??
            "Memory entry validation failed.",
        );
      }

      const entry =
        this.factory.create(input);

      await this.repository.save(entry);

      this.status = "idle";

      return entry;
    } catch (error) {
      this.status = "error";

      throw error;
    }
  }

  async get<T extends MemoryValue>(
    id: string,
  ): Promise<MemoryEntry<T> | undefined> {
    this.status = "reading";

    try {
      const entry =
        await this.repository.get<T>(id);

      this.status = "idle";

      return entry;
    } catch (error) {
      this.status = "error";

      throw error;
    }
  }

  async query(
    query: MemoryQuery,
  ): Promise<readonly MemoryEntry[]> {
    this.status = "reading";

    try {
      const entries =
        await this.repository.query(query);

      this.status = "idle";

      return entries;
    } catch (error) {
      this.status = "error";

      throw error;
    }
  }

  async remove(
    id: string,
  ): Promise<boolean> {
    this.status = "writing";

    try {
      const removed =
        await this.repository.remove(id);

      this.status = "idle";

      return removed;
    } catch (error) {
      this.status = "error";

      throw error;
    }
  }

  async clear(
    type?: MemoryType,
  ): Promise<void> {
    this.status = "writing";

    try {
      await this.repository.clear(type);

      this.status = "idle";
    } catch (error) {
      this.status = "error";

      throw error;
    }
  }
}

export const memoryEngine =
  new KeiMemoryEngine();

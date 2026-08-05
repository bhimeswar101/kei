import type { MemoryEntry, MemoryValue, MemoryWriteInput } from "./types";

export interface MemoryEntryFactoryContract {
  create<T extends MemoryValue>(input: MemoryWriteInput<T>): MemoryEntry<T>;
}

export class MemoryEntryFactory implements MemoryEntryFactoryContract {
  create<T extends MemoryValue>(input: MemoryWriteInput<T>): MemoryEntry<T> {
    const timestamp = Date.now();

    return {
      id: crypto.randomUUID(),

      type: input.type,

      key: input.key,

      value: input.value,

      source: input.source,

      metadata: {
        importance: input.importance ?? 0.5,

        confidence: input.confidence ?? 1,

        accessCount: 0,

        expiresAt: input.expiresAt,
      },

      createdAt: timestamp,

      updatedAt: timestamp,
    };
  }
}

export const memoryEntryFactory = new MemoryEntryFactory();

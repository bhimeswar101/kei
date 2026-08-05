import type {
  MemoryEntry,
  MemoryQuery,
  MemoryType,
  MemoryValue,
} from "./types";

export interface MemoryRepositoryContract {
  save<T extends MemoryValue>(
    entry: MemoryEntry<T>,
  ): Promise<void>;

  get<T extends MemoryValue>(
    id: string,
  ): Promise<MemoryEntry<T> | undefined>;

  query(
    query: MemoryQuery,
  ): Promise<readonly MemoryEntry[]>;

  remove(
    id: string,
  ): Promise<boolean>;

  clear(
    type?: MemoryType,
  ): Promise<void>;
}

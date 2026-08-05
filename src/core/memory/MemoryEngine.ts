import type {
  MemoryEngineContract,
  MemoryEntry,
  MemoryQuery,
  MemoryStatus,
  MemoryType,
  MemoryValue,
  MemoryWriteInput,
} from "./types";

export abstract class BaseMemoryEngine
  implements MemoryEngineContract
{
  protected status: MemoryStatus = "idle";

  abstract write<T extends MemoryValue>(
    input: MemoryWriteInput<T>,
  ): Promise<MemoryEntry<T>>;

  abstract get<T extends MemoryValue>(
    id: string,
  ): Promise<MemoryEntry<T> | undefined>;

  abstract query(
    query: MemoryQuery,
  ): Promise<readonly MemoryEntry[]>;

  abstract remove(
    id: string,
  ): Promise<boolean>;

  abstract clear(
    type?: MemoryType,
  ): Promise<void>;

  getStatus(): MemoryStatus {
    return this.status;
  }

  isBusy(): boolean {
    return (
      this.status === "reading" ||
      this.status === "writing"
    );
  }
}
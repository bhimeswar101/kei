import type {
  ContextEntry,
  ContextSnapshot,
  ContextValue,
} from "./types";

export class ContextStore {
  private readonly entries = new Map<
    string,
    ContextEntry
  >();

  set<T extends ContextValue>(
    key: string,
    value: T,
    source = "system",
  ): void {
    const entry: ContextEntry<T> = {
      key,
      value,
      source,
      timestamp: Date.now(),
    };

    this.entries.set(key, entry);
  }

  get<T extends ContextValue>(
    key: string,
  ): T | undefined {
    const entry = this.entries.get(key);

    if (!entry) {
      return undefined;
    }

    return entry.value as T;
  }

  has(key: string): boolean {
    return this.entries.has(key);
  }

  remove(key: string): boolean {
    return this.entries.delete(key);
  }

  clear(): void {
    this.entries.clear();
  }

  createSnapshot(
    requestId: string,
  ): ContextSnapshot {
    return {
      requestId,
      createdAt: Date.now(),
      entries: new Map(this.entries),
    };
  }
}
export type MemoryType =
  | "working"
  | "short-term"
  | "long-term";

export type MemoryStatus =
  | "idle"
  | "reading"
  | "writing"
  | "error";

export type MemorySource =
  | "user"
  | "assistant"
  | "system"
  | "execution";

export type MemoryValue =
  | string
  | number
  | boolean
  | null
  | object;

export interface MemoryEntry<T = MemoryValue> {
  readonly id: string;

  readonly type: MemoryType;

  readonly key: string;

  readonly value: T;

  readonly source: MemorySource;

  readonly createdAt: number;

  readonly updatedAt: number;
}

export interface MemoryQuery {
  readonly key?: string;

  readonly type?: MemoryType;

  readonly source?: MemorySource;

  readonly limit?: number;
}

export interface MemoryWriteInput<T = MemoryValue> {
  readonly type: MemoryType;

  readonly key: string;

  readonly value: T;

  readonly source: MemorySource;
}

export interface MemoryEngineContract {
  write<T extends MemoryValue>(
    input: MemoryWriteInput<T>,
  ): Promise<MemoryEntry<T>>;

  get<T extends MemoryValue>(
    id: string,
  ): Promise<MemoryEntry<T> | undefined>;

  query(
    query: MemoryQuery,
  ): Promise<readonly MemoryEntry[]>;

  remove(id: string): Promise<boolean>;

  clear(type?: MemoryType): Promise<void>;

  getStatus(): MemoryStatus;

  isBusy(): boolean;
}
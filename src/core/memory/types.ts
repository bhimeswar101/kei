export type MemoryType = "working" | "short-term" | "long-term";

export type MemoryStatus = "idle" | "reading" | "writing" | "error";

export type MemorySource = "user" | "assistant" | "system" | "execution";

export type MemoryValue = string | number | boolean | null | object;

export interface MemoryMetadata {
  readonly importance: number;

  readonly confidence: number;

  readonly accessCount: number;

  readonly lastAccessedAt?: number;

  readonly expiresAt?: number;
}

export interface MemoryEntry<T = MemoryValue> {
  readonly id: string;

  readonly type: MemoryType;

  readonly key: string;

  readonly value: T;

  readonly source: MemorySource;

  readonly metadata: MemoryMetadata;

  readonly createdAt: number;

  readonly updatedAt: number;
}

export type MemoryQueryOrder =
  | "oldest-first"
  | "newest-first";

export interface MemoryQuery {
  readonly key?: string;

  readonly type?: MemoryType;

  readonly source?: MemorySource;

  readonly minimumImportance?: number;

  readonly minimumConfidence?: number;

  readonly order?: MemoryQueryOrder;

  readonly limit?: number;
}

export interface MemoryWriteInput<T = MemoryValue> {
  readonly type: MemoryType;

  readonly key: string;

  readonly value: T;

  readonly source: MemorySource;

  readonly importance?: number;

  readonly confidence?: number;

  readonly expiresAt?: number;
}

export interface MemoryEngineContract {
  write<T extends MemoryValue>(input: MemoryWriteInput<T>): Promise<MemoryEntry<T>>;

  get<T extends MemoryValue>(id: string): Promise<MemoryEntry<T> | undefined>;

  query(query: MemoryQuery): Promise<readonly MemoryEntry[]>;

  remove(id: string): Promise<boolean>;

  clear(type?: MemoryType): Promise<void>;

  getStatus(): MemoryStatus;

  isBusy(): boolean;
}

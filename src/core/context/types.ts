export type ContextValue = string | number | boolean | null | undefined | object;

export interface ContextEntry<T = ContextValue> {
  readonly key: string;

  readonly value: T;

  readonly source: string;

  readonly timestamp: number;
}

export interface ContextSnapshot {
  readonly requestId: string;

  readonly createdAt: number;

  readonly entries: ReadonlyMap<string, ContextEntry>;
}

export interface ContextEngineContract {
  set<T extends ContextValue>(key: string, value: T, source?: string): void;

  get<T extends ContextValue>(key: string): T | undefined;

  has(key: string): boolean;

  remove(key: string): boolean;

  clear(): void;

  createSnapshot(requestId: string): ContextSnapshot;
}

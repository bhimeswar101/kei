import type { StorageAdapter } from "./types";

export class Storage {
  private readonly adapter: StorageAdapter;

  constructor(adapter: StorageAdapter) {
    this.adapter = adapter;
  }

  get<T>(key: string): T | null {
    return this.adapter.get<T>(key);
  }

  set<T>(key: string, value: T): void {
    this.adapter.set(key, value);
  }

  remove(key: string): void {
    this.adapter.remove(key);
  }

  has(key: string): boolean {
    return this.adapter.has(key);
  }

  clear(): void {
    this.adapter.clear();
  }
}
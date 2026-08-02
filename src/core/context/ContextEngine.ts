import { ContextStore } from "./ContextStore";

import type { ContextEngineContract, ContextSnapshot, ContextValue } from "./types";

export class ContextEngine implements ContextEngineContract {
  private readonly store: ContextStore;

  constructor(store: ContextStore = new ContextStore()) {
    this.store = store;
  }

  set<T extends ContextValue>(key: string, value: T, source = "system"): void {
    this.store.set(key, value, source);
  }

  get<T extends ContextValue>(key: string): T | undefined {
    return this.store.get<T>(key);
  }

  has(key: string): boolean {
    return this.store.has(key);
  }

  remove(key: string): boolean {
    return this.store.remove(key);
  }

  clear(): void {
    this.store.clear();
  }

  createSnapshot(requestId: string): ContextSnapshot {
    return this.store.createSnapshot(requestId);
  }
}

export const contextEngine = new ContextEngine();

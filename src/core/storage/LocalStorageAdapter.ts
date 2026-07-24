import type { StorageAdapter } from "./types";

export class LocalStorageAdapter implements StorageAdapter {
  private readonly prefix: string;

constructor(prefix = "kei:") {
  this.prefix = prefix;
}

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  get<T>(key: string): T | null {
    const value = localStorage.getItem(this.getKey(key));

    if (value === null) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    localStorage.setItem(
      this.getKey(key),
      JSON.stringify(value),
    );
  }

  remove(key: string): void {
    localStorage.removeItem(this.getKey(key));
  }

  has(key: string): boolean {
    return localStorage.getItem(this.getKey(key)) !== null;
  }

  clear(): void {
    const keysToRemove: string[] = [];

    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);

      if (key?.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }

    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
  }
}
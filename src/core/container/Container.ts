import type { ServiceKey } from "./types";

export class Container {
  private readonly services = new Map<ServiceKey, unknown>();

  register<T>(key: ServiceKey, service: T): void {
    if (this.services.has(key)) {
      throw new Error(`Service "${String(key)}" is already registered.`);
    }

    this.services.set(key, service);
  }

  resolve<T>(key: ServiceKey): T {
    if (!this.services.has(key)) {
      throw new Error(`Service "${String(key)}" is not registered.`);
    }

    return this.services.get(key) as T;
  }

  has(key: ServiceKey): boolean {
    return this.services.has(key);
  }

  unregister(key: ServiceKey): boolean {
    return this.services.delete(key);
  }

  clear(): void {
    this.services.clear();
  }
}
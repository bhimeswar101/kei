import type {
  ServiceMetadata,
  ServiceRegistration,
  ServiceRegistryContract,
  ServiceStatus,
} from "./types";

export class ServiceRegistry
  implements ServiceRegistryContract
{
  private readonly services = new Map<
    string,
    ServiceRegistration
  >();

  register<T>(
    metadata: ServiceMetadata,
    instance: T,
  ): void {
    if (this.services.has(metadata.id)) {
      throw new Error(
        `Service "${metadata.id}" is already registered.`,
      );
    }

    this.services.set(metadata.id, {
      metadata,
      instance,
      status: "registered",
      registeredAt: new Date().toISOString(),
    });
  }

  unregister(id: string): boolean {
    return this.services.delete(id);
  }

  get<T>(id: string): T | undefined {
    const registration = this.services.get(id);

    return registration?.instance as T | undefined;
  }

  getRegistration<T>(
    id: string,
  ): ServiceRegistration<T> | undefined {
    return this.services.get(id) as
      | ServiceRegistration<T>
      | undefined;
  }

  has(id: string): boolean {
    return this.services.has(id);
  }

  getStatus(id: string): ServiceStatus | undefined {
    return this.services.get(id)?.status;
  }

  setStatus(
    id: string,
    status: ServiceStatus,
  ): void {
    const registration = this.services.get(id);

    if (!registration) {
      throw new Error(
        `Service "${id}" is not registered.`,
      );
    }

    registration.status = status;
  }

  list(): ServiceRegistration[] {
    return [...this.services.values()];
  }

  clear(): void {
    this.services.clear();
  }
}

export const serviceRegistry =
  new ServiceRegistry();
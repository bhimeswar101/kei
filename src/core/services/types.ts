export type ServiceStatus =
  | "registered"
  | "starting"
  | "running"
  | "stopping"
  | "stopped"
  | "error";

export interface ServiceMetadata {
  id: string;
  name: string;
  version?: string;
  description?: string;
}

export interface ServiceRegistration<T = unknown> {
  metadata: ServiceMetadata;
  instance: T;
  status: ServiceStatus;
  registeredAt: string;
}

export interface ServiceRegistryContract {
  register<T>(
    metadata: ServiceMetadata,
    instance: T,
  ): void;

  unregister(id: string): boolean;

  get<T>(id: string): T | undefined;

  getRegistration<T>(
    id: string,
  ): ServiceRegistration<T> | undefined;

  has(id: string): boolean;

  getStatus(id: string): ServiceStatus | undefined;

  setStatus(
    id: string,
    status: ServiceStatus,
  ): void;

  list(): ServiceRegistration[];

  clear(): void;
}
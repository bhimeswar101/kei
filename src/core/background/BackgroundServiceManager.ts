import { ErrorCodes, handleError } from "@/core/errors";

import type { BackgroundService, BackgroundServiceManagerContract } from "./types";

export class BackgroundServiceManager implements BackgroundServiceManagerContract {
  private readonly services = new Map<string, BackgroundService>();

  register(service: BackgroundService): void {
    if (this.services.has(service.id)) {
      throw new Error(`Background service "${service.id}" is already registered.`);
    }

    this.services.set(service.id, service);
  }

  unregister(id: string): void {
    const service = this.services.get(id);

    if (!service) {
      return;
    }

    if (service.isRunning()) {
      throw new Error(`Cannot unregister running background service "${id}".`);
    }

    this.services.delete(id);
  }

  get(id: string): BackgroundService | undefined {
    return this.services.get(id);
  }

  getAll(): BackgroundService[] {
    return Array.from(this.services.values());
  }

  async start(id: string): Promise<void> {
    const service = this.services.get(id);

    if (!service) {
      throw new Error(`Background service "${id}" is not registered.`);
    }

    try {
      await service.start();
    } catch (error) {
      const appError = handleError(error, {
        code: ErrorCodes.BACKGROUND_SERVICE,
        context: {
          serviceId: id,
          operation: "start",
        },
      });

      throw appError;
    }
  }

  async stop(id: string): Promise<void> {
    const service = this.services.get(id);

    if (!service) {
      throw new Error(`Background service "${id}" is not registered.`);
    }

    try {
      await service.stop();
    } catch (error) {
      const appError = handleError(error, {
        code: ErrorCodes.BACKGROUND_SERVICE,
        context: {
          serviceId: id,
          operation: "stop",
        },
      });

      throw appError;
    }
  }

  async startAll(): Promise<void> {
    const startedServices: BackgroundService[] = [];

    try {
      for (const service of this.services.values()) {
        await this.start(service.id);

        startedServices.push(service);
      }
    } catch (error) {
      for (let index = startedServices.length - 1; index >= 0; index--) {
        const service = startedServices[index];

        if (!service) {
          continue;
        }

        try {
          await this.stop(service.id);
        } catch (rollbackError) {
          handleError(rollbackError, {
            code: ErrorCodes.BACKGROUND_SERVICE,
            context: {
              serviceId: service.id,
              operation: "rollback",
            },
          });
        }
      }

      throw error;
    }
  }

  async stopAll(): Promise<void> {
    const services = Array.from(this.services.values()).reverse();

    const errors: unknown[] = [];

    for (const service of services) {
      try {
        await this.stop(service.id);
      } catch (error) {
        errors.push(error);
      }
    }

    if (errors.length > 0) {
      const appError = handleError(
        new Error(`Failed to stop ${errors.length} background service(s).`),
        {
          code: ErrorCodes.BACKGROUND_SERVICE,
          context: {
            operation: "stopAll",
            failureCount: errors.length,
          },
        },
      );

      throw appError;
    }
  }
}

export const backgroundServiceManager = new BackgroundServiceManager();

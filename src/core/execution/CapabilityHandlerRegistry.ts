import type { CapabilityDefinition } from "@/core/capabilities";

import type { CapabilityHandlerContract } from "./CapabilityHandler";

export class CapabilityHandlerRegistry {
  private readonly handlers = new Map<string, CapabilityHandlerContract>();

  register(handler: CapabilityHandlerContract): void {
    if (this.handlers.has(handler.capabilityId)) {
      throw new Error(`A handler for capability "${handler.capabilityId}" is already registered.`);
    }

    this.handlers.set(handler.capabilityId, handler);
  }

  unregister(capabilityId: string): boolean {
    return this.handlers.delete(capabilityId);
  }

  get(capabilityId: string): CapabilityHandlerContract | undefined {
    return this.handlers.get(capabilityId);
  }

  resolve(capability: CapabilityDefinition): CapabilityHandlerContract | undefined {
    const handler = this.handlers.get(capability.id);

    if (!handler || !handler.canHandle(capability)) {
      return undefined;
    }

    return handler;
  }

  has(capabilityId: string): boolean {
    return this.handlers.has(capabilityId);
  }

  getAll(): readonly CapabilityHandlerContract[] {
    return Array.from(this.handlers.values());
  }

  clear(): void {
    this.handlers.clear();
  }
}

export const capabilityHandlerRegistry = new CapabilityHandlerRegistry();

import type { CapabilityDefinition, CapabilityId } from "./types";

export class CapabilityRegistry {
  private readonly capabilities = new Map<CapabilityId, CapabilityDefinition>();

  register(capability: CapabilityDefinition): void {
    if (this.capabilities.has(capability.id)) {
      throw new Error(`Capability "${capability.id}" is already registered.`);
    }

    this.capabilities.set(capability.id, capability);
  }

  unregister(id: CapabilityId): boolean {
    return this.capabilities.delete(id);
  }

  get(id: CapabilityId): CapabilityDefinition | undefined {
    return this.capabilities.get(id);
  }

  has(id: CapabilityId): boolean {
    return this.capabilities.has(id);
  }

  getAll(): readonly CapabilityDefinition[] {
    return Array.from(this.capabilities.values());
  }

  clear(): void {
    this.capabilities.clear();
  }
}

export const capabilityRegistry = new CapabilityRegistry();

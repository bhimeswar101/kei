import { builtinCapabilities } from "./BuiltinCapabilities";
import { capabilityRegistry } from "./CapabilityRegistry";

export function registerBuiltinCapabilities(): void {
  for (const capability of builtinCapabilities) {
    if (capabilityRegistry.has(capability.id)) {
      continue;
    }

    capabilityRegistry.register(capability);
  }
}

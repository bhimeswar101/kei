import type { IntelligenceContext } from "@/core/intelligence";

import type { CapabilityQuery, CapabilityResolution, CapabilityResolverContract } from "./types";

export abstract class BaseCapabilityResolver implements CapabilityResolverContract {
  abstract resolve(
    context: IntelligenceContext,
    query: CapabilityQuery,
  ): Promise<CapabilityResolution>;
}

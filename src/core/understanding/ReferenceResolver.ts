import type { IntelligenceContext } from "@/core/intelligence";

import type { RequestReference } from "./types";

export interface ReferenceResolverContract {
  resolve(
    context: IntelligenceContext,
    normalizedText: string,
  ): Promise<readonly RequestReference[]>;
}

export abstract class ReferenceResolver implements ReferenceResolverContract {
  abstract resolve(
    context: IntelligenceContext,
    normalizedText: string,
  ): Promise<readonly RequestReference[]>;
}

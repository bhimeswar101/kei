import type { IntelligenceContext } from "@/core/intelligence";

import type { RequestEntity } from "./types";

export interface EntityExtractorContract {
  extract(context: IntelligenceContext, normalizedText: string): Promise<readonly RequestEntity[]>;
}

export abstract class EntityExtractor implements EntityExtractorContract {
  abstract extract(
    context: IntelligenceContext,
    normalizedText: string,
  ): Promise<readonly RequestEntity[]>;
}

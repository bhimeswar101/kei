import { EntityExtractor } from "./EntityExtractor";

import type { IntelligenceContext } from "@/core/intelligence";

import type { RequestEntity } from "./types";

export class RuleEntityExtractor extends EntityExtractor {
  async extract(
    _context: IntelligenceContext,
    normalizedText: string,
  ): Promise<readonly RequestEntity[]> {
    const application = this.extractApplication(normalizedText);

    if (!application) {
      return [];
    }

    return [application];
  }

  private extractApplication(normalizedText: string): RequestEntity | undefined {
    const match = normalizedText.match(/^(?:open|launch|start)\s+(.+)$/i);

    if (!match) {
      return undefined;
    }

    const value = match[1]?.trim();

    if (!value) {
      return undefined;
    }

    return {
      type: "application",
      value,
      raw: value,
      confidence: 0.95,
    };
  }
}

export const ruleEntityExtractor = new RuleEntityExtractor();

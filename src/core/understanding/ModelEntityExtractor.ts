import { aiProviderManager } from "@/core/ai";

import { EntityExtractor } from "./EntityExtractor";

import type { IntelligenceContext } from "@/core/intelligence";

import type { RequestEntity } from "./types";

export class ModelEntityExtractor extends EntityExtractor {
  async extract(
    context: IntelligenceContext,
    normalizedText: string,
  ): Promise<readonly RequestEntity[]> {
    const provider = aiProviderManager.getActive();

    await provider.send({
      text: this.buildPrompt(context, normalizedText),
    });

    return [];
  }

  private buildPrompt(context: IntelligenceContext, normalizedText: string): string {
    return [
      "Extract important entities from the user's request.",
      "",
      "Possible entity types include:",
      "- application",
      "- person",
      "- location",
      "- date",
      "- time",
      "- task",
      "- file",
      "- website",
      "- device",
      "- media",
      "- query",
      "",
      `Request ID: ${context.requestId}`,
      `User request: ${normalizedText}`,
    ].join("\n");
  }
}

export const modelEntityExtractor = new ModelEntityExtractor();

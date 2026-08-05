import { aiProviderManager } from "@/core/ai";

import { deterministicResponseFallback } from "./DeterministicResponseFallback";

import { responseContentBuilder } from "./ResponseContentBuilder";

import { responseNormalizer } from "./ResponseNormalizer";

import { responseSuccessResolver } from "./ResponseSuccessResolver";

import type {
  AIResponseGeneratorContract,
  GeneratedAIResponse,
  ResponseSynthesisInput,
} from "./types";

export class AIResponseGenerator implements AIResponseGeneratorContract {
  async generate(input: ResponseSynthesisInput): Promise<GeneratedAIResponse> {
    const content = responseContentBuilder.build(input);

    const provider = aiProviderManager.getActive();

    try {
      const response = await provider.send({
        text: content.content,
      });

      return responseNormalizer.normalize({
        text: response.text,

        grounded: content.grounded,

        strategy: content.strategy,

        success: responseSuccessResolver.resolve(content.strategy),

        source: "provider",
      });
    } catch {
      return responseNormalizer.normalize(deterministicResponseFallback.generate(input));
    }
  }
}

export const aiResponseGenerator = new AIResponseGenerator();

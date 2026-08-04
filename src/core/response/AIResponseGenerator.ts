import {
  aiProviderManager,
} from "@/core/ai";

import {
  responseContentBuilder,
} from "./ResponseContentBuilder";

import type {
  AIResponseGeneratorContract,
  GeneratedAIResponse,
  ResponseSynthesisInput,
} from "./types";


export class AIResponseGenerator
  implements AIResponseGeneratorContract
{
  async generate(
    input: ResponseSynthesisInput,
  ): Promise<GeneratedAIResponse> {
    const content =
      responseContentBuilder.build(
        input,
      );

    const provider =
      aiProviderManager.getActive();

    const response =
      await provider.send({
        text: content.content,
      });

    return {
      text: response.text,

      grounded:
        content.grounded,

      strategy:
        content.strategy,
    };
  }
}

export const aiResponseGenerator =
  new AIResponseGenerator();
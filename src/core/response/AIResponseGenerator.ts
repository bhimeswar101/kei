import {
  aiProviderManager,
} from "@/core/ai";

import {
  responseContentBuilder,
} from "./ResponseContentBuilder";
import {
  deterministicResponseFallback,
} from "./DeterministicResponseFallback";
import type {
  AIResponseGeneratorContract,
  GeneratedAIResponse,
  ResponseSynthesisInput,
} from "./types";
import {
  responseNormalizer,
} from "./ResponseNormalizer";

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

  try {
    const response =
      await provider.send({
        text: content.content,
      });

    return responseNormalizer.normalize({
  text: response.text,

  grounded:
    content.grounded,

  strategy:
    content.strategy,
});
  } catch {
    return responseNormalizer.normalize(
  deterministicResponseFallback.generate(
    input,
  ),
);
  }
}
}

export const aiResponseGenerator =
  new AIResponseGenerator();
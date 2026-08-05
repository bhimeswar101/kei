import type { GeneratedAIResponse, SynthesizedResponse } from "./types";

export interface ResponseAssemblerContract {
  assemble(requestId: string, response: GeneratedAIResponse): SynthesizedResponse;
}

export class ResponseAssembler implements ResponseAssemblerContract {
  assemble(requestId: string, response: GeneratedAIResponse): SynthesizedResponse {
    return {
      requestId,

      text: response.text,

      strategy: response.strategy,

      source: response.source,

      success: response.success,

      grounded: response.grounded,

      fallbackUsed: response.source === "fallback",

      metadata: {
        assembledAt: new Date(),
      },
    };
  }
}

export const responseAssembler = new ResponseAssembler();

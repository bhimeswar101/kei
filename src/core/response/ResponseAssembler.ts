import type {
  GeneratedAIResponse,
  ResponseSource,
  SynthesizedResponse,
} from "./types";

export interface ResponseAssemblerContract {
  assemble(
    requestId: string,
    response: GeneratedAIResponse,
  ): SynthesizedResponse;
}

export class ResponseAssembler
  implements ResponseAssemblerContract
{
  assemble(
    requestId: string,
    response: GeneratedAIResponse,
  ): SynthesizedResponse {
    return {
      requestId,

      text: response.text,

      strategy: response.strategy,

      source:
        this.resolveSource(
          response,
        ),

      success: response.success,

      grounded:
        response.grounded,

      fallbackUsed:
        response.strategy !==
        "conversation" &&
        response.strategy !==
        "execution-success",

      metadata: {
        assembledAt:
          new Date(),
      },
    };
  }

  private resolveSource(
    response: GeneratedAIResponse,
  ): ResponseSource {
    if (
      response.strategy ===
      "conversation"
    ) {
      return "provider";
    }

    if (
      response.strategy ===
      "execution-success"
    ) {
      return "provider";
    }

    return "fallback";
  }
}

export const responseAssembler =
  new ResponseAssembler();
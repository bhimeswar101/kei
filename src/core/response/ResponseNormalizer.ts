import type {
  GeneratedAIResponse,
} from "./types";

export interface ResponseNormalizerContract {
  normalize(
    response: GeneratedAIResponse,
  ): GeneratedAIResponse;
}

export class ResponseNormalizer
  implements ResponseNormalizerContract
{
  normalize(
    response: GeneratedAIResponse,
  ): GeneratedAIResponse {
    return {
      ...response,

      text: this.normalizeText(
        response.text,
      ),
    };
  }

  private normalizeText(
    text: string,
  ): string {
    const normalized =
      text
        .replace(/\r\n/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    return (
      normalized ||
      "I'm sorry, but I couldn't generate a response."
    );
  }
}

export const responseNormalizer =
  new ResponseNormalizer();
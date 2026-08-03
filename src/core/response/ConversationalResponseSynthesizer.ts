import {
  responseStrategyResolver,
} from "./ResponseStrategyResolver";

import type {
  ConversationalResponse,
  ConversationalResponseSynthesizerContract,
  ResponseSynthesisInput,
} from "./types";

export class ConversationalResponseSynthesizer
  implements ConversationalResponseSynthesizerContract
{
  synthesize(
    input: ResponseSynthesisInput,
  ): ConversationalResponse {
    const strategy =
      responseStrategyResolver.resolve(
        input,
      );

    if (strategy !== "conversation") {
      throw new Error(
        `Response strategy "${strategy}" is not conversational.`,
      );
    }

    const originalText =
      input.originalText?.trim();

    if (!originalText) {
      throw new Error(
        "Conversational response synthesis requires text input.",
      );
    }

    return {
      strategy: "conversation",

      success: true,

      grounded: false,

      originalText,

      context:
        this.buildContext(
          originalText,
        ),
    };
  }

  private buildContext(
    originalText: string,
  ): string {
    return [
      "You are responding as Kei.",
      "",
      "User request:",
      originalText,
      "",
      "Respond naturally and helpfully.",
      "Answer the user's request directly.",
      "Do not claim that an external action was performed.",
    ].join("\n");
  }
}

export const conversationalResponseSynthesizer =
  new ConversationalResponseSynthesizer();
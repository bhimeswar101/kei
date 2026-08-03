import {
  responseStrategyResolver,
} from "./ResponseStrategyResolver";

import type {
  RejectionUnsupportedResponse,
  RejectionUnsupportedResponseSynthesizerContract,
  ResponseSynthesisInput,
} from "./types";

export class RejectionUnsupportedResponseSynthesizer
  implements RejectionUnsupportedResponseSynthesizerContract
{
  synthesize(
    input: ResponseSynthesisInput,
  ): RejectionUnsupportedResponse {
    const strategy =
      responseStrategyResolver.resolve(
        input,
      );

    if (
      strategy !== "rejection" &&
      strategy !== "unsupported"
    ) {
      throw new Error(
        `Response strategy "${strategy}" is not rejection or unsupported.`,
      );
    }

    const originalText =
      input.originalText?.trim();

    const reason =
      input.intelligence.decision.reason;

    return {
      strategy,

      success: false,

      grounded: false,

      originalText,

      reason,

      context:
        this.buildContext({
          strategy,
          originalText,
          reason,
        }),
    };
  }

  private buildContext(
    input: {
      readonly strategy:
        | "rejection"
        | "unsupported";

      readonly originalText?: string;

      readonly reason?: string;
    },
  ): string {
    const lines: string[] = [
      "You are responding as Kei.",
      "",
    ];

    if (
      input.strategy === "rejection"
    ) {
      lines.push(
        "The request was intentionally rejected.",
      );
    } else {
      lines.push(
        "The request cannot currently be fulfilled by Kei.",
      );
    }

    if (input.originalText) {
      lines.push(
        "",
        "User request:",
        input.originalText,
      );
    }

    if (input.reason) {
      lines.push(
        "",
        "Reason:",
        input.reason,
      );
    }

    lines.push(
      "",
      input.strategy === "rejection"
        ? "Explain the rejection clearly and concisely."
        : "Explain the current limitation clearly and concisely.",
      "Do not claim that an external action was performed.",
      "Do not claim success.",
      "Do not invent capabilities that Kei does not have.",
    );

    return lines.join("\n");
  }
}

export const rejectionUnsupportedResponseSynthesizer =
  new RejectionUnsupportedResponseSynthesizer();
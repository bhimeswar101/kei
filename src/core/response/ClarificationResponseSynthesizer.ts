import {
  responseStrategyResolver,
} from "./ResponseStrategyResolver";

import type {
  ClarificationResponse,
  ClarificationResponseSynthesizerContract,
  ResponseSynthesisInput,
} from "./types";

export class ClarificationResponseSynthesizer
  implements ClarificationResponseSynthesizerContract
{
  synthesize(
    input: ResponseSynthesisInput,
  ): ClarificationResponse {
    const strategy =
      responseStrategyResolver.resolve(
        input,
      );

    if (strategy !== "clarification") {
      throw new Error(
        `Response strategy "${strategy}" is not clarification.`,
      );
    }

    const originalText =
      input.originalText?.trim();

    if (!originalText) {
      throw new Error(
        "Clarification response synthesis requires text input.",
      );
    }

    const {
      decision,
      understanding,
    } = input.intelligence;

    const unresolvedReferences =
      understanding.references
        .filter(
          (reference) =>
            !reference.resolved,
        )
        .map(
          (reference) =>
            reference.expression,
        );

    return {
      strategy: "clarification",

      success: true,

      grounded: false,

      originalText,

      reason:
        decision.reason,

      unresolvedReferences,

      requiresContext:
        understanding.requiresContext,

      context:
        this.buildContext({
          originalText,
          reason:
            decision.reason,
          unresolvedReferences,
          requiresContext:
            understanding.requiresContext,
        }),
    };
  }

  private buildContext(
    input: {
      readonly originalText: string;

      readonly reason?: string;

      readonly unresolvedReferences:
        readonly string[];

      readonly requiresContext: boolean;
    },
  ): string {
    const lines: string[] = [
      "You are responding as Kei.",
      "",
      "The user's request requires clarification.",
      "",
      "User request:",
      input.originalText,
    ];

    if (input.reason) {
      lines.push(
        "",
        "Clarification reason:",
        input.reason,
      );
    }

    if (
      input.unresolvedReferences.length >
      0
    ) {
      lines.push(
        "",
        "Unresolved references:",
        input.unresolvedReferences.join(
          ", ",
        ),
      );
    }

    if (input.requiresContext) {
      lines.push(
        "",
        "Additional context is required.",
      );
    }

    lines.push(
      "",
      "Ask one concise and helpful clarification question.",
      "Do not pretend to know missing information.",
      "Do not claim that an external action was performed.",
    );

    return lines.join("\n");
  }
}

export const clarificationResponseSynthesizer =
  new ClarificationResponseSynthesizer();
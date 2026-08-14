import {
  clarificationResponseSynthesizer,
} from "./ClarificationResponseSynthesizer";

import { personalityManager } from "@/core/personality";

import {
  conversationalResponseSynthesizer,
} from "./ConversationalResponseSynthesizer";

import {
  executionAwareResponseSynthesizer,
} from "./ExecutionAwareResponseSynthesizer";

import {
  failureCancellationResponseSynthesizer,
} from "./FailureCancellationResponseSynthesizer";

import {
  rejectionUnsupportedResponseSynthesizer,
} from "./RejectionUnsupportedResponseSynthesizer";

import {
  responseGroundingGuard,
} from "./ResponseGroundingGuard";

import {
  responseStrategyResolver,
} from "./ResponseStrategyResolver";

import type {
  ResponseContent,
  ResponseContentBuilderContract,
  ResponseSynthesisInput,
} from "./types";

export class ResponseContentBuilder
  implements ResponseContentBuilderContract
{
  build(
    input: ResponseSynthesisInput,
  ): ResponseContent {
    const strategy =
      responseStrategyResolver.resolve(
        input,
      );

    responseGroundingGuard.assertStrategyGrounding(
      input,
      strategy,
    );

    switch (strategy) {
      case "conversation":
        return this.buildConversation(
          input,
        );

      case "clarification":
        return this.buildClarification(
          input,
        );

      case "rejection":
      case "unsupported":
        return this.buildRejectionOrUnsupported(
          input,
        );

      case "execution-success":
        return this.buildExecutionSuccess(
          input,
        );

      case "execution-failure":
      case "cancelled":
        return this.buildFailureOrCancellation(
          input,
        );

      case "deferred":
        return this.buildDeferred(
          input,
        );
    }
  }

  private buildConversation(
    input: ResponseSynthesisInput,
  ): ResponseContent {
    const response =
      conversationalResponseSynthesizer.synthesize(
        input,
      );

    return {
      strategy: response.strategy,
      content: response.context,
      grounded: response.grounded,
      requiresProvider: true,
    };
  }

  private buildClarification(
    input: ResponseSynthesisInput,
  ): ResponseContent {
    const response =
      clarificationResponseSynthesizer.synthesize(
        input,
      );

    return {
      strategy: response.strategy,
      content: response.context,
      grounded: response.grounded,
      requiresProvider: true,
    };
  }

  private buildRejectionOrUnsupported(
    input: ResponseSynthesisInput,
  ): ResponseContent {
    const response =
      rejectionUnsupportedResponseSynthesizer.synthesize(
        input,
      );

    return {
      strategy: response.strategy,
      content: response.context,
      grounded: response.grounded,
      requiresProvider: true,
    };
  }

  private buildExecutionSuccess(
    input: ResponseSynthesisInput,
  ): ResponseContent {
    const response =
      executionAwareResponseSynthesizer.synthesize(
        input,
      );

    if (
      response.strategy !==
      "execution-success"
    ) {
      throw new Error(
        `Expected execution-success response but received "${response.strategy}".`,
      );
    }

    const originalText =
      input.originalText?.trim();

    const detailLines: string[] = [
      "The requested action completed successfully during verified execution.",
    ];

    if (originalText) {
      detailLines.push(
        "",
        "User request:",
        originalText,
      );
    }

    detailLines.push(
      "",
      "Verified execution summary:",
      response.summary,
      "",
      "Confirm the successful action naturally and concisely.",
      "Base the response only on the verified execution information above.",
      "Do not invent additional actions or results.",
      "Do not claim that an unexecuted step was completed.",
    );

    const prompt = personalityManager.buildSystemPrompt(detailLines.join("\n"));

    return {
      strategy: response.strategy,
      content: prompt,
      grounded: response.grounded,
      requiresProvider: true,
    };
  }

  private buildFailureOrCancellation(
    input: ResponseSynthesisInput,
  ): ResponseContent {
    const response =
      failureCancellationResponseSynthesizer.synthesize(
        input,
      );

    return {
      strategy: response.strategy,
      content: response.context,
      grounded: response.grounded,
      requiresProvider: true,
    };
  }

  private buildDeferred(
    input: ResponseSynthesisInput,
  ): ResponseContent {
    const response =
      executionAwareResponseSynthesizer.synthesize(
        input,
      );

    if (response.strategy !== "deferred") {
      throw new Error(
        `Expected deferred response but received "${response.strategy}".`,
      );
    }

    const detailLines = [
      "The requested action has not completed yet.",
      "",
      "Verified execution summary:",
      response.summary,
      "",
      "Respond briefly without claiming success, failure, or cancellation.",
      "Do not invent an execution outcome.",
    ];

    const prompt = personalityManager.buildSystemPrompt(detailLines.join("\n"));

    return {
      strategy: response.strategy,
      content: prompt,
      grounded: response.grounded,
      requiresProvider: true,
    };
  }
}

export const responseContentBuilder =
  new ResponseContentBuilder();
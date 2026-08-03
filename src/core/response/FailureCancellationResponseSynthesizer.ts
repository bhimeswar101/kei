import {
  executionAwareResponseSynthesizer,
} from "./ExecutionAwareResponseSynthesizer";

import type {
  FailureCancellationResponse,
  FailureCancellationResponseSynthesizerContract,
  ResponseSynthesisInput,
} from "./types";

export class FailureCancellationResponseSynthesizer
  implements FailureCancellationResponseSynthesizerContract
{
  synthesize(
    input: ResponseSynthesisInput,
  ): FailureCancellationResponse {
    const executionResponse =
      executionAwareResponseSynthesizer.synthesize(
        input,
      );

    if (
      executionResponse.strategy !==
        "execution-failure" &&
      executionResponse.strategy !==
        "cancelled"
    ) {
      throw new Error(
        `Response strategy "${executionResponse.strategy}" is not failure or cancellation.`,
      );
    }

    const failedStep =
      executionResponse.interpretation.steps.find(
        (step) =>
          step.status === "failed",
      );

    const error =
      executionResponse.error ??
      failedStep?.error;

    return {
      strategy:
        executionResponse.strategy,

      success: false,

      grounded: true,

      summary:
        executionResponse.summary,

      error,

      failedStepId:
        failedStep?.stepId,

      failedCapabilityId:
        failedStep?.capabilityId,

      context:
        this.buildContext({
          strategy:
            executionResponse.strategy,

          originalText:
            input.originalText?.trim(),

          summary:
            executionResponse.summary,

          error,

          failedCapabilityName:
            failedStep?.capabilityName,
        }),
    };
  }

  private buildContext(
    input: {
      readonly strategy:
        | "execution-failure"
        | "cancelled";

      readonly originalText?: string;

      readonly summary: string;

      readonly error?: string;

      readonly failedCapabilityName?:
        string;
    },
  ): string {
    const lines: string[] = [
      "You are responding as Kei.",
      "",
    ];

    if (
      input.strategy ===
      "execution-failure"
    ) {
      lines.push(
        "The requested action failed during verified execution.",
      );
    } else {
      lines.push(
        "The requested action was cancelled during verified execution.",
      );
    }

    if (input.originalText) {
      lines.push(
        "",
        "User request:",
        input.originalText,
      );
    }

    lines.push(
      "",
      "Verified execution summary:",
      input.summary,
    );

    if (
      input.failedCapabilityName
    ) {
      lines.push(
        "",
        "Failed capability:",
        input.failedCapabilityName,
      );
    }

    if (input.error) {
      lines.push(
        "",
        "Execution error:",
        input.error,
      );
    }

    lines.push(
      "",
      input.strategy ===
        "execution-failure"
        ? "Explain the execution failure naturally and concisely."
        : "Confirm the cancellation naturally and concisely.",
      "Base the response only on the verified execution information above.",
      "Do not claim that the action succeeded.",
      "Do not invent an execution error or cause.",
      "Do not claim that an unexecuted step was completed.",
    );

    return lines.join("\n");
  }
}

export const failureCancellationResponseSynthesizer =
  new FailureCancellationResponseSynthesizer();
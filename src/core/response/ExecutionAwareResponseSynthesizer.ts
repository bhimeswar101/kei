import {
  executionResultInterpreter,
} from "@/core/execution";
import {
  responseGroundingGuard,
} from "./ResponseGroundingGuard";
import {
  responseStrategyResolver,
} from "./ResponseStrategyResolver";

import type {
  ExecutionAwareResponse,
  ExecutionAwareResponseSynthesizerContract,
  ResponseSynthesisInput,
} from "./types";

export class ExecutionAwareResponseSynthesizer
  implements ExecutionAwareResponseSynthesizerContract
{
  synthesize(
    input: ResponseSynthesisInput,
  ): ExecutionAwareResponse {
    const execution =
      input.intelligence.execution;

    if (!execution) {
      throw new Error(
        "Execution-aware response synthesis requires an execution result.",
      );
    }

    const strategy =
      responseStrategyResolver.resolve(
        input,
      );

    if (
      strategy !==
        "execution-success" &&
      strategy !==
        "execution-failure" &&
      strategy !== "cancelled" &&
      strategy !== "deferred"
    ) {
      throw new Error(
        `Response strategy "${strategy}" is not execution-aware.`,
      );
    }
    responseGroundingGuard.assertStrategyGrounding(
  input,
  strategy,
);

    const interpretation =
      executionResultInterpreter.interpret(
        execution,
      );

    return {
      strategy,

      success:
        interpretation.succeeded,

      grounded: true,

      interpretation,

      summary:
        this.buildSummary(
          interpretation,
        ),

      error:
        interpretation.error,
    };
  }

  private buildSummary(
    interpretation:
      ExecutionAwareResponse["interpretation"],
  ): string {
    switch (interpretation.status) {
      case "succeeded":
        return this.buildSuccessSummary(
          interpretation,
        );

      case "failed":
        return this.buildFailureSummary(
          interpretation,
        );

      case "cancelled":
        return (
          "The requested action was cancelled."
        );

      case "incomplete":
        return (
          "The requested action has not completed yet."
        );
    }
  }

  private buildSuccessSummary(
    interpretation:
      ExecutionAwareResponse["interpretation"],
  ): string {
    const completed =
      interpretation.completedSteps;

    const total =
      interpretation.totalSteps;

    if (total <= 1) {
      return (
        "The requested action was completed successfully."
      );
    }

    return (
      `The requested action was completed successfully. ` +
      `${completed} of ${total} execution steps completed.`
    );
  }

  private buildFailureSummary(
    interpretation:
      ExecutionAwareResponse["interpretation"],
  ): string {
    if (interpretation.error) {
      return interpretation.error;
    }

    const stepError =
      interpretation.steps.find(
        (step) =>
          step.status === "failed" &&
          step.error,
      )?.error;

    return (
      stepError ??
      "The requested action could not be completed."
    );
  }
}

export const executionAwareResponseSynthesizer =
  new ExecutionAwareResponseSynthesizer();
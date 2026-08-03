import {
  executionResultInterpreter,
} from "@/core/execution";

import type {
  ExecutionInterpretation,
} from "@/core/execution";

import type {
  ExecutionResult,
} from "@/core/execution";

export interface AIResponseContextInput {
  readonly originalText?: string;

  readonly execution?: ExecutionResult;
}

export class AIResponseContextBuilder {
  build(
    input: AIResponseContextInput,
  ): string {
    const originalText =
      input.originalText?.trim();

    if (!originalText) {
      throw new Error(
        "AI response context requires text input.",
      );
    }

    const execution = input.execution;

    if (!execution) {
      return originalText;
    }

    const interpretation =
      executionResultInterpreter.interpret(
        execution,
      );

    const executionSummary =
      this.buildExecutionSummary(
        interpretation,
      );

    return [
      "You are responding as Kei.",
      "",
      "User request:",
      originalText,
      "",
      "Execution result:",
      executionSummary,
      "",
      "Respond naturally and concisely.",
      "Base your response on the execution result.",
      "Do not claim an action failed if execution succeeded.",
      "Do not claim an action succeeded if execution failed or was cancelled.",
    ].join("\n");
  }

  private buildExecutionSummary(
    interpretation:
      ExecutionInterpretation,
  ): string {
    const lines: string[] = [
      `Status: ${interpretation.status}`,
      `Succeeded: ${interpretation.succeeded}`,
      `Failed: ${interpretation.failed}`,
      `Cancelled: ${interpretation.cancelled}`,
      `Completed steps: ${interpretation.completedSteps}/${interpretation.totalSteps}`,
    ];

    if (interpretation.failedSteps > 0) {
      lines.push(
        `Failed steps: ${interpretation.failedSteps}`,
      );
    }

    if (interpretation.error) {
      lines.push(
        `Error: ${interpretation.error}`,
      );
    }

    for (
      const step of interpretation.steps
    ) {
      lines.push(
        [
          `Step ${step.stepId}:`,
          step.capabilityName,
          `(${step.capabilityId})`,
          `-> ${step.status}`,
        ].join(" "),
      );

      if (step.error) {
        lines.push(
          `Step error: ${step.error}`,
        );
      }

      const output =
        this.serializeOutput(
          step.output,
        );

      if (output) {
        lines.push(
          `Step output: ${output}`,
        );
      }
    }

    return lines.join("\n");
  }

  private serializeOutput(
    output: unknown,
  ): string | undefined {
    if (output === undefined) {
      return undefined;
    }

    if (typeof output === "string") {
      return output;
    }

    try {
      return JSON.stringify(output);
    } catch {
      return String(output);
    }
  }
}

export const aiResponseContextBuilder =
  new AIResponseContextBuilder();
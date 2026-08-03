import type { ExecutionResult } from "@/core/execution";

export interface AIResponseContextInput {
  readonly originalText?: string;

  readonly execution?: ExecutionResult;
}

export class AIResponseContextBuilder {
  build(input: AIResponseContextInput): string {
    const originalText = input.originalText?.trim();

    if (!originalText) {
      throw new Error("AI response context requires text input.");
    }

    const execution = input.execution;

    if (!execution) {
      return originalText;
    }

    const executionSummary = this.buildExecutionSummary(execution);

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
      "Do not claim an action failed if execution completed successfully.",
      "Do not claim an action succeeded if execution failed or was cancelled.",
    ].join("\n");
  }

  private buildExecutionSummary(execution: ExecutionResult): string {
    const lines: string[] = [`Status: ${execution.status}`];

    if (execution.error) {
      lines.push(`Error: ${execution.error}`);
    }

    for (const step of execution.steps) {
      lines.push(
        [
          `Step ${step.stepId}:`,
          step.capability.name,
          `(${step.capability.id})`,
          `-> ${step.status}`,
        ].join(" "),
      );

      if (step.error) {
        lines.push(`Step error: ${step.error}`);
      }

      const output = this.serializeOutput(step.output);

      if (output) {
        lines.push(`Step output: ${output}`);
      }
    }

    return lines.join("\n");
  }

  private serializeOutput(output: unknown): string | undefined {
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

export const aiResponseContextBuilder = new AIResponseContextBuilder();

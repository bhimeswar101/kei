import type { ExecutionResult, StepExecutionResult } from "./types";

export type ExecutionInterpretationStatus = "succeeded" | "failed" | "cancelled" | "incomplete";

export interface ExecutionStepInterpretation {
  readonly stepId: string;

  readonly capabilityId: string;

  readonly capabilityName: string;

  readonly status: StepExecutionResult["status"];

  readonly succeeded: boolean;

  readonly output?: unknown;

  readonly error?: string;
}

export interface ExecutionInterpretation {
  readonly status: ExecutionInterpretationStatus;

  readonly succeeded: boolean;

  readonly failed: boolean;

  readonly cancelled: boolean;

  readonly completedSteps: number;

  readonly failedSteps: number;

  readonly totalSteps: number;

  readonly error?: string;

  readonly steps: readonly ExecutionStepInterpretation[];
}

export class ExecutionResultInterpreter {
  interpret(execution: ExecutionResult): ExecutionInterpretation {
    const steps = execution.steps.map((step) => this.interpretStep(step));

    const completedSteps = steps.filter((step) => step.status === "completed").length;

    const failedSteps = steps.filter((step) => step.status === "failed").length;

    const status = this.resolveStatus(execution);

    return {
      status,

      succeeded: status === "succeeded",

      failed: status === "failed",

      cancelled: status === "cancelled",

      completedSteps,

      failedSteps,

      totalSteps: steps.length,

      error: execution.error,

      steps,
    };
  }

  private interpretStep(step: StepExecutionResult): ExecutionStepInterpretation {
    return {
      stepId: step.stepId,

      capabilityId: step.capability.id,

      capabilityName: step.capability.name,

      status: step.status,

      succeeded: step.status === "completed",

      output: step.output,

      error: step.error,
    };
  }

  private resolveStatus(execution: ExecutionResult): ExecutionInterpretationStatus {
    switch (execution.status) {
      case "completed":
        return "succeeded";

      case "failed":
        return "failed";

      case "cancelled":
        return "cancelled";

      case "idle":
      case "running":
        return "incomplete";
    }
  }
}

export const executionResultInterpreter = new ExecutionResultInterpreter();

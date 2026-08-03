import type {
  PlanStep,
} from "@/core/planning";

import type {
  StepExecutionResult,
} from "./types";

export interface StepExecutionValidationResult {
  readonly valid: boolean;

  readonly error?: string;
}

export class StepExecutionResultValidator {
  validate(
    step: PlanStep,
    result: StepExecutionResult,
  ): StepExecutionValidationResult {
    if (result.stepId !== step.id) {
      return {
        valid: false,
        error:
          `Execution result step ID "${result.stepId}" does not match expected step "${step.id}".`,
      };
    }

    if (
      result.capability.id !==
      step.capability.id
    ) {
      return {
        valid: false,
        error:
          `Execution result capability "${result.capability.id}" does not match expected capability "${step.capability.id}".`,
      };
    }

    if (
      result.status !== "completed" &&
      result.status !== "failed"
    ) {
      return {
        valid: false,
        error:
          `Execution handler returned non-terminal status "${result.status}" for step "${step.id}".`,
      };
    }

    if (
      result.status === "failed" &&
      !result.error
    ) {
      return {
        valid: false,
        error:
          `Failed execution step "${step.id}" did not provide an error.`,
      };
    }

    return {
      valid: true,
    };
  }
}

export const stepExecutionResultValidator =
  new StepExecutionResultValidator();
import {
  executionResultInterpreter,
} from "@/core/execution";

import type {
  ExecutionInterpretationStatus,
} from "@/core/execution";

import type {
  ResponseStrategy,
  ResponseSynthesisInput,
} from "./types";

export type ResponseGroundingRequirement =
  | "execution-grounded"
  | "non-execution";

export interface ResponseGroundingPolicy {
  readonly strategy: ResponseStrategy;

  readonly requirement:
    ResponseGroundingRequirement;

  readonly executionStatus?:
    ExecutionInterpretationStatus;

  readonly mayClaimExecutionSuccess:
    boolean;

  readonly mayClaimExecutionFailure:
    boolean;

  readonly mayClaimExecutionCancellation:
    boolean;

  readonly mayClaimExternalAction:
    boolean;

  readonly requiresVerifiedExecution:
    boolean;
}

export class ResponseGroundingGuard {
  resolvePolicy(
    input: ResponseSynthesisInput,
    strategy: ResponseStrategy,
  ): ResponseGroundingPolicy {
    const execution =
      input.intelligence.execution;

    if (!execution) {
      return this.resolveNonExecutionPolicy(
        strategy,
      );
    }

    const interpretation =
      executionResultInterpreter.interpret(
        execution,
      );

    return {
      strategy,

      requirement:
        "execution-grounded",

      executionStatus:
        interpretation.status,

      mayClaimExecutionSuccess:
        interpretation.status ===
        "succeeded",

      mayClaimExecutionFailure:
        interpretation.status ===
        "failed",

      mayClaimExecutionCancellation:
        interpretation.status ===
        "cancelled",

      mayClaimExternalAction:
        interpretation.status ===
          "succeeded" ||
        interpretation.status ===
          "failed" ||
        interpretation.status ===
          "cancelled",

      requiresVerifiedExecution: true,
    };
  }

  assertStrategyGrounding(
    input: ResponseSynthesisInput,
    strategy: ResponseStrategy,
  ): ResponseGroundingPolicy {
    const policy =
      this.resolvePolicy(
        input,
        strategy,
      );

    switch (strategy) {
      case "execution-success":
        if (
          !policy.mayClaimExecutionSuccess
        ) {
          throw new Error(
            "Response grounding violation: execution success cannot be claimed without verified successful execution.",
          );
        }

        break;

      case "execution-failure":
        if (
          !policy.mayClaimExecutionFailure
        ) {
          throw new Error(
            "Response grounding violation: execution failure cannot be claimed without verified failed execution.",
          );
        }

        break;

      case "cancelled":
        if (
          !policy.mayClaimExecutionCancellation
        ) {
          throw new Error(
            "Response grounding violation: cancellation cannot be claimed without verified cancelled execution.",
          );
        }

        break;

      case "conversation":
      case "clarification":
      case "rejection":
      case "unsupported":
        if (
          policy.requiresVerifiedExecution
        ) {
          throw new Error(
            `Response grounding violation: strategy "${strategy}" cannot ignore an available verified execution result.`,
          );
        }

        break;

      case "deferred":
        break;
    }

    return policy;
  }

  private resolveNonExecutionPolicy(
    strategy: ResponseStrategy,
  ): ResponseGroundingPolicy {
    return {
      strategy,

      requirement:
        "non-execution",

      mayClaimExecutionSuccess: false,

      mayClaimExecutionFailure: false,

      mayClaimExecutionCancellation:
        false,

      mayClaimExternalAction: false,

      requiresVerifiedExecution: false,
    };
  }
}

export const responseGroundingGuard =
  new ResponseGroundingGuard();
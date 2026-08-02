import type {
  CapabilityDefinition,
} from "@/core/capabilities";

import type {
  ExecutionPlan,
  PlanStep,
} from "@/core/planning";

export type ExecutionStatus =
  | "idle"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type StepExecutionStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "skipped";

export interface StepExecutionResult {
  readonly stepId: string;

  readonly capability:
    CapabilityDefinition;

  readonly status:
    StepExecutionStatus;

  readonly output?: unknown;

  readonly error?: string;

  readonly startedAt: Date;

  readonly completedAt?: Date;
}

export interface ExecutionResult {
  readonly requestId: string;

  readonly planId: string;

  readonly status: ExecutionStatus;

  readonly steps:
    readonly StepExecutionResult[];

  readonly startedAt: Date;

  readonly completedAt?: Date;

  readonly error?: string;
}

export interface ExecutionContext {
  readonly requestId: string;

  readonly plan: ExecutionPlan;

  readonly metadata?: Readonly<
    Record<string, unknown>
  >;
}

export interface StepExecutionContext {
  readonly requestId: string;

  readonly planId: string;

  readonly step: PlanStep;

  readonly previousResults:
    readonly StepExecutionResult[];
}

export interface ExecutionEngineContract {
  execute(
    context: ExecutionContext,
  ): Promise<ExecutionResult>;

  cancel(): Promise<void>;

  getStatus(): ExecutionStatus;
}
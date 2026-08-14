import type { ExecutionPlan } from "@/core/planning";
import type { StepExecutionResult, ExecutionResult } from "@/core/execution";

export type AgentState =
  | "idle"
  | "thinking"
  | "planning"
  | "executing"
  | "waiting"
  | "completed"
  | "failed"
  | "cancelled";

export interface AgentConfig {
  readonly maxIterations?: number;
  readonly timeoutMs?: number;
  readonly allowReplan?: boolean;
}

export interface AgentStepObservation {
  readonly stepId: string;
  readonly result: StepExecutionResult;
  readonly timestamp: Date;
}

export interface AgentTask {
  readonly id: string;
  readonly requestId: string;
  readonly goal: string;
  readonly state: AgentState;
  readonly currentPlan?: ExecutionPlan;
  readonly observations: readonly AgentStepObservation[];
  readonly startedAt: Date;
  readonly completedAt?: Date;
  readonly error?: string;
}

export interface AgentInstanceContract {
  readonly id: string;
  readonly requestId: string;
  getState(): AgentState;
  getTask(): AgentTask;
  run(initialPlan: ExecutionPlan): Promise<ExecutionResult>;
  cancel(): Promise<void>;
}

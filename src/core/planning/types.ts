import type {
  CapabilityDefinition,
} from "@/core/capabilities";

import type {
  IntelligenceContext,
} from "@/core/intelligence";
import type {
  RequestEntity,
} from "@/core/understanding";

export type PlanId = string;

export type PlanStatus =
  | "draft"
  | "ready"
  | "blocked"
  | "completed"
  | "failed";

export type PlanStepStatus =
  | "pending"
  | "ready"
  | "running"
  | "completed"
  | "failed"
  | "skipped";

export interface PlanStep {
  readonly id: string;

  readonly order: number;

  readonly capability:
    CapabilityDefinition;

  readonly description: string;

  readonly arguments: Readonly<
    Record<string, unknown>
  >;

  readonly dependencies:
    readonly string[];

  readonly status: PlanStepStatus;
}

export interface ExecutionPlan {
  readonly id: PlanId;

  readonly requestId: string;

  readonly goal: string;

  readonly steps: readonly PlanStep[];

  readonly status: PlanStatus;

  readonly requiresConfirmation: boolean;

  readonly createdAt: Date;
}

export interface PlanningInput {
  readonly requestId: string;

  readonly goal: string;

  readonly context: IntelligenceContext;

  readonly capability:
    CapabilityDefinition;

  readonly entities:
  readonly RequestEntity[];

  readonly metadata?: Readonly<
    Record<string, unknown>
  >;
}

export interface PlanningResult {
  readonly requestId: string;

  readonly success: boolean;

  readonly plan?: ExecutionPlan;

  readonly reason?: string;
}

export interface PlanningEngineContract {
  createPlan(
    input: PlanningInput,
  ): Promise<PlanningResult>;
}

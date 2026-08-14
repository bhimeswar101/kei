import { eventBus } from "@/core/events";
import { EVENTS } from "@/shared/constants/events";
import { executionEngine } from "@/core/execution";
import { planningEngine } from "@/core/planning";
import type { ExecutionPlan } from "@/core/planning";
import type { ExecutionResult, StepExecutionResult } from "@/core/execution";
import type {
  AgentConfig,
  AgentInstanceContract,
  AgentState,
  AgentStepObservation,
  AgentTask,
} from "./types";

export class AgentInstance implements AgentInstanceContract {
  readonly id: string;
  private state: AgentState = "idle";
  private currentPlan?: ExecutionPlan;
  private readonly observations: AgentStepObservation[] = [];
  private readonly startedAt: Date;
  private completedAt?: Date;
  private error?: string;
  private iterations = 0;
  private cancellationRequested = false;
  private lastExecutionResult?: ExecutionResult;

  private readonly maxIterations: number;
  private readonly timeoutMs: number;
  private readonly allowReplan: boolean;
  private timeoutTimer: NodeJS.Timeout | null = null;

  constructor(
    readonly requestId: string,
    readonly goal: string,
    config?: AgentConfig,
  ) {
    this.id = `${requestId}:agent`;
    this.startedAt = new Date();
    this.maxIterations = config?.maxIterations ?? 5;
    this.timeoutMs = config?.timeoutMs ?? 30000;
    this.allowReplan = config?.allowReplan ?? false;
  }

  getState(): AgentState {
    return this.state;
  }

  getTask(): AgentTask {
    return {
      id: this.id,
      requestId: this.requestId,
      goal: this.goal,
      state: this.state,
      currentPlan: this.currentPlan,
      observations: [...this.observations],
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      error: this.error,
    };
  }

  async run(initialPlan: ExecutionPlan): Promise<ExecutionResult> {
    if (this.state !== "idle") {
      throw new Error(`Cannot run agent from state "${this.state}".`);
    }

    this.currentPlan = initialPlan;
    this.transitionTo("thinking");
    await eventBus.emit(EVENTS.AGENT_STARTED, { taskId: this.id });

    this.timeoutTimer = setTimeout(() => {
      this.handleTimeout();
    }, this.timeoutMs);

    try {
      while (
        this.state !== "completed" &&
        this.state !== "failed" &&
        this.state !== "cancelled"
      ) {
        if (this.cancellationRequested) {
          this.transitionTo("cancelled");
          await eventBus.emit(EVENTS.AGENT_CANCELLED, { taskId: this.id });
          break;
        }

        if (this.iterations >= this.maxIterations) {
          this.error = "Maximum iterations limit reached.";
          this.transitionTo("failed");
          await eventBus.emit(EVENTS.AGENT_FAILED, {
            taskId: this.id,
            error: this.error,
          });
          break;
        }

        this.iterations++;

        const nextStep = this.currentPlan?.steps.find(
          (step) => step.status === "ready" || step.status === "pending",
        );

        if (!nextStep) {
          this.completedAt = new Date();
          this.transitionTo("completed");
          await eventBus.emit(EVENTS.AGENT_COMPLETED, { taskId: this.id });
          break;
        }

        this.transitionTo("executing");
        await eventBus.emit(EVENTS.AGENT_PROGRESS, {
          taskId: this.id,
          stepId: nextStep.id,
          description: nextStep.description,
        });

        const singleStepPlan: ExecutionPlan = {
          ...this.currentPlan!,
          steps: [{ ...nextStep, status: "ready" }],
        };

        const executionResult = await executionEngine.execute({
          requestId: this.requestId,
          plan: singleStepPlan,
        });

        this.lastExecutionResult = executionResult;
        const stepResult = executionResult.steps[0];
        const observation: AgentStepObservation = {
          stepId: nextStep.id,
          result: stepResult,
          timestamp: new Date(),
        };
        this.observations.push(observation);

        if (stepResult.status === "completed") {
          const updatedSteps = this.currentPlan!.steps.map((step) =>
            step.id === nextStep.id
              ? { ...step, status: "completed" as const }
              : step,
          );
          this.currentPlan = {
            ...this.currentPlan!,
            steps: updatedSteps,
          };
        } else if (
          stepResult.status === "cancelled" ||
          this.cancellationRequested
        ) {
          this.transitionTo("cancelled");
          await eventBus.emit(EVENTS.AGENT_CANCELLED, {
            taskId: this.id,
          });
          break;
        } else {
          const isMediumHighRisk =
            nextStep.capability.riskLevel === "medium" ||
            nextStep.capability.riskLevel === "high" ||
            nextStep.capability.requiresPermission;

          if (
            isMediumHighRisk ||
            !this.allowReplan
          ) {
            this.error =
              stepResult.error ??
              `Execution failed for step "${nextStep.id}".`;
            this.transitionTo("failed");
            await eventBus.emit(EVENTS.AGENT_FAILED, {
              taskId: this.id,
              error: this.error,
            });
            break;
          }

          try {
            this.transitionTo("planning");
            await eventBus.emit(EVENTS.AGENT_REPLANNED, {
              taskId: this.id,
              stepId: nextStep.id,
            });

            const planningResult = await planningEngine.createPlan({
              requestId: this.requestId,
              goal: this.goal,
              context: {
                requestId: this.requestId,
                input: {
                  id: `${this.requestId}:input`,
                  type: "text",
                  text: this.goal,
                  timestamp: new Date(),
                },
                context: {
                  requestId: this.requestId,
                  createdAt: Date.now(),
                  entries: new Map(),
                },
              },
              capability: nextStep.capability,
              entities: [],
              metadata: {
                failedStepId: nextStep.id,
                error: stepResult.error,
              },
            });

            if (planningResult.success && planningResult.plan) {
              this.currentPlan = planningResult.plan;
            } else {
              throw new Error(
                planningResult.reason ?? "Replanning failed.",
              );
            }
          } catch (replanError: any) {
            this.error = replanError.message || "Replanning failed.";
            this.transitionTo("failed");
            await eventBus.emit(EVENTS.AGENT_FAILED, {
              taskId: this.id,
              error: this.error,
            });
            break;
          }
        }
      }
    } catch (err: any) {
      this.error = err.message || "An unexpected error occurred.";
      this.transitionTo("failed");
      await eventBus.emit(EVENTS.AGENT_FAILED, {
        taskId: this.id,
        error: this.error,
      });
    } finally {
      if (this.timeoutTimer) {
        clearTimeout(this.timeoutTimer);
        this.timeoutTimer = null;
      }
    }

    if (
      this.currentPlan?.steps.length === 1 &&
      this.lastExecutionResult
    ) {
      (this.lastExecutionResult as any).status =
        this.state === "completed"
          ? "completed"
          : this.state === "cancelled"
            ? "cancelled"
            : "failed";
      if (this.error) {
        (this.lastExecutionResult as any).error =
          this.error;
      }
      return this.lastExecutionResult;
    }

    const finalSteps: StepExecutionResult[] = this.observations.map(
      (obs) => obs.result,
    );
    return {
      requestId: this.requestId,
      planId: this.currentPlan?.id ?? "unknown",
      status:
        this.state === "completed"
          ? "completed"
          : this.state === "cancelled"
            ? "cancelled"
            : "failed",
      steps: finalSteps,
      startedAt: this.startedAt,
      completedAt: new Date(),
      error: this.error,
    };
  }

  async cancel(): Promise<void> {
    this.cancellationRequested = true;
    await executionEngine.cancel();
  }

  private handleTimeout(): void {
    if (
      this.state === "completed" ||
      this.state === "failed" ||
      this.state === "cancelled"
    ) {
      return;
    }
    this.error = "Task execution timed out.";
    this.transitionTo("failed");
    void executionEngine.cancel();
    void eventBus.emit(EVENTS.AGENT_FAILED, {
      taskId: this.id,
      error: this.error,
    });
  }

  private transitionTo(state: AgentState): void {
    const validTransitions: Record<AgentState, AgentState[]> = {
      idle: ["thinking"],
      thinking: ["planning", "executing", "failed", "cancelled"],
      planning: ["executing", "failed", "cancelled"],
      executing: [
        "thinking",
        "planning",
        "waiting",
        "completed",
        "failed",
        "cancelled",
      ],
      waiting: ["executing", "failed", "cancelled"],
      completed: [],
      failed: [],
      cancelled: [],
    };

    const allowed = validTransitions[this.state];
    if (!allowed.includes(state)) {
      throw new Error(
        `Invalid agent state transition from "${this.state}" to "${state}".`,
      );
    }

    this.state = state;
  }
}

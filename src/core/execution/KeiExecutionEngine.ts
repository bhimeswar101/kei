import { capabilityHandlerRegistry } from "./CapabilityHandlerRegistry";
import { BaseExecutionEngine } from "./ExecutionEngine";

import type { ExecutionContext, ExecutionResult, StepExecutionResult } from "./types";

export class KeiExecutionEngine extends BaseExecutionEngine {
  async execute(context: ExecutionContext): Promise<ExecutionResult> {
    this.beginExecution();

    const startedAt = new Date();

    const stepResults: StepExecutionResult[] = [];

    try {
      for (const step of context.plan.steps) {
        // Stop before starting another step
        // if cancellation was requested.
        if (this.isCancellationRequested()) {
          this.cancelExecution();

          return {
            requestId: context.requestId,
            planId: context.plan.id,
            status: "cancelled",
            steps: stepResults,
            startedAt,
            completedAt: new Date(),
          };
        }

        // Verify dependencies before execution.
        const dependenciesSatisfied = step.dependencies.every((dependencyId) =>
          stepResults.some(
            (result) => result.stepId === dependencyId && result.status === "completed",
          ),
        );

        if (!dependenciesSatisfied) {
          const failedResult: StepExecutionResult = {
            stepId: step.id,

            capability: step.capability,

            status: "failed",

            error: "One or more step dependencies were not completed.",

            startedAt: new Date(),

            completedAt: new Date(),
          };

          stepResults.push(failedResult);

          this.failExecution();

          return {
            requestId: context.requestId,
            planId: context.plan.id,
            status: "failed",
            steps: stepResults,
            startedAt,
            completedAt: new Date(),
            error: failedResult.error,
          };
        }

        const handler = capabilityHandlerRegistry.resolve(step.capability);

        if (!handler) {
          const failedResult: StepExecutionResult = {
            stepId: step.id,

            capability: step.capability,

            status: "failed",

            error: `No execution handler is registered for capability "${step.capability.id}".`,

            startedAt: new Date(),

            completedAt: new Date(),
          };

          stepResults.push(failedResult);

          this.failExecution();

          return {
            requestId: context.requestId,
            planId: context.plan.id,
            status: "failed",
            steps: stepResults,
            startedAt,
            completedAt: new Date(),
            error: failedResult.error,
          };
        }

        const stepResult = await handler.execute({
          requestId: context.requestId,

          planId: context.plan.id,

          step,

          previousResults: stepResults,
        });

        stepResults.push(stepResult);

        if (stepResult.status === "failed") {
          this.failExecution();

          return {
            requestId: context.requestId,
            planId: context.plan.id,
            status: "failed",
            steps: stepResults,
            startedAt,
            completedAt: new Date(),
            error: stepResult.error ?? `Execution failed at step "${step.id}".`,
          };
        }
      }

      this.completeExecution();

      return {
        requestId: context.requestId,
        planId: context.plan.id,
        status: "completed",
        steps: stepResults,
        startedAt,
        completedAt: new Date(),
      };
    } catch (error) {
      this.failExecution();

      return {
        requestId: context.requestId,
        planId: context.plan.id,
        status: "failed",
        steps: stepResults,
        startedAt,
        completedAt: new Date(),

        error: error instanceof Error ? error.message : "Execution failed.",
      };
    }
  }
}

export const executionEngine = new KeiExecutionEngine();

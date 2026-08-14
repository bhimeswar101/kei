import { capabilityHandlerRegistry } from "./CapabilityHandlerRegistry";
import { BaseExecutionEngine } from "./ExecutionEngine";
import {
  stepExecutionResultValidator,
} from "./StepExecutionResultValidator";
import { eventBus } from "@/core/events";
import { EVENTS } from "@/shared/constants/events";

import type {
  ExecutionContext,
  ExecutionResult,
  StepExecutionResult,
} from "./types";

export class KeiExecutionEngine extends BaseExecutionEngine {
  async execute(
    context: ExecutionContext,
  ): Promise<ExecutionResult> {
    this.beginExecution();

    const startedAt = new Date();

    const stepResults:
      StepExecutionResult[] = [];

    try {
      for (const step of context.plan.steps) {
        // Stop before starting another step
        // if cancellation was requested.
        if (
          this.isCancellationRequested()
        ) {
          this.cancelExecution();

          return {
            requestId:
              context.requestId,

            planId:
              context.plan.id,

            status: "cancelled",

            steps: stepResults,

            startedAt,

            completedAt: new Date(),
          };
        }

        // Verify dependencies before execution.
        const dependenciesSatisfied =
          step.dependencies.every(
            (dependencyId) =>
              stepResults.some(
                (result) =>
                  result.stepId ===
                    dependencyId &&
                  result.status ===
                    "completed",
              ),
          );

        if (!dependenciesSatisfied) {
          const failedResult:
            StepExecutionResult = {
            stepId: step.id,

            capability:
              step.capability,

            status: "failed",

            error:
              "One or more step dependencies were not completed.",

            startedAt: new Date(),

            completedAt: new Date(),
          };

          stepResults.push(
            failedResult,
          );

          this.failExecution();

          return {
            requestId:
              context.requestId,

            planId:
              context.plan.id,

            status: "failed",

            steps: stepResults,

            startedAt,

            completedAt: new Date(),

            error:
              failedResult.error,
          };
        }

        // Verify permissions if required
        const capabilityDef = step.capability;
        if (capabilityDef.requiresPermission) {
          let permission: any = null;
          if (capabilityDef.category === "file-system") {
            permission = "filesystem";
          } else if (capabilityDef.category === "automation") {
            permission = "notifications";
          } else if (capabilityDef.id === "microphone") {
            permission = "microphone";
          } else if (capabilityDef.id === "camera") {
            permission = "camera";
          }

          if (permission) {
            const { permissionManager } = await import("@/core/permissions");
            let status = permissionManager.getStatus(permission);
            if (status === "prompt") {
              status = await permissionManager.request(permission);
            }

            if (status !== "granted") {
              const failedResult: StepExecutionResult = {
                stepId: step.id,
                capability: step.capability,
                status: "failed",
                error: `Permission "${permission}" denied for capability "${capabilityDef.id}".`,
                startedAt: new Date(),
                completedAt: new Date(),
              };

              stepResults.push(failedResult);
              this.failExecution();

              await eventBus.emit(EVENTS.TOOL_EXECUTED, {
                capabilityId: capabilityDef.id,
                status: "failed",
                success: false,
                stepId: step.id,
                error: failedResult.error,
                durationMs: 0,
              });

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
          }
        }

        const handler =
          capabilityHandlerRegistry.resolve(
            step.capability,
          );

        if (!handler) {
          const failedResult:
            StepExecutionResult = {
            stepId: step.id,

            capability:
              step.capability,

            status: "failed",

            error:
              `No execution handler is registered for capability "${step.capability.id}".`,

            startedAt: new Date(),

            completedAt: new Date(),
          };

          stepResults.push(
            failedResult,
          );

          this.failExecution();

          await eventBus.emit(EVENTS.TOOL_EXECUTED, {
            capabilityId: step.capability.id,
            status: "failed",
            success: false,
            stepId: step.id,
            error: failedResult.error,
            durationMs: 0,
          });

          return {
            requestId:
              context.requestId,

            planId:
              context.plan.id,

            status: "failed",

            steps: stepResults,

            startedAt,

            completedAt: new Date(),

            error:
              failedResult.error,
          };
        }

        const stepStartedAt = new Date();
        const stepResult =
          await handler.execute({
            requestId:
              context.requestId,

            planId:
              context.plan.id,

            step,

            previousResults:
              stepResults,
          });
        const durationMs = Date.now() - stepStartedAt.getTime();

        const validation =
          stepExecutionResultValidator.validate(
            step,
            stepResult,
          );

        if (!validation.valid) {
          const failedResult:
            StepExecutionResult = {
            stepId: step.id,

            capability:
              step.capability,

            status: "failed",

            error:
              validation.error ??
              `Execution result validation failed for step "${step.id}".`,

            startedAt:
              stepResult.startedAt,

            completedAt: new Date(),
          };

          stepResults.push(
            failedResult,
          );

          this.failExecution();

          await eventBus.emit(EVENTS.TOOL_EXECUTED, {
            capabilityId: step.capability.id,
            status: "failed",
            success: false,
            stepId: step.id,
            error: failedResult.error,
            durationMs,
          });

          return {
            requestId:
              context.requestId,

            planId:
              context.plan.id,

            status: "failed",

            steps: stepResults,

            startedAt,

            completedAt: new Date(),

            error:
              failedResult.error,
          };
        }

        stepResults.push(stepResult);

        await eventBus.emit(EVENTS.TOOL_EXECUTED, {
          capabilityId: step.capability.id,
          status: stepResult.status,
          success: stepResult.status === "completed",
          stepId: step.id,
          error: stepResult.error,
          durationMs,
        });

        if (
          stepResult.status ===
          "failed"
        ) {
          this.failExecution();

          return {
            requestId:
              context.requestId,

            planId:
              context.plan.id,

            status: "failed",

            steps: stepResults,

            startedAt,

            completedAt: new Date(),

            error:
              stepResult.error ??
              `Execution failed at step "${step.id}".`,
          };
        }
      }

      this.completeExecution();

      return {
        requestId:
          context.requestId,

        planId:
          context.plan.id,

        status: "completed",

        steps: stepResults,

        startedAt,

        completedAt: new Date(),
      };
    } catch (error) {
      this.failExecution();

      return {
        requestId:
          context.requestId,

        planId:
          context.plan.id,

        status: "failed",

        steps: stepResults,

        startedAt,

        completedAt: new Date(),

        error:
          error instanceof Error
            ? error.message
            : "Execution failed.",
      };
    }
  }
}

export const executionEngine =
  new KeiExecutionEngine();
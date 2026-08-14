import {
  platformApplicationAdapterManager,
} from "@/core/platform";

import {
  CapabilityHandler,
} from "./CapabilityHandler";

import type {
  StepExecutionContext,
  StepExecutionResult,
} from "./types";

export class AutomationCreateHandler
  extends CapabilityHandler
{
  readonly capabilityId =
    "automation.create";

  async execute(
    context: StepExecutionContext,
  ): Promise<StepExecutionResult> {
    const startedAt = new Date();

    const trigger =
      context.step.arguments.trigger;

    const action =
      context.step.arguments.action;

    if (
      typeof trigger !== "string" ||
      !trigger.trim() ||
      typeof action !== "string" ||
      !action.trim()
    ) {
      return {
        stepId: context.step.id,
        capability:
          context.step.capability,
        status: "failed",
        error:
          "Both a valid trigger and action are required.",
        startedAt,
        completedAt: new Date(),
      };
    }

    try {
      const adapter =
        platformApplicationAdapterManager
          .getActive();

      const result =
        await adapter.createAutomation({
          trigger,
          action,
        });

      if (!result.success) {
        return {
          stepId: context.step.id,
          capability:
            context.step.capability,
          status: "failed",
          output: result,
          error:
            result.error ??
            "Automation creation failed.",
          startedAt,
          completedAt: new Date(),
        };
      }

      return {
        stepId: context.step.id,
        capability:
          context.step.capability,
        status: "completed",
        output: result,
        startedAt,
        completedAt: new Date(),
      };
    } catch (error) {
      return {
        stepId: context.step.id,
        capability:
          context.step.capability,
        status: "failed",
        error:
          error instanceof Error
            ? error.message
            : "Automation creation execution failed.",
        startedAt,
        completedAt: new Date(),
      };
    }
  }
}

export const automationCreateHandler =
  new AutomationCreateHandler();

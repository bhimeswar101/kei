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

export class ApplicationCloseHandler
  extends CapabilityHandler
{
  readonly capabilityId =
    "application.close";

  async execute(
    context: StepExecutionContext,
  ): Promise<StepExecutionResult> {
    const startedAt = new Date();

    const target =
      context.step.arguments.target;

    if (
      typeof target !== "string" ||
      !target.trim()
    ) {
      return {
        stepId: context.step.id,
        capability:
          context.step.capability,
        status: "failed",
        error:
          "A valid application target is required.",
        startedAt,
        completedAt: new Date(),
      };
    }

    const normalized = target.trim().toLowerCase();
    const approvedTargets = [
      "spotify",
      "calculator",
      "calc",
      "notepad",
      "paint",
      "mspaint",
      "command prompt",
      "cmd",
      "powershell",
    ];

    if (!approvedTargets.includes(normalized)) {
      return {
        stepId: context.step.id,
        capability:
          context.step.capability,
        status: "failed",
        error:
          `Application "${target}" is not an approved target.`,
        startedAt,
        completedAt: new Date(),
      };
    }

    try {
      const adapter =
        platformApplicationAdapterManager
          .getActive();

      const result =
        await adapter.closeApplication({
          target,
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
            "Application close failed.",
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
            : "Application close execution failed.",
        startedAt,
        completedAt: new Date(),
      };
    }
  }
}

export const applicationCloseHandler =
  new ApplicationCloseHandler();

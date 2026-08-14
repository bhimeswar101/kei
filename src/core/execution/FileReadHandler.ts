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

export class FileReadHandler
  extends CapabilityHandler
{
  readonly capabilityId =
    "file.read";

  async execute(
    context: StepExecutionContext,
  ): Promise<StepExecutionResult> {
    const startedAt = new Date();

    const path =
      context.step.arguments.path;

    if (
      typeof path !== "string" ||
      !path.trim()
    ) {
      return {
        stepId: context.step.id,
        capability:
          context.step.capability,
        status: "failed",
        error:
          "A valid file path is required.",
        startedAt,
        completedAt: new Date(),
      };
    }

    try {
      const adapter =
        platformApplicationAdapterManager
          .getActive();

      const result =
        await adapter.readFile({
          path,
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
            "File read failed.",
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
            : "File read execution failed.",
        startedAt,
        completedAt: new Date(),
      };
    }
  }
}

export const fileReadHandler =
  new FileReadHandler();

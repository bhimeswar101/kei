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

export class MediaPauseHandler
  extends CapabilityHandler
{
  readonly capabilityId =
    "media.pause";

  async execute(
    context: StepExecutionContext,
  ): Promise<StepExecutionResult> {
    const startedAt = new Date();

    try {
      const adapter =
        platformApplicationAdapterManager
          .getActive();

      const result =
        await adapter.controlMedia({
          action: "pause",
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
            "Media pause failed.",
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
            : "Media pause execution failed.",
        startedAt,
        completedAt: new Date(),
      };
    }
  }
}

export const mediaPauseHandler =
  new MediaPauseHandler();

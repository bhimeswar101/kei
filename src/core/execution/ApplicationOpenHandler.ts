import { CapabilityHandler } from "./CapabilityHandler";

import type { StepExecutionContext, StepExecutionResult } from "./types";

export class ApplicationOpenHandler extends CapabilityHandler {
  readonly capabilityId = "application.open";

  async execute(context: StepExecutionContext): Promise<StepExecutionResult> {
    const startedAt = new Date();

    return {
      stepId: context.step.id,

      capability: context.step.capability,

      status: "completed",

      output: {
        handled: true,

        capabilityId: this.capabilityId,

        arguments: context.step.arguments,
      },

      startedAt,

      completedAt: new Date(),
    };
  }
}

export const applicationOpenHandler = new ApplicationOpenHandler();

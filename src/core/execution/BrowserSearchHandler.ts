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

export class BrowserSearchHandler
  extends CapabilityHandler
{
  readonly capabilityId =
    "browser.search";

  async execute(
    context: StepExecutionContext,
  ): Promise<StepExecutionResult> {
    const startedAt = new Date();

    const query =
      context.step.arguments.query;

    if (
      typeof query !== "string" ||
      !query.trim()
    ) {
      return {
        stepId: context.step.id,
        capability:
          context.step.capability,
        status: "failed",
        error:
          "A valid search query is required.",
        startedAt,
        completedAt: new Date(),
      };
    }

    try {
      const adapter =
        platformApplicationAdapterManager
          .getActive();

      const result =
        await adapter.searchBrowser({
          query,
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
            "Browser search failed.",
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
            : "Browser search execution failed.",
        startedAt,
        completedAt: new Date(),
      };
    }
  }
}

export const browserSearchHandler =
  new BrowserSearchHandler();

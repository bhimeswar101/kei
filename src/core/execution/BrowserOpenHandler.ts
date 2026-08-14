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

export class BrowserOpenHandler
  extends CapabilityHandler
{
  readonly capabilityId =
    "browser.open";

  async execute(
    context: StepExecutionContext,
  ): Promise<StepExecutionResult> {
    const startedAt = new Date();

    const url =
      context.step.arguments.url;

    if (
      typeof url !== "string" ||
      !url.trim()
    ) {
      return {
        stepId: context.step.id,
        capability:
          context.step.capability,
        status: "failed",
        error:
          "A valid URL is required.",
        startedAt,
        completedAt: new Date(),
      };
    }

    const normalized = url.trim().toLowerCase();
    if (
      !normalized.startsWith("http://") &&
      !normalized.startsWith("https://")
    ) {
      return {
        stepId: context.step.id,
        capability:
          context.step.capability,
        status: "failed",
        error:
          "Only HTTP and HTTPS URL schemes are allowed.",
        startedAt,
        completedAt: new Date(),
      };
    }

    try {
      const adapter =
        platformApplicationAdapterManager
          .getActive();

      const result =
        await adapter.openBrowser({
          url,
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
            "Browser open failed.",
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
            : "Browser open execution failed.",
        startedAt,
        completedAt: new Date(),
      };
    }
  }
}

export const browserOpenHandler =
  new BrowserOpenHandler();

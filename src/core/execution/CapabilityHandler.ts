import type {
  CapabilityDefinition,
} from "@/core/capabilities";

import type {
  StepExecutionContext,
  StepExecutionResult,
} from "./types";

export interface CapabilityHandlerContract {
  readonly capabilityId: string;

  canHandle(
    capability: CapabilityDefinition,
  ): boolean;

  execute(
    context: StepExecutionContext,
  ): Promise<StepExecutionResult>;
}

export abstract class CapabilityHandler
  implements CapabilityHandlerContract
{
  abstract readonly capabilityId: string;

  canHandle(
    capability: CapabilityDefinition,
  ): boolean {
    return (
      capability.id ===
      this.capabilityId
    );
  }

  abstract execute(
    context: StepExecutionContext,
  ): Promise<StepExecutionResult>;
}

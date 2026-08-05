import { executionResultInterpreter } from "@/core/execution";

import type { IntelligenceResult } from "@/core/intelligence";

import type { RequestOutcome } from "./RequestOutcome";

export class RequestOutcomeResolver {
  resolve(result: IntelligenceResult): RequestOutcome {
    const execution = result.execution;

    if (execution) {
      const interpretation = executionResultInterpreter.interpret(execution);

      switch (interpretation.status) {
        case "succeeded":
          return {
            requestId: result.requestId,

            type: "executed",

            success: true,

            intelligence: result,
          };

        case "failed":
          return {
            requestId: result.requestId,

            type: "failed",

            success: false,

            intelligence: result,

            error: interpretation.error || "The requested action could not be completed.",
          };

        case "cancelled":
          return {
            requestId: result.requestId,

            type: "rejected",

            success: false,

            intelligence: result,
          };

        case "incomplete":
          return {
            requestId: result.requestId,

            type: "deferred",

            success: false,

            intelligence: result,
          };
      }
    }

    switch (result.decision.type) {
      case "respond":
        return {
          requestId: result.requestId,

          type: "responded",

          success: true,

          intelligence: result,
        };

      case "clarify":
        return {
          requestId: result.requestId,

          type: "clarification-required",

          success: false,

          intelligence: result,
        };

      case "reject":
        return {
          requestId: result.requestId,

          type: "rejected",

          success: false,

          intelligence: result,
        };

      case "defer":
        return {
          requestId: result.requestId,

          type: "deferred",

          success: false,

          intelligence: result,
        };

      case "execute":
        return {
          requestId: result.requestId,

          type: "unsupported",

          success: false,

          intelligence: result,
        };

      case "unknown":
      default:
        return {
          requestId: result.requestId,

          type: "unsupported",

          success: false,

          intelligence: result,
        };
    }
  }
}

export const requestOutcomeResolver = new RequestOutcomeResolver();

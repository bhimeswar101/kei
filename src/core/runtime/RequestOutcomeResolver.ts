import type {
  IntelligenceResult,
} from "@/core/intelligence";

import type {
  RequestOutcome,
} from "./RequestOutcome";

export class RequestOutcomeResolver {
  resolve(
    result: IntelligenceResult,
  ): RequestOutcome {
    const execution = result.execution;

    if (execution) {
      if (execution.status === "completed") {
        return {
          requestId: result.requestId,
          type: "executed",
          success: true,
          message:
            result.text ||
            "The requested action was completed.",
          intelligence: result,
        };
      }

      if (execution.status === "failed") {
        const message =
          execution.error ||
          "The requested action could not be completed.";

        return {
          requestId: result.requestId,
          type: "failed",
          success: false,
          message,
          intelligence: result,
          error: message,
        };
      }

      if (execution.status === "cancelled") {
        return {
          requestId: result.requestId,
          type: "rejected",
          success: false,
          message:
            "The requested action was cancelled.",
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
          message:
            result.text ||
            "The request was processed.",
          intelligence: result,
        };

      case "clarify":
        return {
          requestId: result.requestId,
          type: "clarification-required",
          success: false,

          // Reasoning owns the explanation for
          // why clarification is required.
          message:
            result.decision.reason ||
            "I need more information before I can continue.",

          intelligence: result,
        };

      case "reject":
        return {
          requestId: result.requestId,
          type: "rejected",
          success: false,
          message:
            result.decision.reason ||
            "The request was rejected.",
          intelligence: result,
        };

      case "defer":
        return {
          requestId: result.requestId,
          type: "deferred",
          success: false,
          message:
            result.decision.reason ||
            "The request has been deferred.",
          intelligence: result,
        };

      case "execute":
        return {
          requestId: result.requestId,
          type: "unsupported",
          success: false,
          message:
            result.decision.reason ||
            "Kei could not execute this request.",
          intelligence: result,
        };

      case "unknown":
      default:
        return {
          requestId: result.requestId,
          type: "unsupported",
          success: false,
          message:
            result.decision.reason ||
            "Kei does not currently know how to handle this request.",
          intelligence: result,
        };
    }
  }
}

export const requestOutcomeResolver =
  new RequestOutcomeResolver();
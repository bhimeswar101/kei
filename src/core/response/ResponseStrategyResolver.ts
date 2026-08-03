import type {
  ResponseStrategy,
  ResponseSynthesisInput,
} from "./types";

export class ResponseStrategyResolver {
  resolve(
    input: ResponseSynthesisInput,
  ): ResponseStrategy {
    const { intelligence } = input;

    const execution =
      intelligence.execution;

    if (execution) {
      switch (execution.status) {
        case "completed":
          return "execution-success";

        case "failed":
          return "execution-failure";

        case "cancelled":
          return "cancelled";

        case "idle":
        case "running":
          return "deferred";
      }
    }

    switch (
      intelligence.decision.type
    ) {
      case "respond":
        return "conversation";

      case "clarify":
        return "clarification";

      case "reject":
        return "rejection";

      case "defer":
        return "deferred";

      case "execute":
      case "unknown":
      default:
        return "unsupported";
    }
  }
}

export const responseStrategyResolver =
  new ResponseStrategyResolver();
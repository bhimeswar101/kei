import type { IntelligenceContext } from "@/core/intelligence";

import type { RequestUnderstanding, RequestUnderstandingEngineContract } from "./types";

export abstract class RequestUnderstandingEngine implements RequestUnderstandingEngineContract {
  abstract understand(context: IntelligenceContext): Promise<RequestUnderstanding>;
}

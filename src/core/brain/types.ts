import type { ResponseSource, ResponseStrategy } from "@/core/response";

import type { RequestOutcomeType } from "@/core/runtime";

export type BrainInputType = "text" | "audio";

export interface BrainRequest {
  readonly id?: string;

  readonly type?: BrainInputType;

  readonly text?: string;

  readonly audio?: ArrayBuffer;

  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface BrainResponse {
  readonly requestId: string;

  readonly text: string;

  readonly outcome: RequestOutcomeType;

  readonly success: boolean;

  readonly strategy: ResponseStrategy;

  readonly source: ResponseSource;

  readonly grounded: boolean;

  readonly fallbackUsed: boolean;
}

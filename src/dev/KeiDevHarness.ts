import {
  keiRequestGateway,
} from "@/core/runtime";

import type {
  IntelligenceResult,
} from "@/core/intelligence";

export class KeiDevHarness {
  async send(
    text: string,
  ): Promise<IntelligenceResult> {
    console.info(
      `[KEI DEV] Request: ${text}`,
    );

    const result =
      await keiRequestGateway.processText(
        text,
        {
          source: "developer-harness",
        },
      );

    console.info(
      "[KEI DEV] Result:",
      result,
    );

    return result;
  }
}

export const keiDev =
  new KeiDevHarness();
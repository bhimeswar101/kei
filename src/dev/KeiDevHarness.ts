import {
  keiRequestGateway,
} from "@/core/runtime";

import type {
  KeiRequestResult,
} from "@/core/runtime";

export class KeiDevHarness {
  async send(
    text: string,
  ): Promise<KeiRequestResult> {
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
      "[KEI DEV] Outcome:",
      result.outcome,
    );

    console.info(
      "[KEI DEV] Intelligence:",
      result.intelligence,
    );

    return result;
  }
}

export const keiDev =
  new KeiDevHarness();
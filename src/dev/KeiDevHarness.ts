import { invoke } from "@tauri-apps/api/core";

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

  async testGemini(
    prompt: string,
  ): Promise<string> {
    const normalizedPrompt =
      prompt.trim();

    if (!normalizedPrompt) {
      throw new Error(
        "Gemini test prompt cannot be empty.",
      );
    }

    console.info(
      "[KEI DEV] Testing native Gemini connection...",
    );

    const response =
      await invoke<string>(
        "gemini_generate",
        {
          prompt: normalizedPrompt,
        },
      );

    console.info(
      "[KEI DEV] Gemini response:",
      response,
    );

    return response;
  }
}

export const keiDev =
  new KeiDevHarness();
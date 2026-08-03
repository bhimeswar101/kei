import {
  desktopNativeHostTransport,
} from "@/integrations/native";

import { BaseAIProvider } from "./AIProvider";

import type {
  AIRequest,
  AIResponse,
} from "./types";

export class GeminiProvider
  extends BaseAIProvider
{
  readonly id = "gemini";

  readonly name = "Google Gemini";

  private initialized = false;

  async initialize(): Promise<void> {
    if (
      !desktopNativeHostTransport.isAvailable()
    ) {
      throw new Error(
        "Gemini native transport is unavailable.",
      );
    }

    this.initialized = true;

    console.info(
      "[Gemini] Provider initialized.",
    );
  }

  async send(
    request: AIRequest,
  ): Promise<AIResponse> {
    if (!this.initialized) {
      throw new Error(
        "Gemini provider is not initialized.",
      );
    }

    const text =
      request.text?.trim();

    if (!text) {
      throw new Error(
        "Gemini requires a non-empty text request.",
      );
    }

    const response =
      await desktopNativeHostTransport
        .generateAIResponse(text);

    return {
      text: response,
    };
  }

  async dispose(): Promise<void> {
    this.initialized = false;

    console.info(
      "[Gemini] Provider disposed.",
    );
  }
}
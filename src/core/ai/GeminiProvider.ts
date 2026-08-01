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

  async initialize(): Promise<void> {
    console.log("[Gemini] Initialized");
  }

  async send(
    request: AIRequest,
  ): Promise<AIResponse> {
    console.log(request);

    return {
      text: "Gemini provider placeholder.",
    };
  }

  async dispose(): Promise<void> {
    console.log("[Gemini] Disposed");
  }
}
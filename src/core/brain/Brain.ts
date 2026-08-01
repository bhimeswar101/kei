import { aiProviderManager } from "@/core/ai";
import {
  intelligenceEngine,
} from "@/core/intelligence";

import type {
  IntelligenceContext,
  IntelligenceInput,
} from "@/core/intelligence";

import type {
  BrainRequest,
  BrainResponse,
} from "./types";

export class Brain {
  async initialize(): Promise<void> {
    const provider =
      aiProviderManager.getActive();

    await provider.initialize();
  }

  async ask(
    request: BrainRequest,
  ): Promise<BrainResponse> {
    const requestId =
      request.id ?? crypto.randomUUID();

    const input: IntelligenceInput = {
      id: requestId,
      type:
        request.type ??
        this.resolveInputType(request),
      text: request.text,
      audio: request.audio,
      timestamp: new Date(),
    };

    const context: IntelligenceContext = {
      requestId,
      input,
      metadata: request.metadata,
    };

    return this.processRequest(context);
  }

  async shutdown(): Promise<void> {
    const provider =
      aiProviderManager.getActive();

    await provider.dispose();
  }

  private async processRequest(
    context: IntelligenceContext,
  ): Promise<BrainResponse> {
    const result =
      await intelligenceEngine.process(context);

    return {
      requestId: result.requestId,
      text: result.text,
    };
  }

  private resolveInputType(
    request: BrainRequest,
  ): "text" | "audio" {
    if (request.audio) {
      return "audio";
    }

    return "text";
  }
}

export const brain = new Brain();
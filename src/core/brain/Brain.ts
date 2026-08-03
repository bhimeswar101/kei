import {
  aiProviderManager,
} from "@/core/ai";

import {
  keiRequestGateway,
} from "@/core/runtime";

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
    const result =
      await keiRequestGateway.process({
        text: request.text,
        audio: request.audio,
        type: request.type,
        metadata: request.metadata,
      });

    return {
      requestId: result.requestId,
      text: result.outcome.message,
      outcome: result.outcome.type,
      success: result.outcome.success,
    };
  }

  async shutdown(): Promise<void> {
    const provider =
      aiProviderManager.getActive();

    await provider.dispose();
  }
}

export const brain =
  new Brain();
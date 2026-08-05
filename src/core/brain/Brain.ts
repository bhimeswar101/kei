import { aiProviderManager } from "@/core/ai";

import { keiRequestGateway } from "@/core/runtime";

import type { BrainRequest, BrainResponse } from "./types";

export class Brain {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const provider = aiProviderManager.getActive();

    await provider.initialize();

    this.initialized = true;
  }

  async ask(request: BrainRequest): Promise<BrainResponse> {
    if (!this.initialized) {
      throw new Error("Kei Brain is not initialized.");
    }

    const result = await keiRequestGateway.process({
      text: request.text,
      audio: request.audio,
      type: request.type,
      metadata: request.metadata,
    });

    return {
      requestId: result.requestId,

      text: result.response.text,

      outcome: result.outcome.type,

      success: result.response.success,

      strategy: result.response.strategy,

      source: result.response.source,

      grounded: result.response.grounded,

      fallbackUsed: result.response.fallbackUsed,
    };
  }

  async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    const provider = aiProviderManager.getActive();

    await provider.dispose();

    this.initialized = false;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const brain = new Brain();

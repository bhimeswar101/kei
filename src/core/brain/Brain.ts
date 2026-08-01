import { aiProviderManager } from "@/core/ai";

import type { BrainRequest, BrainResponse } from "./types";

export class Brain {
  async initialize() {
    const provider = aiProviderManager.getActive();

    await provider.initialize();
  }

  async ask(request: BrainRequest): Promise<BrainResponse> {
    const provider = aiProviderManager.getActive();

    return provider.send(request);
  }

  async shutdown() {
    const provider = aiProviderManager.getActive();

    await provider.dispose();
  }
}

export const brain = new Brain();

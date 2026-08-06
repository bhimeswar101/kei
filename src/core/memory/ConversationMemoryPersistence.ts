import type { IntelligenceResult } from "@/core/intelligence";
import type { SynthesizedResponse } from "@/core/response";
import type { KeiRequestInput } from "@/core/runtime";

import {
  memoryEngine as defaultMemoryEngine,
} from "./KeiMemoryEngine";

import type {
  MemoryEngineContract,
} from "./types";

export interface ConversationMemoryPersistenceContract {
  persist(
    input: KeiRequestInput,
    intelligence: IntelligenceResult,
    response: SynthesizedResponse,
  ): Promise<void>;
}

export class ConversationMemoryPersistence
  implements ConversationMemoryPersistenceContract
{
  private readonly memoryEngine: MemoryEngineContract;

  constructor(
  memoryEngine: MemoryEngineContract =
    defaultMemoryEngine,
) {
  this.memoryEngine = memoryEngine;
}

  async persist(
  input: KeiRequestInput,
  intelligence: IntelligenceResult,
  response: SynthesizedResponse,
): Promise<void> {
  void intelligence;

  await this.memoryEngine.write({
    type: "short-term",

    key: "conversation.latest",

    value: {
      userMessage: input.text,

      assistantMessage: response.text,
    },

    source: "assistant",
  });
}
}
export const conversationMemoryPersistence =
  new ConversationMemoryPersistence();
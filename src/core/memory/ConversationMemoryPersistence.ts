import type { IntelligenceResult } from "@/core/intelligence";
import type { SynthesizedResponse } from "@/core/response";
import type { KeiRequestInput } from "@/core/runtime";

import { memoryEngine as defaultMemoryEngine } from "./KeiMemoryEngine";

import { memoryImportanceScorer as defaultImportanceScorer } from "./MemoryImportanceScorer";

import { memoryRetentionPolicy as defaultRetentionPolicy } from "./MemoryRetentionPolicy";

import type { MemoryImportanceScorerContract } from "./MemoryImportanceScorer";

import type { MemoryRetentionPolicyContract } from "./MemoryRetentionPolicy";

import type { MemoryEngineContract } from "./types";

export interface ConversationMemoryPersistenceContract {
  persist(
    input: KeiRequestInput,
    intelligence: IntelligenceResult,
    response: SynthesizedResponse,
  ): Promise<void>;
}

export class ConversationMemoryPersistence implements ConversationMemoryPersistenceContract {
  private readonly memoryEngine: MemoryEngineContract;

  private readonly importanceScorer: MemoryImportanceScorerContract;

  private readonly retentionPolicy: MemoryRetentionPolicyContract;

  constructor(
    memoryEngine: MemoryEngineContract = defaultMemoryEngine,

    importanceScorer: MemoryImportanceScorerContract = defaultImportanceScorer,

    retentionPolicy: MemoryRetentionPolicyContract = defaultRetentionPolicy,
  ) {
    this.memoryEngine = memoryEngine;

    this.importanceScorer = importanceScorer;

    this.retentionPolicy = retentionPolicy;
  }

  async persist(
    input: KeiRequestInput,
    intelligence: IntelligenceResult,
    response: SynthesizedResponse,
  ): Promise<void> {
    void intelligence;

    const importance = this.importanceScorer.score(input.text ?? "", response.text);

    const shouldPersist = this.retentionPolicy.shouldPersist(importance);

    if (!shouldPersist) {
      return;
    }

    await this.memoryEngine.write({
      type: "short-term",

      key: "conversation.latest",

      value: {
        userMessage: input.text,

        assistantMessage: response.text,
      },

      source: "assistant",

      importance,
    });
  }
}

export const conversationMemoryPersistence = new ConversationMemoryPersistence();

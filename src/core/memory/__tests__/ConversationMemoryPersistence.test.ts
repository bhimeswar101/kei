import { describe, expect, it, vi } from "vitest";

import type { IntelligenceResult } from "@/core/intelligence";
import type { SynthesizedResponse } from "@/core/response";
import type { KeiRequestInput } from "@/core/runtime";

import {
  ConversationMemoryPersistence,
} from "../ConversationMemoryPersistence";

import type {
  MemoryImportanceScorerContract,
} from "../MemoryImportanceScorer";

import type {
  MemoryRetentionPolicyContract,
} from "../MemoryRetentionPolicy";

import type {
  MemoryEngineContract,
} from "../types";

describe("ConversationMemoryPersistence", () => {
  it("writes the conversation into memory", async () => {
    const write = vi.fn();

    /*
     * MemoryEngineContract contains additional methods
     * such as get, query, remove, clear, etc.
     *
     * This test only needs the write capability, so we
     * intentionally provide a minimal test double.
     */
    const memoryEngine =
      {
        write,
      } as unknown as MemoryEngineContract;

    const importanceScorer: MemoryImportanceScorerContract = {
      score: vi.fn().mockReturnValue(0.75),
    };

    const retentionPolicy: MemoryRetentionPolicyContract = {
      shouldPersist: vi.fn().mockReturnValue(true),
    };

    const persistence =
      new ConversationMemoryPersistence(
        memoryEngine,
        importanceScorer,
        retentionPolicy,
      );

    const input = {
      text: "What is our project roadmap?",
    } as KeiRequestInput;

    const intelligence =
      {} as IntelligenceResult;

    const response = {
      text: "Our roadmap is focused on building Kei.",
    } as SynthesizedResponse;

    await persistence.persist(
      input,
      intelligence,
      response,
    );

    expect(write).toHaveBeenCalledTimes(1);
  });

  it("does not persist when retention policy rejects the conversation", async () => {
    const write = vi.fn();

    const memoryEngine =
      {
        write,
      } as unknown as MemoryEngineContract;

    const importanceScorer: MemoryImportanceScorerContract = {
      score: vi.fn().mockReturnValue(0.2),
    };

    const retentionPolicy: MemoryRetentionPolicyContract = {
      shouldPersist: vi.fn().mockReturnValue(false),
    };

    const persistence =
      new ConversationMemoryPersistence(
        memoryEngine,
        importanceScorer,
        retentionPolicy,
      );

    const input = {
      text: "What time is it?",
    } as KeiRequestInput;

    const intelligence =
      {} as IntelligenceResult;

    const response = {
      text: "It is currently afternoon.",
    } as SynthesizedResponse;

    await persistence.persist(
      input,
      intelligence,
      response,
    );

    expect(write).not.toHaveBeenCalled();
  });

  it("stores only conversation data needed for recall", async () => {
    const write = vi.fn();

    const memoryEngine =
      {
        write,
      } as unknown as MemoryEngineContract;

    const importanceScorer: MemoryImportanceScorerContract = {
      score: vi.fn().mockReturnValue(0.5),
    };

    const retentionPolicy: MemoryRetentionPolicyContract = {
      shouldPersist: vi.fn().mockReturnValue(true),
    };

    const persistence =
      new ConversationMemoryPersistence(
        memoryEngine,
        importanceScorer,
        retentionPolicy,
      );

    const input = {
      text: "What is our project roadmap?",
    } as KeiRequestInput;

    const intelligence =
      {} as IntelligenceResult;

    const response = {
      text: "Our roadmap is focused on building Kei.",
    } as SynthesizedResponse;

    await persistence.persist(
      input,
      intelligence,
      response,
    );

    expect(write).toHaveBeenCalledWith({
      type: "short-term",

      key: "conversation.latest",

      value: {
        userMessage:
          "What is our project roadmap?",

        assistantMessage:
          "Our roadmap is focused on building Kei.",
      },

      source: "assistant",

      importance: 0.5,
    });
  });
});
import { contextEngine } from "@/core/context";

import { intelligenceEngine } from "@/core/intelligence";

import type {
  IntelligenceContext,
  IntelligenceInputType,
  IntelligenceResult,
} from "@/core/intelligence";
import {
  conversationMemoryRecall,
  conversationMemoryPersistence,
  memoryContextBridge,
} from "@/core/memory";
import { responseSynthesisGateway } from "@/core/response";
import { pluginManager } from "@/core/plugins";
import { pluginMiddleware } from "@/core/plugins/PluginMiddleware";
import type { VoicePlugin } from "@/plugins/voice/VoicePlugin";

import type {
  SynthesizedResponse,
} from "@/core/response";

import type {
  RequestOutcome,
} from "./RequestOutcome";

import {
  requestOutcomeResolver,
} from "./RequestOutcomeResolver";

import {
  requestStateManager,
} from "./RequestStateManager";

export interface KeiRequestInput {
  readonly text?: string;

  readonly audio?: ArrayBuffer;

  readonly type?: IntelligenceInputType;

  readonly metadata?: Readonly<
    Record<string, unknown>
  >;
}

export interface KeiRequestResult {
  readonly requestId: string;

  readonly outcome: RequestOutcome;

  readonly intelligence: IntelligenceResult;

  readonly response: SynthesizedResponse;
}

export class KeiRequestGateway {
  async process(
    input: KeiRequestInput,
  ): Promise<KeiRequestResult> {
    const requestId =
      this.createRequestId();

    requestStateManager.begin(requestId);

    try {
      await pluginMiddleware.executePreRequestObservers(input);
      await memoryContextBridge.hydrate();
      const recalledConversation =
  await conversationMemoryRecall.recall();

if (recalledConversation) {
  contextEngine.set(
    "memory.conversation.recent",
    recalledConversation,
    "memory",
  );
}

      const context: IntelligenceContext = {
        requestId,

        input: {
          id: `${requestId}:input`,

          type:
            input.type ??
            this.resolveInputType(input),

          text: input.text,

          audio: input.audio,

          timestamp: new Date(),
        },

        context:
          contextEngine.createSnapshot(
            requestId,
          ),

        metadata: input.metadata,
      };

      const intelligence =
        await intelligenceEngine.process(
          context,
        );

      const outcome =
        requestOutcomeResolver.resolve(
          intelligence,
        );

      const response =
  await responseSynthesisGateway.synthesize(
    context,
    intelligence,
  );

await conversationMemoryPersistence.persist(
  input,
  intelligence,
  response,
);

const voicePlugin = pluginManager.get("voice") as VoicePlugin | undefined;
if (voicePlugin && voicePlugin.isRunning()) {
  void voicePlugin.speak(response.text);
}

requestStateManager.complete(
  requestId,
);

      const result = {
        requestId,
        outcome,
        intelligence,
        response,
      };

      await pluginMiddleware.executePostResponseObservers(result);

      return result;
    } catch (error) {
      requestStateManager.fail(
        requestId,
        error,
      );

      throw error;
    }
  }

  async processText(
    text: string,
    metadata?: Readonly<
      Record<string, unknown>
    >,
  ): Promise<KeiRequestResult> {
    const normalizedText = text.trim();

    if (!normalizedText) {
      throw new Error(
        "A text request cannot be empty.",
      );
    }

    return this.process({
      type: "text",

      text: normalizedText,

      metadata,
    });
  }

  private resolveInputType(
    input: KeiRequestInput,
  ): IntelligenceInputType {
    if (input.audio) {
      return "audio";
    }

    if (input.text !== undefined) {
      return "text";
    }

    return "system";
  }

  private createRequestId(): string {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID ===
        "function"
    ) {
      return crypto.randomUUID();
    }

    return [
      "kei",
      Date.now(),
      Math.random()
        .toString(36)
        .slice(2),
    ].join("-");
  }
}

export const keiRequestGateway =
  new KeiRequestGateway();
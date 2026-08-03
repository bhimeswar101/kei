import { contextEngine } from "@/core/context";

import { intelligenceEngine } from "@/core/intelligence";

import type {
  IntelligenceContext,
  IntelligenceInputType,
  IntelligenceResult,
} from "@/core/intelligence";

export interface KeiRequestInput {
  readonly text?: string;

  readonly audio?: ArrayBuffer;

  readonly type?: IntelligenceInputType;

  readonly metadata?: Readonly<Record<string, unknown>>;
}

export class KeiRequestGateway {
  async process(input: KeiRequestInput): Promise<IntelligenceResult> {
    const requestId = this.createRequestId();

    const context: IntelligenceContext = {
      requestId,

      input: {
        id: `${requestId}:input`,

        type: input.type ?? this.resolveInputType(input),

        text: input.text,

        audio: input.audio,

        timestamp: new Date(),
      },

      context: contextEngine.createSnapshot(requestId),

      metadata: input.metadata,
    };

    return intelligenceEngine.process(context);
  }

  async processText(
    text: string,
    metadata?: Readonly<Record<string, unknown>>,
  ): Promise<IntelligenceResult> {
    const normalizedText = text.trim();

    if (!normalizedText) {
      throw new Error("A text request cannot be empty.");
    }

    return this.process({
      type: "text",
      text: normalizedText,
      metadata,
    });
  }

  private resolveInputType(input: KeiRequestInput): IntelligenceInputType {
    if (input.audio) {
      return "audio";
    }

    if (input.text !== undefined) {
      return "text";
    }

    return "system";
  }

  private createRequestId(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }

    return ["kei", Date.now(), Math.random().toString(36).slice(2)].join("-");
  }
}

export const keiRequestGateway = new KeiRequestGateway();

import {
  contextEngine,
} from "@/core/context";
import {
  responseSynthesisGateway,
} from "@/core/response";
import {
  intelligenceEngine,
} from "@/core/intelligence";

import type {
  IntelligenceContext,
  IntelligenceInputType,
  IntelligenceResult,
} from "@/core/intelligence";

import {
  requestOutcomeResolver,
} from "./RequestOutcomeResolver";
import type {
  SynthesizedResponse,
} from "@/core/response";
import type {
  RequestOutcome,
} from "./RequestOutcome";

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

  readonly response:
    SynthesizedResponse;
}

export class KeiRequestGateway {
  async process(
    input: KeiRequestInput,
  ): Promise<KeiRequestResult> {
    const requestId =
      this.createRequestId();

    const context:
      IntelligenceContext = {
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

    return {
      requestId,
      outcome,
      intelligence,
      response,
    };
  }

  async processText(
    text: string,
    metadata?: Readonly<
      Record<string, unknown>
    >,
  ): Promise<KeiRequestResult> {
    const normalizedText =
      text.trim();

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
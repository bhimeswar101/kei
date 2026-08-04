import type {
  IntelligenceContext,
  IntelligenceResult,
} from "@/core/intelligence";

import {
  responseSynthesisInputBuilder,
} from "./ResponseSynthesisInputBuilder";

import {
  keiResponseSynthesisEngine,
} from "./KeiResponseSynthesisEngine";

import type {
  SynthesizedResponse,
} from "./types";

export interface ResponseSynthesisGatewayContract {
  synthesize(
    context: IntelligenceContext,
    intelligence: IntelligenceResult,
  ): Promise<SynthesizedResponse>;
}

export class ResponseSynthesisGateway
  implements ResponseSynthesisGatewayContract
{
  async synthesize(
    context: IntelligenceContext,
    intelligence: IntelligenceResult,
  ): Promise<SynthesizedResponse> {
    const input =
      responseSynthesisInputBuilder.build(
        context,
        intelligence,
      );

    return keiResponseSynthesisEngine.synthesize(
      input,
    );
  }
}

export const responseSynthesisGateway =
  new ResponseSynthesisGateway();
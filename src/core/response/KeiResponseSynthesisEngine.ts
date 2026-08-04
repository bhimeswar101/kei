import {
  BaseResponseSynthesisEngine,
} from "./ResponseSynthesisEngine";

import {
  aiResponseGenerator,
} from "./AIResponseGenerator";

import {
  responseAssembler,
} from "./ResponseAssembler";

import type {
  ResponseSynthesisInput,
  SynthesizedResponse,
} from "./types";

export class KeiResponseSynthesisEngine
  extends BaseResponseSynthesisEngine
{
  async synthesize(
    input: ResponseSynthesisInput,
  ): Promise<SynthesizedResponse> {
    this.beginSynthesis();

    try {
      const generated =
        await aiResponseGenerator.generate(
          input,
        );

      const response =
        responseAssembler.assemble(
          input.requestId,
          generated,
        );

      this.completeSynthesis();

      return response;
    } catch (error) {
      this.failSynthesis();

      throw error;
    } finally {
      this.resetSynthesis();
    }
  }
}

export const keiResponseSynthesisEngine =
  new KeiResponseSynthesisEngine();
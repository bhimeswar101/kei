import type {
  ResponseSynthesisEngineContract,
  ResponseSynthesisInput,
  ResponseSynthesisStatus,
  SynthesizedResponse,
} from "./types";

export abstract class BaseResponseSynthesisEngine
  implements ResponseSynthesisEngineContract
{
  protected status:
    ResponseSynthesisStatus = "idle";

  abstract synthesize(
    input: ResponseSynthesisInput,
  ): Promise<SynthesizedResponse>;

  getStatus():
    ResponseSynthesisStatus {
    return this.status;
  }

  isSynthesizing(): boolean {
    return (
      this.status ===
      "synthesizing"
    );
  }

  protected beginSynthesis(): void {
    if (this.isSynthesizing()) {
      throw new Error(
        "The response synthesis engine is already synthesizing a response.",
      );
    }

    this.status = "synthesizing";
  }

  protected completeSynthesis(): void {
    this.status = "completed";
  }

  protected failSynthesis(): void {
    this.status = "error";
  }

  protected resetSynthesis(): void {
    this.status = "idle";
  }
}
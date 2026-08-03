import type {
  IntelligenceResult,
} from "@/core/intelligence";

export type ResponseSynthesisStatus =
  | "idle"
  | "synthesizing"
  | "completed"
  | "error";

export type ResponseStrategy =
  | "conversation"
  | "execution-success"
  | "execution-failure"
  | "clarification"
  | "rejection"
  | "unsupported"
  | "cancelled"
  | "deferred";

export type ResponseSource =
  | "provider"
  | "deterministic"
  | "fallback";

export interface ResponseSynthesisInput {
  readonly requestId: string;

  readonly originalText?: string;

  readonly intelligence:
    IntelligenceResult;

  readonly metadata?: Readonly<
    Record<string, unknown>
  >;
}

export interface SynthesizedResponse {
  readonly requestId: string;

  readonly text: string;

  readonly strategy:
    ResponseStrategy;

  readonly source:
    ResponseSource;

  readonly success: boolean;

  readonly grounded: boolean;

  readonly fallbackUsed: boolean;

  readonly metadata?: Readonly<
    Record<string, unknown>
  >;
}

export interface ResponseSynthesisEngineContract {
  synthesize(
    input: ResponseSynthesisInput,
  ): Promise<SynthesizedResponse>;

  getStatus():
    ResponseSynthesisStatus;

  isSynthesizing(): boolean;
}
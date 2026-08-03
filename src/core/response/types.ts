import type {
  IntelligenceResult,
} from "@/core/intelligence";
import type {
  ExecutionInterpretation,
} from "@/core/execution";
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
export interface ExecutionAwareResponse {
  readonly strategy:
    | "execution-success"
    | "execution-failure"
    | "cancelled"
    | "deferred";

  readonly success: boolean;

  readonly grounded: true;

  readonly interpretation:
    ExecutionInterpretation;

  readonly summary: string;

  readonly error?: string;
}

export interface ExecutionAwareResponseSynthesizerContract {
  synthesize(
    input: ResponseSynthesisInput,
  ): ExecutionAwareResponse;
}

export interface ResponseSynthesisEngineContract {
  synthesize(
    input: ResponseSynthesisInput,
  ): Promise<SynthesizedResponse>;

  getStatus():
    ResponseSynthesisStatus;

  isSynthesizing(): boolean;
}
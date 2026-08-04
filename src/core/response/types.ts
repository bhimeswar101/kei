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
export interface FailureCancellationResponse {
  readonly strategy:
    | "execution-failure"
    | "cancelled";

  readonly success: false;

  readonly grounded: true;

  readonly summary: string;

  readonly error?: string;

  readonly failedStepId?: string;

  readonly failedCapabilityId?: string;

  readonly context: string;
}

export interface FailureCancellationResponseSynthesizerContract {
  synthesize(
    input: ResponseSynthesisInput,
  ): FailureCancellationResponse;
}
export interface ConversationalResponse {
  readonly strategy: "conversation";

  readonly success: true;

  readonly grounded: false;

  readonly originalText: string;

  readonly context: string;
}

export interface ConversationalResponseSynthesizerContract {
  synthesize(
    input: ResponseSynthesisInput,
  ): ConversationalResponse;
}
export interface ClarificationResponse {
  readonly strategy: "clarification";

  readonly success: true;

  readonly grounded: false;

  readonly originalText: string;

  readonly reason?: string;

  readonly unresolvedReferences:
    readonly string[];

  readonly requiresContext: boolean;

  readonly context: string;
}

export interface ClarificationResponseSynthesizerContract {
  synthesize(
    input: ResponseSynthesisInput,
  ): ClarificationResponse;
}
export interface RejectionUnsupportedResponse {
  readonly strategy:
    | "rejection"
    | "unsupported";

  readonly success: false;

  readonly grounded: false;

  readonly originalText?: string;

  readonly reason?: string;

  readonly context: string;
}

export interface RejectionUnsupportedResponseSynthesizerContract {
  synthesize(
    input: ResponseSynthesisInput,
  ): RejectionUnsupportedResponse;
}
export interface ResponseContent {
  readonly strategy: ResponseStrategy;

  readonly content: string;

  readonly grounded: boolean;

  readonly requiresProvider: boolean;
}

export interface ResponseContentBuilderContract {
  build(
    input: ResponseSynthesisInput,
  ): ResponseContent;
}
export interface GeneratedAIResponse {
  readonly text: string;

  readonly grounded: boolean;

  readonly strategy:
    ResponseStrategy;

  readonly success: boolean;
}

export interface AIResponseGeneratorContract {
  generate(
    input: ResponseSynthesisInput,
  ): Promise<GeneratedAIResponse>;
}
export interface ResponseSynthesisEngineContract {
  synthesize(
    input: ResponseSynthesisInput,
  ): Promise<SynthesizedResponse>;

  getStatus():
    ResponseSynthesisStatus;

  isSynthesizing(): boolean;
}
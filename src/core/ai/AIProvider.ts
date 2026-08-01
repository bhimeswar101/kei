import type {
  AIProvider,
  AIRequest,
  AIResponse,
} from "./types";

export abstract class BaseAIProvider
  implements AIProvider
{
  abstract readonly id: string;

  abstract readonly name: string;

  abstract initialize(): Promise<void>;

  abstract send(
    request: AIRequest,
  ): Promise<AIResponse>;

  abstract dispose(): Promise<void>;
}
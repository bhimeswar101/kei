export interface AIRequest {
  text?: string;
  audio?: ArrayBuffer;
}

export interface AIResponse {
  text: string;
}

export interface AIProvider {
  readonly id: string;
  readonly name: string;

  initialize(): Promise<void>;

  send(
    request: AIRequest,
  ): Promise<AIResponse>;

  dispose(): Promise<void>;
}
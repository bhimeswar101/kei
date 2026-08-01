export interface BrainRequest {
  text?: string;
  audio?: ArrayBuffer;
}

export interface BrainResponse {
  text: string;
}
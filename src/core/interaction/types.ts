export type InteractionState =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "interrupted";

export interface AudioCaptureServiceContract {
  start(onChunk: (chunk: ArrayBuffer) => void): Promise<void>;
  stop(): Promise<void>;
  isCapturing(): boolean;
}

export interface AudioPlaybackServiceContract {
  play(chunk: ArrayBuffer): Promise<void>;
  speakText(text: string): Promise<void>;
  stop(): Promise<void>;
  isPlaying(): boolean;
  clearQueue(): void;
}

export interface VadServiceContract {
  process(chunk: ArrayBuffer): void;
  reset(): void;
  isSpeaking(): boolean;
  onSpeechStart(callback: () => void): void;
  onSpeechEnd(callback: () => void): void;
}

export interface WebSocketStreamingClientContract {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  sendAudio(chunk: ArrayBuffer): void;
  sendText(text: string): void;
  sendInterruption(): void;
  onAudioChunk(callback: (chunk: ArrayBuffer) => void): void;
  onTextChunk(callback: (text: string) => void): void;
  onInterrupted(callback: () => void): void;
  onError(callback: (error: Error) => void): void;
  onClose(callback: () => void): void;
  isConnected(): boolean;
}

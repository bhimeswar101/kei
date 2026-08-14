import type { VadServiceContract } from "./types";

export interface VadServiceConfig {
  readonly threshold?: number;          // Default 0.015 (RMS scale)
  readonly silenceDuration?: number;    // Default 1000 ms
  readonly speechDuration?: number;     // Default 150 ms
  readonly sampleRate?: number;         // Default 16000
}

export class VadService implements VadServiceContract {
  private readonly threshold: number;
  private readonly silenceDuration: number;
  private readonly speechDuration: number;
  private readonly sampleRate: number;

  private speaking = false;
  private voiceDurationAccumulator = 0;
  private silenceDurationAccumulator = 0;

  private speechStartCallback: (() => void) | null = null;
  private speechEndCallback: (() => void) | null = null;

  constructor(config: VadServiceConfig = {}) {
    this.threshold = config.threshold ?? 0.015;
    this.silenceDuration = config.silenceDuration ?? 1000;
    this.speechDuration = config.speechDuration ?? 150;
    this.sampleRate = config.sampleRate ?? 16000;
  }

  isSpeaking(): boolean {
    return this.speaking;
  }

  onSpeechStart(callback: () => void): void {
    this.speechStartCallback = callback;
  }

  onSpeechEnd(callback: () => void): void {
    this.speechEndCallback = callback;
  }

  process(chunk: ArrayBuffer): void {
    const samples = new Int16Array(chunk);
    if (samples.length === 0) return;

    // Calculate RMS (Root Mean Square) energy of the PCM chunk
    let sumOfSquares = 0;
    for (let i = 0; i < samples.length; i++) {
      const normalized = samples[i] / 32768.0;
      sumOfSquares += normalized * normalized;
    }
    const rms = Math.sqrt(sumOfSquares / samples.length);

    // Compute duration represented by this chunk in ms
    const chunkDuration = (samples.length / this.sampleRate) * 1000;

    if (rms > this.threshold) {
      this.silenceDurationAccumulator = 0;

      if (!this.speaking) {
        this.voiceDurationAccumulator += chunkDuration;
        if (this.voiceDurationAccumulator >= this.speechDuration) {
          this.speaking = true;
          this.voiceDurationAccumulator = 0;
          this.speechStartCallback?.();
        }
      }
    } else {
      this.voiceDurationAccumulator = 0;

      if (this.speaking) {
        this.silenceDurationAccumulator += chunkDuration;
        if (this.silenceDurationAccumulator >= this.silenceDuration) {
          this.speaking = false;
          this.silenceDurationAccumulator = 0;
          this.speechEndCallback?.();
        }
      }
    }
  }

  reset(): void {
    this.speaking = false;
    this.voiceDurationAccumulator = 0;
    this.silenceDurationAccumulator = 0;
  }
}

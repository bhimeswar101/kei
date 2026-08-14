import { voiceConfig } from "@/core/config/voice.config";
import type { AudioPlaybackServiceContract } from "./types";

export class AudioPlaybackService implements AudioPlaybackServiceContract {
  private audioContext: AudioContext | null = null;
  private nextPlaybackTime = 0;
  private activeSources: Set<AudioBufferSourceNode> = new Set();
  private playing = false;

  isPlaying(): boolean {
    return this.playing;
  }

  private initAudioContext(): void {
    if (this.audioContext) {
      return;
    }

    const AudioContextClass = typeof AudioContext !== "undefined"
      ? AudioContext
      : (typeof window !== "undefined" ? (window as any).webkitAudioContext : null);

    if (!AudioContextClass) {
      throw new Error("AudioContext is not supported by this browser.");
    }

    this.audioContext = new AudioContextClass({
      sampleRate: voiceConfig.output.sampleRate,
    });
    this.nextPlaybackTime = 0;
  }

  async play(chunk: ArrayBuffer): Promise<void> {
    this.initAudioContext();
    const ctx = this.audioContext!;

    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    const int16Array = new Int16Array(chunk);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }

    const sampleRate = voiceConfig.output.sampleRate;
    const buffer = ctx.createBuffer(1, float32Array.length, sampleRate);
    buffer.copyToChannel(float32Array, 0);

    const sourceNode = ctx.createBufferSource();
    sourceNode.buffer = buffer;
    sourceNode.connect(ctx.destination);

    const currentTime = ctx.currentTime;
    const startTime = Math.max(currentTime, this.nextPlaybackTime);
    
    sourceNode.start(startTime);
    this.nextPlaybackTime = startTime + buffer.duration;
    this.activeSources.add(sourceNode);
    this.playing = true;

    sourceNode.onended = () => {
      this.activeSources.delete(sourceNode);
      if (this.activeSources.size === 0) {
        this.playing = false;
      }
    };
  }

  speakText(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        reject(new Error("Speech synthesis is not supported by this browser."));
        return;
      }

      void this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => {
        this.playing = false;
        resolve();
      };
      utterance.onerror = (event) => {
        this.playing = false;
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      this.playing = true;
      window.speechSynthesis.speak(utterance);
    });
  }

  async stop(): Promise<void> {
    this.clearQueue();
    this.playing = false;
    
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    if (this.audioContext) {
      if (this.audioContext.state !== "closed") {
        try {
          await this.audioContext.close();
        } catch {
          // Context might already be closed
        }
      }
      this.audioContext = null;
    }
  }

  clearQueue(): void {
    for (const source of this.activeSources) {
      try {
        source.stop();
      } catch {
        // Node might not be started
      }
      try {
        source.disconnect();
      } catch {
        // Node might not be connected
      }
    }
    this.activeSources.clear();
    this.nextPlaybackTime = 0;
    this.playing = false;
  }
}

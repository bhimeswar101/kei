import { voiceConfig } from "@/core/config/voice.config";
import { permissionManager } from "@/core/permissions";
import type { AudioCaptureServiceContract } from "./types";

export class AudioCaptureService implements AudioCaptureServiceContract {
  private capturing = false;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;

  isCapturing(): boolean {
    return this.capturing;
  }

  async start(onChunk: (chunk: ArrayBuffer) => void): Promise<void> {
    if (this.capturing) {
      return;
    }

    const isGranted = permissionManager.isGranted("microphone");
    if (!isGranted) {
      const status = await permissionManager.request("microphone");
      if (status !== "granted") {
        throw new Error("Microphone permission not granted.");
      }
    }

    if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Microphone API is not available.");
    }

    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: voiceConfig.input.sampleRate,
        channelCount: voiceConfig.input.channels,
        echoCancellation: voiceConfig.echoCancellation,
        noiseSuppression: voiceConfig.noiseSuppression,
        autoGainControl: voiceConfig.autoGainControl,
      },
    });

    const AudioContextClass = typeof AudioContext !== "undefined"
      ? AudioContext
      : (typeof window !== "undefined" ? (window as any).webkitAudioContext : null);

    if (!AudioContextClass) {
      this.cleanup();
      throw new Error("AudioContext is not supported by this browser.");
    }

    this.audioContext = new AudioContextClass({
      sampleRate: voiceConfig.input.sampleRate,
    });

    this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
    this.processorNode = this.audioContext.createScriptProcessor(2048, 1, 1);

    this.processorNode.onaudioprocess = (event) => {
      if (!this.capturing) return;

      const inputBuffer = event.inputBuffer;
      const channelData = inputBuffer.getChannelData(0);

      const pcmBuffer = new ArrayBuffer(channelData.length * 2);
      const view = new DataView(pcmBuffer);
      
      for (let i = 0; i < channelData.length; i++) {
        const sample = Math.max(-1, Math.min(1, channelData[i]));
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(i * 2, intSample, true);
      }

      onChunk(pcmBuffer);
    };

    this.sourceNode.connect(this.processorNode);
    this.processorNode.connect(this.audioContext.destination);

    this.capturing = true;
  }

  async stop(): Promise<void> {
    if (!this.capturing) {
      return;
    }

    this.capturing = false;
    await this.cleanup();
  }

  private async cleanup(): Promise<void> {
    if (this.processorNode) {
      try {
        this.processorNode.disconnect();
      } catch {
        // Node might not be connected
      }
      this.processorNode.onaudioprocess = null;
      this.processorNode = null;
    }

    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch {
        // Node might not be connected
      }
      this.sourceNode = null;
    }

    if (this.mediaStream) {
      for (const track of this.mediaStream.getTracks()) {
        track.stop();
      }
      this.mediaStream = null;
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
}

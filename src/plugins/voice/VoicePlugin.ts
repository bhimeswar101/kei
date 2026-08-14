import { BasePlugin } from "../../core/plugins/BasePlugin";
import type { PluginMetadata } from "../../core/plugins/types";
import {
  AudioCaptureService,
  AudioPlaybackService,
  VadService,
  WebSocketStreamingClient,
  InteractionCoordinator,
} from "../../core/interaction";

export class VoicePlugin extends BasePlugin {
  private coordinator: InteractionCoordinator | null = null;

  constructor(
    metadata: PluginMetadata = {
      id: "voice",
      name: "Voice Plugin",
      version: "0.1.0",
      description: "Provides a browser-based voice interaction hook for the assistant.",
    },
  ) {
    super(metadata);
  }

  async start(): Promise<void> {
    if (this.isRunning()) {
      return;
    }

    this.setState("starting");

    try {
      const captureService = new AudioCaptureService();
      const playbackService = new AudioPlaybackService();
      const vadService = new VadService();
      const streamingClient = new WebSocketStreamingClient();

      this.coordinator = new InteractionCoordinator(
        captureService,
        playbackService,
        vadService,
        streamingClient
      );

      await this.coordinator.start();
      this.setState("running");
    } catch (error) {
      console.error("[VoicePlugin] Failed to start:", error);
      this.setState("error");
      throw error;
    }
  }

  async speak(text: string): Promise<void> {
    if (this.coordinator) {
      await this.coordinator.speak(text);
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning()) {
      this.setState("stopped");
      return;
    }

    this.setState("stopping");
    
    if (this.coordinator) {
      try {
        await this.coordinator.stop();
      } catch (error) {
        console.error("[VoicePlugin] Error stopping coordinator:", error);
      }
      this.coordinator = null;
    }
    
    this.setState("stopped");
  }
}

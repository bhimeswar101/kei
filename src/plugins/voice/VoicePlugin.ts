import { BasePlugin } from "../../core/plugins/BasePlugin";
import type { PluginMetadata } from "../../core/plugins/types";

interface SpeechRecognitionLike {
  start(): void;
  stop(): void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

export class VoicePlugin extends BasePlugin {
  private recognition: SpeechRecognitionLike | null = null;

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

    if (typeof window === "undefined") {
      this.setState("error");
      return;
    }

    const recognitionWindow = window as WindowWithSpeechRecognition;
    const RecognitionCtor =
      recognitionWindow.SpeechRecognition ?? recognitionWindow.webkitSpeechRecognition;

    if (!RecognitionCtor) {
      this.setState("error");
      return;
    }

    this.recognition = new RecognitionCtor();
    this.setState("running");
  }

  async stop(): Promise<void> {
    if (!this.isRunning()) {
      this.setState("stopped");
      return;
    }

    this.recognition?.stop();
    this.recognition = null;
    this.setState("stopped");
  }
}

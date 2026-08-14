import { eventBus } from "@/core/events";
import { EVENTS } from "@/shared/constants/events";
import type {
  AudioCaptureServiceContract,
  AudioPlaybackServiceContract,
  VadServiceContract,
  WebSocketStreamingClientContract,
  InteractionState,
} from "./types";
import { InterruptionController } from "./InterruptionController";

export class InteractionCoordinator {
  private currentState: InteractionState = "idle";
  private readonly interruptionController: InterruptionController;

  constructor(
    private readonly captureService: AudioCaptureServiceContract,
    private readonly playbackService: AudioPlaybackServiceContract,
    private readonly vadService: VadServiceContract,
    private readonly streamingClient: WebSocketStreamingClientContract,
  ) {
    this.interruptionController = new InterruptionController(
      this.playbackService,
      this.streamingClient,
      () => this.transitionTo("listening")
    );

    this.vadService.onSpeechStart(() => this.handleSpeechStart());
    this.vadService.onSpeechEnd(() => this.handleSpeechEnd());

    this.streamingClient.onAudioChunk((chunk) => this.handleResponseAudio(chunk));
    this.streamingClient.onTextChunk((text) => this.handleResponseText(text));
    this.streamingClient.onInterrupted(() => this.handleRemoteInterruption());
    this.streamingClient.onError((error) => this.handleError(error));
    this.streamingClient.onClose(() => this.handleConnectionClose());
  }

  getState(): InteractionState {
    return this.currentState;
  }

  async start(): Promise<void> {
    if (this.currentState !== "idle") {
      throw new Error(`Cannot start interaction coordinator from state "${this.currentState}".`);
    }

    try {
      this.transitionTo("listening");
      await this.streamingClient.connect();
      
      await this.captureService.start((chunk) => {
        this.vadService.process(chunk);
        
        if (this.currentState === "listening") {
          this.streamingClient.sendAudio(chunk);
        }
      });

      await eventBus.emit(EVENTS.VOICE_START, {});
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.currentState === "idle") {
      return;
    }

    this.transitionTo("idle");

    await this.captureService.stop();
    await this.playbackService.stop();
    await this.streamingClient.disconnect();
    this.vadService.reset();
    
    await eventBus.emit(EVENTS.VOICE_STOP, {});
  }

  async speak(text: string): Promise<void> {
    this.transitionTo("speaking");
    try {
      await this.playbackService.speakText(text);
      this.transitionTo("listening");
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private handleSpeechStart(): void {
    if (this.currentState === "speaking") {
      this.transitionTo("interrupted");
      this.interruptionController.handleInterruption();
    } else {
      this.transitionTo("listening");
    }
  }

  private handleSpeechEnd(): void {
    if (this.currentState === "listening") {
      this.transitionTo("thinking");
    }
  }

  private handleResponseAudio(chunk: ArrayBuffer): void {
    if (this.currentState === "thinking") {
      this.transitionTo("speaking");
    }
    
    if (this.currentState === "speaking") {
      void this.playbackService.play(chunk);
    }
  }

  private handleResponseText(text: string): void {
    void eventBus.emit("interaction:text-received", { text });
  }

  private handleRemoteInterruption(): void {
    this.transitionTo("interrupted");
    this.interruptionController.handleInterruption();
  }

  private handleConnectionClose(): void {
    if (this.currentState !== "idle") {
      void this.stop();
    }
  }

  private handleError(error: Error): void {
    console.error("[InteractionCoordinator] Error encountered:", error);
    void this.stop();
  }

  private transitionTo(state: InteractionState): void {
    if (this.currentState === "idle" && state !== "listening") {
      throw new Error(`Invalid transition from "idle" to "${state}".`);
    }
    
    this.currentState = state;
    void eventBus.emit("interaction:state-changed", { state });
  }
}

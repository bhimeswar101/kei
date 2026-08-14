import type { AudioPlaybackServiceContract, WebSocketStreamingClientContract } from "./types";

export class InterruptionController {
  constructor(
    private readonly playbackService: AudioPlaybackServiceContract,
    private readonly streamingClient: WebSocketStreamingClientContract,
    private readonly onInterrupt: () => void,
  ) {}

  handleInterruption(): void {
    // 1. Immediately stop playback and clear queue
    this.playbackService.clearQueue();

    // 2. Notify streaming layer
    if (this.streamingClient.isConnected()) {
      this.streamingClient.sendInterruption();
    }

    // 3. Transition interaction state to listening
    this.onInterrupt();
  }
}

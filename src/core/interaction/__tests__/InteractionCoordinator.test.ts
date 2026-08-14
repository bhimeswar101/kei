import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InteractionCoordinator } from "../InteractionCoordinator";
import { eventBus } from "@/core/events";
import { EVENTS } from "@/shared/constants/events";

describe("InteractionCoordinator", () => {
  let captureService: any;
  let playbackService: any;
  let vadService: any;
  let streamingClient: any;

  let vadSpeechStart: (() => void) | null = null;
  let vadSpeechEnd: (() => void) | null = null;

  let streamAudioChunk: ((chunk: ArrayBuffer) => void) | null = null;
  let streamTextChunk: ((text: string) => void) | null = null;
  let streamInterrupted: (() => void) | null = null;
  let streamError: ((error: Error) => void) | null = null;
  let streamClose: (() => void) | null = null;

  beforeEach(() => {
    captureService = {
      start: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn().mockResolvedValue(undefined),
      isCapturing: vi.fn().mockReturnValue(false),
    };

    playbackService = {
      play: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn().mockResolvedValue(undefined),
      isPlaying: vi.fn().mockReturnValue(false),
      clearQueue: vi.fn(),
    };

    vadService = {
      process: vi.fn(),
      reset: vi.fn(),
      isSpeaking: vi.fn().mockReturnValue(false),
      onSpeechStart: vi.fn().mockImplementation((cb) => { vadSpeechStart = cb; }),
      onSpeechEnd: vi.fn().mockImplementation((cb) => { vadSpeechEnd = cb; }),
    };

    streamingClient = {
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      sendAudio: vi.fn(),
      sendText: vi.fn(),
      sendInterruption: vi.fn(),
      onAudioChunk: vi.fn().mockImplementation((cb) => { streamAudioChunk = cb; }),
      onTextChunk: vi.fn().mockImplementation((cb) => { streamTextChunk = cb; }),
      onInterrupted: vi.fn().mockImplementation((cb) => { streamInterrupted = cb; }),
      onError: vi.fn().mockImplementation((cb) => { streamError = cb; }),
      onClose: vi.fn().mockImplementation((cb) => { streamClose = cb; }),
      isConnected: vi.fn().mockReturnValue(true),
    };

    vi.spyOn(eventBus, "emit").mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vadSpeechStart = null;
    vadSpeechEnd = null;
    streamAudioChunk = null;
    streamTextChunk = null;
    streamInterrupted = null;
    streamError = null;
    streamClose = null;
  });

  it("coordinates initialization and hook registrations", () => {
    const coordinator = new InteractionCoordinator(
      captureService,
      playbackService,
      vadService,
      streamingClient
    );

    expect(coordinator.getState()).toBe("idle");
    expect(vadService.onSpeechStart).toHaveBeenCalled();
    expect(vadService.onSpeechEnd).toHaveBeenCalled();
    expect(streamingClient.onAudioChunk).toHaveBeenCalled();
    expect(streamingClient.onTextChunk).toHaveBeenCalled();
    expect(streamingClient.onInterrupted).toHaveBeenCalled();
  });

  it("manages successful start and stop lifecycles", async () => {
    const coordinator = new InteractionCoordinator(
      captureService,
      playbackService,
      vadService,
      streamingClient
    );

    await coordinator.start();
    expect(coordinator.getState()).toBe("listening");
    expect(streamingClient.connect).toHaveBeenCalled();
    expect(captureService.start).toHaveBeenCalled();
    expect(eventBus.emit).toHaveBeenCalledWith(EVENTS.VOICE_START, {});

    const captureCallback = captureService.start.mock.calls[0][0];
    const dummyChunk = new ArrayBuffer(10);
    captureCallback(dummyChunk);

    expect(vadService.process).toHaveBeenCalledWith(dummyChunk);
    expect(streamingClient.sendAudio).toHaveBeenCalledWith(dummyChunk);

    await coordinator.stop();
    expect(coordinator.getState()).toBe("idle");
    expect(captureService.stop).toHaveBeenCalled();
    expect(playbackService.stop).toHaveBeenCalled();
    expect(streamingClient.disconnect).toHaveBeenCalled();
    expect(vadService.reset).toHaveBeenCalled();
    expect(eventBus.emit).toHaveBeenCalledWith(EVENTS.VOICE_STOP, {});
  });

  it("coordinates speech-start and speech-end state transitions", async () => {
    const coordinator = new InteractionCoordinator(
      captureService,
      playbackService,
      vadService,
      streamingClient
    );

    await coordinator.start();
    expect(coordinator.getState()).toBe("listening");

    vadSpeechEnd!();
    expect(coordinator.getState()).toBe("thinking");

    const audioChunk = new ArrayBuffer(50);
    streamAudioChunk!(audioChunk);
    expect(coordinator.getState()).toBe("speaking");
    expect(playbackService.play).toHaveBeenCalledWith(audioChunk);
  });

  it("executes barge-in interruption when user speaks during speaking state", async () => {
    const coordinator = new InteractionCoordinator(
      captureService,
      playbackService,
      vadService,
      streamingClient
    );

    await coordinator.start();
    
    vadSpeechEnd!();
    streamAudioChunk!(new ArrayBuffer(10));
    expect(coordinator.getState()).toBe("speaking");

    vadSpeechStart!();
    
    expect(coordinator.getState()).toBe("listening");
    expect(playbackService.clearQueue).toHaveBeenCalled();
    expect(streamingClient.sendInterruption).toHaveBeenCalled();
  });

  it("guards against double start error", async () => {
    const coordinator = new InteractionCoordinator(
      captureService,
      playbackService,
      vadService,
      streamingClient
    );

    await coordinator.start();
    await expect(coordinator.start()).rejects.toThrow();
  });
});

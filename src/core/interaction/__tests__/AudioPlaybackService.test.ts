import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AudioPlaybackService } from "../AudioPlaybackService";

describe("AudioPlaybackService", () => {
  let mockAudioContext: any;
  let mockSourceNode: any;
  let mockSpeechSynthesis: any;

  beforeEach(() => {
    mockSourceNode = {
      buffer: null,
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      onended: null as any,
    };

    mockAudioContext = {
      state: "running",
      currentTime: 10,
      resume: vi.fn().mockResolvedValue(undefined),
      createBuffer: vi.fn().mockReturnValue({
        duration: 1.5,
        copyToChannel: vi.fn(),
      }),
      createBufferSource: vi.fn().mockReturnValue(mockSourceNode),
      destination: {},
      close: vi.fn().mockResolvedValue(undefined),
    };

    vi.stubGlobal("AudioContext", vi.fn().mockImplementation(function() {
      return mockAudioContext;
    }));

    mockSpeechSynthesis = {
      speak: vi.fn().mockImplementation((utterance: any) => {
        setTimeout(() => {
          if (utterance.onend) utterance.onend();
        }, 10);
      }),
      cancel: vi.fn(),
    };

    vi.stubGlobal("window", {
      AudioContext: function() { return mockAudioContext; },
      speechSynthesis: mockSpeechSynthesis,
    });

    vi.stubGlobal("SpeechSynthesisUtterance", vi.fn().mockImplementation(function(text) {
      return {
        text,
        onend: null as any,
        onerror: null as any,
      };
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("exposes initial isPlaying state as false", () => {
    const service = new AudioPlaybackService();
    expect(service.isPlaying()).toBe(false);
  });

  it("schedules sequential audio chunk playback", async () => {
    const service = new AudioPlaybackService();
    const pcm = new Int16Array(100).fill(1000).buffer;

    await service.play(pcm);
    expect(service.isPlaying()).toBe(true);
    expect(mockAudioContext.createBuffer).toHaveBeenCalled();
    expect(mockSourceNode.start).toHaveBeenCalledWith(10);

    await service.play(pcm);
    expect(mockSourceNode.start).toHaveBeenLastCalledWith(11.5);

    await service.stop();
    expect(service.isPlaying()).toBe(false);
    expect(mockSourceNode.stop).toHaveBeenCalled();
    expect(mockAudioContext.close).toHaveBeenCalled();
  });

  it("handles text-to-speech speakText command successfully", async () => {
    const service = new AudioPlaybackService();
    
    const speakPromise = service.speakText("Hello world");
    expect(service.isPlaying()).toBe(true);
    expect(mockSpeechSynthesis.speak).toHaveBeenCalled();

    await speakPromise;
    expect(service.isPlaying()).toBe(false);
  });

  it("cancels TTS speech on stop", async () => {
    const service = new AudioPlaybackService();
    void service.speakText("Hello world");
    await service.stop();

    expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    expect(service.isPlaying()).toBe(false);
  });
});

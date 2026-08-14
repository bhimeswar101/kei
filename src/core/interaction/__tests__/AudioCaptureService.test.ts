import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AudioCaptureService } from "../AudioCaptureService";
import { permissionManager } from "@/core/permissions";

describe("AudioCaptureService", () => {
  beforeEach(() => {
    vi.spyOn(permissionManager, "isGranted").mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("exposes initial isCapturing state as false", () => {
    const service = new AudioCaptureService();
    expect(service.isCapturing()).toBe(false);
  });

  it("requests permission and captures raw microphone data", async () => {
    const trackStopMock = vi.fn();
    const mockStream = {
      getTracks: () => [{ stop: trackStopMock }],
    };

    const mockSourceNode = {
      connect: vi.fn(),
      disconnect: vi.fn(),
    };

    const mockProcessorNode = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      onaudioprocess: null as any,
    };

    const mockAudioContext = {
      state: "running",
      createMediaStreamSource: vi.fn().mockReturnValue(mockSourceNode),
      createScriptProcessor: vi.fn().mockReturnValue(mockProcessorNode),
      destination: {},
      close: vi.fn().mockResolvedValue(undefined),
    };

    vi.stubGlobal("navigator", {
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
      },
    });

    vi.stubGlobal("AudioContext", vi.fn().mockImplementation(function() {
      return mockAudioContext;
    }));

    const service = new AudioCaptureService();
    const onChunkMock = vi.fn();

    await service.start(onChunkMock);

    expect(service.isCapturing()).toBe(true);
    expect(mockAudioContext.createMediaStreamSource).toHaveBeenCalledWith(mockStream);
    expect(mockAudioContext.createScriptProcessor).toHaveBeenCalledWith(2048, 1, 1);
    expect(mockSourceNode.connect).toHaveBeenCalledWith(mockProcessorNode);
    expect(mockProcessorNode.connect).toHaveBeenCalledWith(mockAudioContext.destination);

    expect(mockProcessorNode.onaudioprocess).toBeTypeOf("function");
    
    const simulatedEvent = {
      inputBuffer: {
        getChannelData: () => new Float32Array([0.5, -0.5, 0]),
      },
    };
    
    mockProcessorNode.onaudioprocess(simulatedEvent as any);
    expect(onChunkMock).toHaveBeenCalledTimes(1);

    const arg = onChunkMock.mock.calls[0][0];
    expect(arg).toBeInstanceOf(ArrayBuffer);
    const view = new DataView(arg);
    expect(view.getInt16(0, true)).toBe(Math.floor(0.5 * 0x7FFF));
    expect(view.getInt16(2, true)).toBe(Math.floor(-0.5 * 0x8000));
    expect(view.getInt16(4, true)).toBe(0);

    await service.stop();
    expect(service.isCapturing()).toBe(false);
    expect(mockProcessorNode.disconnect).toHaveBeenCalled();
    expect(mockSourceNode.disconnect).toHaveBeenCalled();
    expect(trackStopMock).toHaveBeenCalled();
    expect(mockAudioContext.close).toHaveBeenCalled();
  });
});

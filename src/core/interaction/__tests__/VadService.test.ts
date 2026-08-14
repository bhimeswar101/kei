import { describe, expect, it, vi } from "vitest";
import { VadService } from "../VadService";

describe("VadService", () => {
  const generateChunk = (samplesCount: number, amplitude: number): ArrayBuffer => {
    const array = new Int16Array(samplesCount);
    array.fill(amplitude);
    return array.buffer;
  };

  it("exposes initial speaking state as false", () => {
    const vad = new VadService();
    expect(vad.isSpeaking()).toBe(false);
  });

  it("silence does not trigger speech", () => {
    const vad = new VadService();
    const startMock = vi.fn();
    vad.onSpeechStart(startMock);

    const chunk = generateChunk(16000, 0);
    vad.process(chunk);

    expect(vad.isSpeaking()).toBe(false);
    expect(startMock).not.toHaveBeenCalled();
  });

  it("loud audio triggers speech start after speechDuration", () => {
    const vad = new VadService({
      speechDuration: 150,
      sampleRate: 16000,
    });
    const startMock = vi.fn();
    vad.onSpeechStart(startMock);

    const chunk = generateChunk(2400, 10000);
    vad.process(chunk);

    expect(vad.isSpeaking()).toBe(true);
    expect(startMock).toHaveBeenCalledTimes(1);
  });

  it("sustained speech remains active", () => {
    const vad = new VadService();
    const startMock = vi.fn();
    vad.onSpeechStart(startMock);

    vad.process(generateChunk(2400, 10000));
    expect(vad.isSpeaking()).toBe(true);

    vad.process(generateChunk(2400, 10000));
    vad.process(generateChunk(2400, 10000));
    expect(vad.isSpeaking()).toBe(true);
    expect(startMock).toHaveBeenCalledTimes(1);
  });

  it("silence after speech triggers speech end after silenceDuration", () => {
    const vad = new VadService({
      silenceDuration: 500,
      sampleRate: 16000,
    });
    const endMock = vi.fn();
    vad.onSpeechEnd(endMock);

    vad.process(generateChunk(2400, 15000));
    expect(vad.isSpeaking()).toBe(true);

    vad.process(generateChunk(1600, 0));
    expect(vad.isSpeaking()).toBe(true);
    expect(endMock).not.toHaveBeenCalled();

    vad.process(generateChunk(8000, 0));
    expect(vad.isSpeaking()).toBe(false);
    expect(endMock).toHaveBeenCalledTimes(1);
  });

  it("respects custom threshold configurations", () => {
    const vad = new VadService({
      threshold: 0.1,
      sampleRate: 16000,
    });
    const startMock = vi.fn();
    vad.onSpeechStart(startMock);

    vad.process(generateChunk(2400, 1000));
    expect(vad.isSpeaking()).toBe(false);

    vad.process(generateChunk(2400, 15000));
    expect(vad.isSpeaking()).toBe(true);
    expect(startMock).toHaveBeenCalled();
  });
});

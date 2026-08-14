import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WebSocketStreamingClient } from "../WebSocketStreamingClient";

describe("WebSocketStreamingClient", () => {
  let mockSocket: any;

  beforeEach(() => {
    mockSocket = {
      send: vi.fn(),
      close: vi.fn(),
      onopen: null,
      onmessage: null,
      onerror: null,
      onclose: null,
    };

    vi.stubGlobal("WebSocket", vi.fn().mockImplementation(function() {
      setTimeout(() => {
        if (mockSocket.onopen) mockSocket.onopen();
      }, 0);
      return mockSocket;
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("exposes initial connected state as false", () => {
    const client = new WebSocketStreamingClient();
    expect(client.isConnected()).toBe(false);
  });

  it("connects and sends configuration payload", async () => {
    const client = new WebSocketStreamingClient();
    
    await client.connect();
    expect(client.isConnected()).toBe(true);
    expect(mockSocket.send).toHaveBeenCalled();

    const sentData = JSON.parse(mockSocket.send.mock.calls[0][0]);
    expect(sentData.setup).toBeDefined();
    expect(sentData.setup.model).toBe("models/gemini-2.0-flash-exp");
  });

  it("sends audio PCM chunks as base64 payload", async () => {
    const client = new WebSocketStreamingClient();
    await client.connect();

    const pcm = new Int16Array([1000, -2000, 0]).buffer;
    client.sendAudio(pcm);

    expect(mockSocket.send).toHaveBeenCalledTimes(2);
    const sentData = JSON.parse(mockSocket.send.mock.calls[1][0]);
    expect(sentData.realtimeInput.mediaChunks[0].data).toBeTypeOf("string");
  });

  it("sends text prompt payload", async () => {
    const client = new WebSocketStreamingClient();
    await client.connect();

    client.sendText("hello");
    expect(mockSocket.send).toHaveBeenCalledTimes(2);
    const sentData = JSON.parse(mockSocket.send.mock.calls[1][0]);
    expect(sentData.realtimeInput.parts[0].text).toBe("hello");
  });

  it("sends interruption request payload", async () => {
    const client = new WebSocketStreamingClient();
    await client.connect();

    client.sendInterruption();
    expect(mockSocket.send).toHaveBeenCalledTimes(2);
    const sentData = JSON.parse(mockSocket.send.mock.calls[1][0]);
    expect(sentData.clientContent.turns).toEqual([]);
  });

  it("parses server content response correctly", async () => {
    const client = new WebSocketStreamingClient();
    const audioMock = vi.fn();
    const textMock = vi.fn();
    const interruptMock = vi.fn();

    client.onAudioChunk(audioMock);
    client.onTextChunk(textMock);
    client.onInterrupted(interruptMock);

    await client.connect();

    const responsePayload = {
      serverContent: {
        modelTurn: {
          parts: [
            { text: "Response transcript" },
            { inlineData: { data: "SGVsbG8=" } },
          ],
        },
      },
    };

    mockSocket.onmessage({ data: JSON.stringify(responsePayload) });
    expect(textMock).toHaveBeenCalledWith("Response transcript");
    expect(audioMock).toHaveBeenCalled();
    expect(audioMock.mock.calls[0][0]).toBeInstanceOf(ArrayBuffer);

    mockSocket.onmessage({
      data: JSON.stringify({
        serverContent: { interrupted: true },
      }),
    });
    expect(interruptMock).toHaveBeenCalled();
  });
});

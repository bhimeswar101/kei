import { invoke } from "@tauri-apps/api/core";
import type { WebSocketStreamingClientContract } from "./types";

export class WebSocketStreamingClient implements WebSocketStreamingClientContract {
  private socket: WebSocket | null = null;
  private connected = false;

  private audioCallback: ((chunk: ArrayBuffer) => void) | null = null;
  private textCallback: ((text: string) => void) | null = null;
  private interruptCallback: (() => void) | null = null;
  private errorCallback: ((error: Error) => void) | null = null;
  private closeCallback: (() => void) | null = null;

  isConnected(): boolean {
    return this.connected;
  }

  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    let apiKey = "";
    if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
      try {
        apiKey = await invoke<string>("get_gemini_api_key");
      } catch (error) {
        throw new Error(`Failed to retrieve Gemini API key from backend: ${error}`);
      }
    } else {
      apiKey = "MOCK_API_KEY";
    }

    const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`;

    return new Promise((resolve, reject) => {
      try {
        const SocketClass = typeof WebSocket !== "undefined" ? WebSocket : (globalThis as any).WebSocket;
        if (!SocketClass) {
          throw new Error("WebSocket is not supported in this environment.");
        }

        this.socket = new SocketClass(url);

        this.socket.onopen = () => {
          this.connected = true;
          const setupMsg = {
            setup: {
              model: "models/gemini-2.0-flash-exp",
              generationConfig: {
                responseModalities: ["audio"],
              },
            },
          };
          this.socket?.send(JSON.stringify(setupMsg));
          resolve();
        };

        this.socket.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.socket.onerror = (event) => {
          void event;
          const err = new Error("WebSocket connection error.");
          this.errorCallback?.(err);
          if (!this.connected) {
            reject(err);
          }
        };

        this.socket.onclose = () => {
          this.connected = false;
          this.closeCallback?.();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.connected = false;
  }

  sendAudio(chunk: ArrayBuffer): void {
    if (!this.connected || !this.socket) {
      return;
    }

    const base64Data = this.arrayBufferToBase64(chunk);
    const msg = {
      realtimeInput: {
        mediaChunks: [
          {
            mimeType: "audio/pcm;rate=16000",
            data: base64Data,
          },
        ],
      },
    };

    this.socket.send(JSON.stringify(msg));
  }

  sendText(text: string): void {
    if (!this.connected || !this.socket) {
      return;
    }

    const msg = {
      realtimeInput: {
        parts: [
          {
            text: text,
          },
        ],
      },
    };

    this.socket.send(JSON.stringify(msg));
  }

  sendInterruption(): void {
    if (!this.connected || !this.socket) {
      return;
    }

    const msg = {
      clientContent: {
        turns: [],
        turnComplete: false,
      },
    };

    this.socket.send(JSON.stringify(msg));
  }

  onAudioChunk(callback: (chunk: ArrayBuffer) => void): void {
    this.audioCallback = callback;
  }

  onTextChunk(callback: (text: string) => void): void {
    this.textCallback = callback;
  }

  onInterrupted(callback: () => void): void {
    this.interruptCallback = callback;
  }

  onError(callback: (error: Error) => void): void {
    this.errorCallback = callback;
  }

  onClose(callback: () => void): void {
    this.closeCallback = callback;
  }

  private handleMessage(data: string | Blob): void {
    try {
      const text = typeof data === "string" ? data : "";
      if (!text) return;

      const msg = JSON.parse(text);

      if (msg.serverContent) {
        if (msg.serverContent.interrupted) {
          this.interruptCallback?.();
        }

        const modelTurn = msg.serverContent.modelTurn;
        if (modelTurn && modelTurn.parts) {
          for (const part of modelTurn.parts) {
            if (part.text) {
              this.textCallback?.(part.text);
            }
            if (part.inlineData && part.inlineData.data) {
              const audioBuffer = this.base64ToArrayBuffer(part.inlineData.data);
              this.audioCallback?.(audioBuffer);
            }
          }
        }
      }
    } catch (error) {
      this.errorCallback?.(error as Error);
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return typeof window !== "undefined" && window.btoa ? window.btoa(binary) : Buffer.from(binary, "binary").toString("base64");
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = typeof window !== "undefined" && window.atob ? window.atob(base64) : Buffer.from(base64, "base64").toString("binary");
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

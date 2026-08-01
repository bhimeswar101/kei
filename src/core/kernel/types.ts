// src/core/kernel/types.ts

export type KernelState = "idle" | "starting" | "running" | "stopping" | "stopped";

export interface AppKernelContract {
  start(): Promise<void>;

  stop(): Promise<void>;

  restart(): Promise<void>;

  getState(): KernelState;

  isRunning(): boolean;
}

export type KernelState =
  | "idle"
  | "starting"
  | "running"
  | "stopping"
  | "stopped";
  export interface AppKernelContract {
  start(): void;

  stop(): void;

  restart(): void;

  getState(): KernelState;

  isRunning(): boolean;
}
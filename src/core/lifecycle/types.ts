export type LifecycleState =
  | "idle"
  | "starting"
  | "running"
  | "stopping"
  | "stopped";

export interface LifecycleContract {
  start(): Promise<void>;

  stop(): Promise<void>;

  restart(): Promise<void>;

  state(): LifecycleState;

  isRunning(): boolean;
}
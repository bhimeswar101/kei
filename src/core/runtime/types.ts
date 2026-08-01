export type RuntimeState =
  | "idle"
  | "starting"
  | "running"
  | "stopping"
  | "stopped"
  | "error";

export interface RuntimeContract {
  start(): Promise<void>;

  stop(): Promise<void>;

  restart(): Promise<void>;

  getState(): RuntimeState;

  isRunning(): boolean;
}
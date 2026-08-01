export type BackgroundServiceState =
  | "idle"
  | "starting"
  | "running"
  | "stopping"
  | "stopped"
  | "error";

export interface BackgroundService {
  readonly id: string;
  readonly name: string;

  start(): Promise<void>;
  stop(): Promise<void>;

  getState(): BackgroundServiceState;
  isRunning(): boolean;
}

export interface BackgroundServiceManagerContract {
  register(service: BackgroundService): void;

  unregister(id: string): void;

  get(id: string): BackgroundService | undefined;

  getAll(): BackgroundService[];

  start(id: string): Promise<void>;
  stop(id: string): Promise<void>;

  startAll(): Promise<void>;
  stopAll(): Promise<void>;
}
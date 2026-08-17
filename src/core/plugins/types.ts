export type PluginState =
  | "registered"
  | "starting"
  | "running"
  | "stopping"
  | "stopped"
  | "error";

export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  author?: string;
  description?: string;
  permissions: readonly string[];
}

export interface PluginContract {
  readonly metadata: PluginMetadata;

  start(): Promise<void>;

  stop(): Promise<void>;

  state(): PluginState;

  isRunning(): boolean;
}
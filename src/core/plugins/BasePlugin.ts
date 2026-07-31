import type {
  PluginContract,
  PluginMetadata,
  PluginState,
} from "./types";

export abstract class BasePlugin
  implements PluginContract
{
  public readonly metadata: PluginMetadata;

  protected currentState: PluginState =
    "registered";

  constructor(metadata: PluginMetadata) {
    this.metadata = metadata;
  }

  state(): PluginState {
    return this.currentState;
  }

  isRunning(): boolean {
    return this.currentState === "running";
  }

  protected setState(
    state: PluginState,
  ): void {
    this.currentState = state;
  }

  abstract start(): Promise<void>;

  abstract stop(): Promise<void>;
}
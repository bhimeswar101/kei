import type { KeiRequestInput, KeiRequestResult } from "@/core/runtime";

export type PreRequestObserver = (
  input: KeiRequestInput,
) => Promise<void> | void;

export type PostResponseObserver = (
  result: KeiRequestResult,
) => Promise<void> | void;

export class PluginMiddleware {
  private readonly preRequestObservers = new Map<string, PreRequestObserver[]>();
  private readonly postResponseObservers = new Map<string, PostResponseObserver[]>();

  registerPreRequestObserver(
    pluginId: string,
    observer: PreRequestObserver,
  ): void {
    const list = this.preRequestObservers.get(pluginId) ?? [];
    list.push(observer);
    this.preRequestObservers.set(pluginId, list);
  }

  registerPostResponseObserver(
    pluginId: string,
    observer: PostResponseObserver,
  ): void {
    const list = this.postResponseObservers.get(pluginId) ?? [];
    list.push(observer);
    this.postResponseObservers.set(pluginId, list);
  }

  unregisterObservers(pluginId: string): void {
    this.preRequestObservers.delete(pluginId);
    this.postResponseObservers.delete(pluginId);
  }

  async executePreRequestObservers(input: KeiRequestInput): Promise<void> {
    for (const list of this.preRequestObservers.values()) {
      for (const observer of list) {
        try {
          await observer(input);
        } catch (error) {
          console.error(
            `[PluginMiddleware] PreRequestObserver error:`,
            error,
          );
        }
      }
    }
  }

  async executePostResponseObservers(result: KeiRequestResult): Promise<void> {
    for (const list of this.postResponseObservers.values()) {
      for (const observer of list) {
        try {
          await observer(result);
        } catch (error) {
          console.error(
            `[PluginMiddleware] PostResponseObserver error:`,
            error,
          );
        }
      }
    }
  }

  clear(): void {
    this.preRequestObservers.clear();
    this.postResponseObservers.clear();
  }
}

export const pluginMiddleware = new PluginMiddleware();

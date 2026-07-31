import { eventBus } from "@/core/events";
import type { PluginContract } from "./types";

export class PluginManager {
  private readonly plugins = new Map<
    string,
    PluginContract
  >();

  register(plugin: PluginContract): void {
    const id = plugin.metadata.id;

    if (this.plugins.has(id)) {
      throw new Error(
        `Plugin "${id}" is already registered.`,
      );
    }

    this.plugins.set(id, plugin);

    eventBus.emit("plugin:registered", {
      id,
    });
  }

  unregister(id: string): void {
    if (!this.plugins.has(id)) {
      return;
    }

    this.plugins.delete(id);

    eventBus.emit("plugin:unregistered", {
      id,
    });
  }

  get(id: string): PluginContract | undefined {
    return this.plugins.get(id);
  }

  getAll(): PluginContract[] {
    return [...this.plugins.values()];
  }

  has(id: string): boolean {
    return this.plugins.has(id);
  }

  async startAll(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      try {
        await plugin.start();

        eventBus.emit("plugin:started", {
          id: plugin.metadata.id,
        });
      } catch (error) {
        console.error(error);

        eventBus.emit("plugin:error", {
          id: plugin.metadata.id,
          error,
        });
      }
    }
  }

  async stopAll(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      try {
        await plugin.stop();

        eventBus.emit("plugin:stopped", {
          id: plugin.metadata.id,
        });
      } catch (error) {
        console.error(error);
      }
    }
  }

  clear(): void {
    this.plugins.clear();
  }
}

export const pluginManager =
  new PluginManager();
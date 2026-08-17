import { eventBus } from "@/core/events";
import { capabilityHandlerRegistry } from "@/core/execution/CapabilityHandlerRegistry";
import type { CapabilityHandlerContract } from "@/core/execution/CapabilityHandler";
import { pluginMiddleware } from "./PluginMiddleware";
import type { PreRequestObserver, PostResponseObserver } from "./PluginMiddleware";
import { pluginDiagnostics } from "./diagnostics";
import type { PluginContract } from "./types";

export class PluginManager {
  private readonly plugins = new Map<string, PluginContract>();
  private readonly registeredHandlers = new Map<string, string[]>();

  register(plugin: PluginContract): void {
    const id = plugin.metadata.id;

    if (this.plugins.has(id)) {
      throw new Error(`Plugin "${id}" is already registered.`);
    }

    this.plugins.set(id, plugin);
    pluginDiagnostics.trace({ pluginId: id, action: "register", status: "success" });
    eventBus.emit("plugin:registered", { id });
  }

  unregister(id: string): void {
    if (!this.plugins.has(id)) {
      return;
    }

    this.cleanupPluginResources(id);
    this.plugins.delete(id);
    pluginDiagnostics.trace({ pluginId: id, action: "unregister", status: "success" });

    eventBus.emit("plugin:unregistered", { id });
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

  registerCapabilityHandler(
    pluginId: string,
    handler: CapabilityHandlerContract,
  ): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin "${pluginId}" is not registered.`);
    }

    const permissions = plugin.metadata.permissions ?? [];
    const requiredPermission = handler.capabilityId.split(".")[0];
    if (
      !permissions.includes(requiredPermission) &&
      !permissions.includes(handler.capabilityId)
    ) {
      throw new Error(
        `Plugin "${pluginId}" lacks permission to register capability "${handler.capabilityId}".`,
      );
    }

    if (capabilityHandlerRegistry.has(handler.capabilityId)) {
      throw new Error(
        `Capability "${handler.capabilityId}" is already registered.`,
      );
    }

    capabilityHandlerRegistry.register(handler);

    const list = this.registeredHandlers.get(pluginId) ?? [];
    list.push(handler.capabilityId);
    this.registeredHandlers.set(pluginId, list);

    console.info(
      `[PluginManager] Registered capability handler "${handler.capabilityId}" for plugin "${pluginId}".`,
    );
  }

  registerPreRequestObserver(
    pluginId: string,
    observer: PreRequestObserver,
  ): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin "${pluginId}" is not registered.`);
    }

    const permissions = plugin.metadata.permissions ?? [];
    if (!permissions.includes("middleware")) {
      throw new Error(
        `Plugin "${pluginId}" lacks "middleware" permission.`,
      );
    }

    pluginMiddleware.registerPreRequestObserver(pluginId, observer);
    console.info(
      `[PluginManager] Registered pre-request observer for plugin "${pluginId}".`,
    );
  }

  registerPostResponseObserver(
    pluginId: string,
    observer: PostResponseObserver,
  ): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin "${pluginId}" is not registered.`);
    }

    const permissions = plugin.metadata.permissions ?? [];
    if (!permissions.includes("middleware")) {
      throw new Error(
        `Plugin "${pluginId}" lacks "middleware" permission.`,
      );
    }

    pluginMiddleware.registerPostResponseObserver(pluginId, observer);
    console.info(
      `[PluginManager] Registered post-response observer for plugin "${pluginId}".`,
    );
  }

  async startPlugin(id: string): Promise<void> {
    const plugin = this.plugins.get(id);
    if (!plugin) {
      throw new Error(`Plugin "${id}" is not registered.`);
    }

    const start = Date.now();
    try {
      console.info(`[PluginManager] Starting plugin "${id}"...`);
      await plugin.start();
      pluginDiagnostics.trace({
        pluginId: id,
        action: "start",
        status: "success",
        durationMs: Date.now() - start,
      });
      eventBus.emit("plugin:started", { id });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      pluginDiagnostics.trace({
        pluginId: id,
        action: "start",
        status: "failure",
        error: errMsg,
        durationMs: Date.now() - start,
      });
      console.error(
        `[PluginManager] Startup failed for plugin "${id}", executing rollback:`,
        error,
      );
      this.cleanupPluginResources(id);
      eventBus.emit("plugin:error", { id, error });
      throw error;
    }
  }

  async stopPlugin(id: string): Promise<void> {
    const plugin = this.plugins.get(id);
    if (!plugin) {
      return;
    }

    const start = Date.now();
    try {
      console.info(`[PluginManager] Stopping plugin "${id}"...`);
      await plugin.stop();
      pluginDiagnostics.trace({
        pluginId: id,
        action: "stop",
        status: "success",
        durationMs: Date.now() - start,
      });
      eventBus.emit("plugin:stopped", { id });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      pluginDiagnostics.trace({
        pluginId: id,
        action: "stop",
        status: "failure",
        error: errMsg,
        durationMs: Date.now() - start,
      });
      console.error(
        `[PluginManager] Stop failed for plugin "${id}":`,
        error,
      );
    } finally {
      this.cleanupPluginResources(id);
    }
  }

  async startAll(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      try {
        await this.startPlugin(plugin.metadata.id);
      } catch (error) {
        console.error(
          `[PluginManager] Failed to start plugin "${plugin.metadata.id}":`,
          error,
        );
      }
    }
  }

  async stopAll(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      await this.stopPlugin(plugin.metadata.id);
    }
  }

  private cleanupPluginResources(pluginId: string): void {
    const handlers = this.registeredHandlers.get(pluginId);
    if (handlers) {
      for (const capId of handlers) {
        capabilityHandlerRegistry.unregister(capId);
        console.info(
          `[PluginManager] Unregistered capability "${capId}" for plugin "${pluginId}".`,
        );
      }
      this.registeredHandlers.delete(pluginId);
    }

    pluginMiddleware.unregisterObservers(pluginId);
    pluginDiagnostics.trace({ pluginId: pluginId, action: "rollback", status: "success" });
    console.info(
      `[PluginManager] Cleared middleware observers for plugin "${pluginId}".`,
    );
  }

  clear(): void {
    for (const id of this.plugins.keys()) {
      this.cleanupPluginResources(id);
    }
    this.plugins.clear();
    pluginMiddleware.clear();
  }
}

export const pluginManager = new PluginManager();
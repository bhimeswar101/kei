export interface PluginTraceEvent {
  pluginId: string;
  action:
    | "register"
    | "unregister"
    | "start"
    | "stop"
    | "rollback"
    | "middleware:pre"
    | "middleware:post";
  status: "success" | "failure";
  durationMs?: number;
  error?: string;
}

export class PluginDiagnostics {
  private readonly logs: PluginTraceEvent[] = [];

  trace(event: PluginTraceEvent): void {
    this.logs.push(event);
    const duration =
      event.durationMs !== undefined ? ` in ${event.durationMs}ms` : "";
    const errorMsg = event.error ? ` | Error: ${event.error}` : "";
    console.info(
      `[PluginDiagnostics] Plugin "${event.pluginId}" executed action "${event.action}" -> Status: ${event.status}${duration}${errorMsg}`,
    );
  }

  getLogs(): readonly PluginTraceEvent[] {
    return this.logs;
  }

  clear(): void {
    this.logs.length = 0;
  }
}

export const pluginDiagnostics = new PluginDiagnostics();

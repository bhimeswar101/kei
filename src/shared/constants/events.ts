export const EVENTS = {
  APP_READY: "app:ready",

  VOICE_START: "voice:start",
  VOICE_STOP: "voice:stop",

  MEMORY_UPDATED: "memory:updated",

  TOOL_EXECUTED: "tool:executed",

  AGENT_STARTED: "agent:started",
  AGENT_PROGRESS: "agent:progress",
  AGENT_COMPLETED: "agent:completed",
  AGENT_FAILED: "agent:failed",
  AGENT_CANCELLED: "agent:cancelled",
  AGENT_REPLANNED: "agent:replanned",
} as const;
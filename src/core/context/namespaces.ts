export const ContextNamespaces = {
  SYSTEM: "system",
  INTERACTION: "interaction",
  CONVERSATION: "conversation",
  EXECUTION: "execution",
  TOOL: "tool",
  APPLICATION: "application",
  BROWSER: "browser",
  VOICE: "voice",
  VISION: "vision",
  MEMORY: "memory",
} as const;

export type ContextNamespace =
  (typeof ContextNamespaces)[keyof typeof ContextNamespaces];

export function createContextKey(
  namespace: ContextNamespace,
  key: string,
): string {
  return `${namespace}.${key}`;
}
export const ErrorCodes = {
  UNKNOWN: "UNKNOWN",

  // Core infrastructure
  RUNTIME: "RUNTIME",
  KERNEL: "KERNEL",
  LIFECYCLE: "LIFECYCLE",

  // Configuration
  CONFIG: "CONFIG",

  // Validation
  VALIDATION: "VALIDATION",

  // AI
  AI: "AI",
  AI_PROVIDER: "AI_PROVIDER",

  // Network
  NETWORK: "NETWORK",

  // Permissions
  PERMISSION: "PERMISSION",

  // Storage / Memory
  STORAGE: "STORAGE",
  MEMORY: "MEMORY",

  // Services
  SERVICE: "SERVICE",

  // Voice
  VOICE: "VOICE",

  // Vision
  VISION: "VISION",

  // Browser
  BROWSER: "BROWSER",

  // Plugins
  PLUGIN: "PLUGIN",

  // Automation
  AUTOMATION: "AUTOMATION",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

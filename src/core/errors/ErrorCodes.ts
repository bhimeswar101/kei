export const ErrorCodes = {
  UNKNOWN: "UNKNOWN",

  // Configuration
  CONFIG: "CONFIG",

  // Validation
  VALIDATION: "VALIDATION",

  // Network
  NETWORK: "NETWORK",

  // Permissions
  PERMISSION: "PERMISSION",

  // Memory
  MEMORY: "MEMORY",

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

export type ErrorCode =
  (typeof ErrorCodes)[keyof typeof ErrorCodes];
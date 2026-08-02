import type {
  CapabilityDefinition,
} from "./types";

export const builtinCapabilities:
  readonly CapabilityDefinition[] = [
  {
    id: "application.open",
    name: "Open Application",
    description:
      "Open or launch an installed application.",
    category: "application",
    supportedIntents: ["action"],
    riskLevel: "low",
    requiresPermission: false,
  },

  {
    id: "application.close",
    name: "Close Application",
    description:
      "Close or quit a running application.",
    category: "application",
    supportedIntents: ["action"],
    riskLevel: "medium",
    requiresPermission: false,
  },

  {
    id: "browser.open",
    name: "Open Browser",
    description:
      "Open or launch a web browser.",
    category: "browser",
    supportedIntents: ["action"],
    riskLevel: "low",
    requiresPermission: false,
  },

  {
    id: "browser.search",
    name: "Browser Search",
    description:
      "Search the web using a browser.",
    category: "search",
    supportedIntents: ["action"],
    riskLevel: "low",
    requiresPermission: false,
  },

  {
    id: "media.play",
    name: "Play Media",
    description:
      "Play music, audio, video, or other media.",
    category: "media",
    supportedIntents: ["action"],
    riskLevel: "low",
    requiresPermission: false,
  },

  {
    id: "media.pause",
    name: "Pause Media",
    description:
      "Pause currently playing music, audio, video, or other media.",
    category: "media",
    supportedIntents: ["action"],
    riskLevel: "low",
    requiresPermission: false,
  },

  {
    id: "file.search",
    name: "Search Files",
    description:
      "Search for files available to the assistant.",
    category: "file-system",
    supportedIntents: ["action"],
    riskLevel: "low",
    requiresPermission: true,
  },

  {
    id: "file.read",
    name: "Read File",
    description:
      "Read the contents of an accessible file.",
    category: "file-system",
    supportedIntents: ["action"],
    riskLevel: "medium",
    requiresPermission: true,
  },

  {
    id: "automation.create",
    name: "Create Automation",
    description:
      "Create a reminder, scheduled task, or automation.",
    category: "automation",
    supportedIntents: ["automation"],
    riskLevel: "medium",
    requiresPermission: true,
  },
];

export const PERMISSIONS = {
  MICROPHONE: "microphone",
  CAMERA: "camera",
  NOTIFICATIONS: "notifications",
  FILE_SYSTEM: "filesystem",
} as const;
export type Permission =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
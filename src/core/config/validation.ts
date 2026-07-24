import { env } from "@/utils";

export function validateEnvironment() {
  if (!env.appName) {
    throw new Error("Missing VITE_APP_NAME");
  }

  if (!env.environment) {
    throw new Error("Missing VITE_APP_ENV");
  }
}
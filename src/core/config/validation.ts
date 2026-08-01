import { env } from "@/utils";

export function validateEnvironment(): void {
  if (!env.appName?.trim()) {
    throw new Error(
      "Invalid configuration: VITE_APP_NAME is required.",
    );
  }

  const validEnvironments = [
    "development",
    "production",
    "test",
  ] as const;

  if (
    !validEnvironments.includes(env.environment)
  ) {
    throw new Error(
      `Invalid configuration: unsupported environment "${env.environment}".`,
    );
  }
}
import { env } from "@/utils";

export const envConfig = {
  appName: env.appName,

  environment: env.environment,

  production: env.environment === "production",

  development: env.environment === "development",
} as const;
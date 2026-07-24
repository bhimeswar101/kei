import { appConfig } from "./app.config";
import { envConfig } from "./env.config";
import { featureConfig } from "./feature.config";

export const config = {
  app: appConfig,

  env: envConfig,

  features: featureConfig,
} as const;

export * from "./validation";
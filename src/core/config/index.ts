import { aiConfig } from "./ai.config";
import { appConfig } from "./app.config";
import { envConfig } from "./env.config";
import { featureConfig } from "./feature.config";
import { voiceConfig } from "./voice.config";

export const config = {
  app: appConfig,
  env: envConfig,
  ai: aiConfig,
  voice: voiceConfig,
  features: featureConfig,
} as const;

export * from "./validation";
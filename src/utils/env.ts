export type AppEnvironment =
  | "development"
  | "production"
  | "test";

function getEnvironment(): AppEnvironment {
  const value = import.meta.env.VITE_APP_ENV;

  if (
    value === "development" ||
    value === "production" ||
    value === "test"
  ) {
    return value;
  }

  return "development";
}

export const env = {
  appName: import.meta.env.VITE_APP_NAME as string | undefined,

  environment: getEnvironment(),
} as const;
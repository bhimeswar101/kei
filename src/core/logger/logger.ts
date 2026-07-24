export type LogLevel = "debug" | "info" | "warn" | "error";

export interface Logger {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

const timestamp = () => new Date().toISOString();

export const logger: Logger = {
  debug: (...args) =>
    console.debug(`[DEBUG] ${timestamp()}`, ...args),

  info: (...args) =>
    console.info(`[INFO ] ${timestamp()}`, ...args),

  warn: (...args) =>
    console.warn(`[WARN ] ${timestamp()}`, ...args),

  error: (...args) =>
    console.error(`[ERROR] ${timestamp()}`, ...args),
};
import { logger } from "@/core/logger";
import { AppError } from "./AppError";

export function handleError(error: unknown): never {
  if (error instanceof AppError) {
    logger.error(
      `[${error.code}]`,
      error.message,
      error.timestamp,
      error.cause,
    );

    throw error;
  }

  logger.error("Unexpected Error", error);

  throw error;
}
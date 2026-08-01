import { logger } from "@/core/logger";

import { AppError } from "./AppError";
import { ErrorCodes } from "./ErrorCodes";
import type { ErrorCode } from "./ErrorCodes";

interface HandleErrorOptions {
  code?: ErrorCode;
  recoverable?: boolean;
  context?: Record<string, unknown>;
}

export function normalizeError(
  error: unknown,
  options: HandleErrorOptions = {},
): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message, {
      code: options.code ?? ErrorCodes.UNKNOWN,
      cause: error,
      recoverable: options.recoverable,
      context: options.context,
    });
  }

  return new AppError("Unknown error occurred.", {
    code: options.code ?? ErrorCodes.UNKNOWN,
    cause: error,
    recoverable: options.recoverable,
    context: options.context,
  });
}

export function handleError(
  error: unknown,
  options: HandleErrorOptions = {},
): AppError {
  const appError = normalizeError(
    error,
    options,
  );

  logger.error(
    `[${appError.code}]`,
    appError.message,
    {
      timestamp: appError.timestamp,
      recoverable: appError.recoverable,
      context: appError.context,
      cause: appError.cause,
    },
  );

  return appError;
}
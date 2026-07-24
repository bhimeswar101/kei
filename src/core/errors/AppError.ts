import { ErrorCodes } from "./ErrorCodes";
import type { ErrorCode } from "./ErrorCodes";

export class AppError extends Error {
  readonly timestamp: Date;

  constructor(message: string, code: ErrorCode = ErrorCodes.UNKNOWN, cause?: unknown) {
    super(message);

    this.name = "AppError";
    this.timestamp = new Date();

    this.code = code;
    this.cause = cause;
  }

  readonly code: ErrorCode;
  readonly cause?: unknown;
}

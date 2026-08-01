import { ErrorCodes } from "./ErrorCodes";
import type { ErrorCode } from "./ErrorCodes";

export interface AppErrorOptions {
  code?: ErrorCode;
  cause?: unknown;
  recoverable?: boolean;
  context?: Record<string, unknown>;
}

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly timestamp: Date;
  readonly cause?: unknown;
  readonly recoverable: boolean;
  readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    options: AppErrorOptions = {},
  ) {
    super(message);

    this.name = "AppError";

    this.code = options.code ?? ErrorCodes.UNKNOWN;
    this.timestamp = new Date();
    this.cause = options.cause;
    this.recoverable = options.recoverable ?? false;
    this.context = options.context;

    Object.setPrototypeOf(
      this,
      AppError.prototype,
    );
  }
}
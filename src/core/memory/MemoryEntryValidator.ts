import type { MemoryValue, MemoryWriteInput } from "./types";

export interface MemoryEntryValidationResult {
  readonly valid: boolean;

  readonly error?: string;
}

export class MemoryEntryValidator {
  validate<T extends MemoryValue>(input: MemoryWriteInput<T>): MemoryEntryValidationResult {
    if (!input.key.trim()) {
      return {
        valid: false,
        error: "Memory key must not be empty.",
      };
    }

    if (
      input.importance !== undefined &&
      (!Number.isFinite(input.importance) || input.importance < 0 || input.importance > 1)
    ) {
      return {
        valid: false,
        error: "Memory importance must be a finite number between 0 and 1.",
      };
    }

    if (
      input.confidence !== undefined &&
      (!Number.isFinite(input.confidence) || input.confidence < 0 || input.confidence > 1)
    ) {
      return {
        valid: false,
        error: "Memory confidence must be a finite number between 0 and 1.",
      };
    }

    if (
      input.expiresAt !== undefined &&
      (!Number.isFinite(input.expiresAt) || input.expiresAt <= Date.now())
    ) {
      return {
        valid: false,
        error: "Memory expiration must be a valid future timestamp.",
      };
    }

    return {
      valid: true,
    };
  }
}

export const memoryEntryValidator = new MemoryEntryValidator();

import { sleep } from "./sleep";

export interface RetryOptions {
  retries?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: unknown) => boolean;
}

export async function retry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    retries = 3,
    delayMs = 500,
    backoffMultiplier = 2,
    shouldRetry = () => true,
  } = options;

  let lastError: unknown;
  let currentDelay = delayMs;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      const hasMoreAttempts =
        attempt < retries - 1;

      if (
        !hasMoreAttempts ||
        !shouldRetry(error)
      ) {
        throw error;
      }

      await sleep(currentDelay);

      currentDelay *= backoffMultiplier;
    }
  }

  throw lastError;
}
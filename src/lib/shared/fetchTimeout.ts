/**
 * Fetch with Timeout - AbortController-based request timeout handling
 *
 * Modern Node.js 24 best practice for external API calls with timeouts.
 * Uses native AbortController to prevent hanging requests.
 *
 * Features:
 * - Automatic timeout handling
 * - Request retry with exponential backoff
 * - Structured error handling
 * - Request/response logging
 *
 * @see https://nodejs.org/api/globals.html#abortsignal
 */

import { logger } from "./logger";

export class TimeoutError extends Error {
  constructor(url: string, timeout: number) {
    super(`Request to ${url} timed out after ${timeout}ms`);
    this.name = "TimeoutError";
  }
}

export class RetryError extends Error {
  constructor(url: string, attempts: number, lastError: Error) {
    super(`Request to ${url} failed after ${attempts} attempts: ${lastError.message}`);
    this.name = "RetryError";
    this.cause = lastError;
  }
}

export type FetchWithTimeoutOptions = {
  /** Timeout in milliseconds (default: 10000 = 10 seconds) */
  timeout?: number;

  /** Number of retry attempts (default: 0 = no retries) */
  retries?: number;

  /** Initial delay between retries in ms (default: 1000 = 1 second) */
  retryDelay?: number;

  /** Whether to use exponential backoff for retries (default: true) */
  exponentialBackoff?: number;

  /** HTTP method (default: GET) */
  method?: string;

  /** Request headers */
  headers?: Record<string, string>;

  /** Request body (will be JSON stringified if object) */
  body?: unknown;

  /** Whether to log requests/responses (default: true) */
  logging?: boolean;
};

/**
 * Makes an HTTP request with automatic timeout and retry handling
 *
 * @param url - URL to fetch
 * @param options - Fetch options with timeout and retry configuration
 * @returns Promise resolving to Response
 * @throws {TimeoutError} If request times out
 * @throws {RetryError} If all retry attempts fail
 *
 * @example
 * ```typescript
 * // Simple GET with 5 second timeout
 * const response = await fetchWithTimeout('https://api.example.com/data', {
 *   timeout: 5000
 * });
 * const data = await response.json();
 *
 * // POST with retries
 * const response = await fetchWithTimeout('https://api.example.com/create', {
 *   method: 'POST',
 *   timeout: 10000,
 *   retries: 3,
 *   body: { name: 'Test' },
 *   headers: { 'Authorization': 'Bearer token' }
 * });
 * ```
 */
export async function fetchWithTimeout(
  url: string,
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const {
    timeout = 10_000,
    retries = 0,
    retryDelay = 1000,
    exponentialBackoff = true,
    method = "GET",
    headers = {},
    body,
    logging = true,
  } = options;

  let lastError: Error | null = null;
  const maxAttempts = retries + 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Create AbortController for this attempt
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      if (logging) {
        await logger.debug(`HTTP ${method} ${url}`, {
          attempt,
          maxAttempts,
          timeout,
        });
      }

      const requestOptions: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        signal: controller.signal,
      };

      // Add body if provided
      if (body) {
        requestOptions.body = typeof body === "string" ? body : JSON.stringify(body);
      }

      const startTime = Date.now();
      const response = await fetch(url, requestOptions);
      const duration = Date.now() - startTime;

      clearTimeout(timeoutId);

      if (logging) {
        await logger.info(`HTTP ${method} ${url} completed`, {
          status: response.status,
          duration,
          attempt,
        });
      }

      // Return successful response
      if (response.ok) {
        return response;
      }

      // Non-2xx response - treat as error for retry logic
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle AbortController timeout
      if (error instanceof Error && error.name === "AbortError") {
        lastError = new TimeoutError(url, timeout);
      } else {
        lastError = error instanceof Error ? error : new Error(String(error));
      }

      // Log error
      if (logging) {
        await logger.warn(`HTTP ${method} ${url} failed`, {
          error: lastError.message,
          attempt,
          maxAttempts,
        });
      }

      // Don't retry on last attempt
      if (attempt === maxAttempts) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = exponentialBackoff ? retryDelay * 2 ** (attempt - 1) : retryDelay;

      if (logging) {
        await logger.debug(`Retrying ${url} after ${delay}ms`, {
          attempt: attempt + 1,
          maxAttempts,
        });
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // All attempts failed
  throw new RetryError(url, maxAttempts, lastError!);
}

/**
 * Typed wrapper for JSON responses
 *
 * @example
 * ```typescript
 * type User = { id: string; name: string };
 * const user = await fetchJSON<User>('https://api.example.com/user/123');
 * console.log(user.name);
 * ```
 */
export async function fetchJSON<T = unknown>(
  url: string,
  options: FetchWithTimeoutOptions = {}
): Promise<T> {
  const response = await fetchWithTimeout(url, options);
  return response.json() as Promise<T>;
}

/**
 * Helper to create AbortSignal with timeout
 * Use this if you need to pass signal to other APIs
 *
 * @example
 * ```typescript
 * const signal = createTimeoutSignal(5000);
 * const response = await someAPI.call({ signal });
 * ```
 */
export function createTimeoutSignal(timeoutMs: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

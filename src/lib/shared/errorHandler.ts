/**
 * Centralized Error Handler for API Routes
 *
 * Provides consistent error handling, logging, and response formatting
 * across all API endpoints.
 */

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  AppError,
  getStatusCode,
  isOperationalError,
  RateLimitError,
  ValidationError,
} from "./errors";
import { logger } from "./logger";

/**
 * Standard error response format
 */
type ErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    stack?: string; // Only included in development
  };
  timestamp: string;
  path?: string;
};

/**
 * Formats an error into a standardized API response
 */
export function formatErrorResponse(error: unknown, path?: string): ErrorResponse {
  const timestamp = new Date().toISOString();
  const isDevelopment = process.env.NODE_ENV === "development";

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request data",
        details: error.issues.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        })),
        ...(isDevelopment && { stack: error.stack }),
      },
      timestamp,
      ...(path && { path }),
    };
  }

  // Handle custom AppError instances
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        ...(isDevelopment && { stack: error.stack }),
      },
      timestamp,
      ...(path && { path }),
    };
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: isDevelopment ? error.message : "An unexpected error occurred",
        ...(isDevelopment && { stack: error.stack }),
      },
      timestamp,
      ...(path && { path }),
    };
  }

  // Handle unknown errors
  return {
    success: false,
    error: {
      code: "UNKNOWN_ERROR",
      message: "An unexpected error occurred",
      ...(isDevelopment && { details: error }),
    },
    timestamp,
    ...(path && { path }),
  };
}

/**
 * Logs error with appropriate level and context
 * IMPORTANT: This is async to ensure logs are sent before serverless function terminates
 */
export async function logError(error: unknown, context?: Record<string, unknown>): Promise<void> {
  const errorContext = {
    ...context,
    errorName: error instanceof Error ? error.name : "Unknown",
    errorMessage: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  };

  // Operational errors are logged as warnings (expected errors)
  if (isOperationalError(error)) {
    await logger.warn("Operational error occurred", errorContext);
  } else {
    // Programming errors are logged as errors (unexpected)
    await logger.error("Unexpected error occurred", errorContext);
  }
}

/**
 * Main error handler function
 * Logs the error and returns a formatted response
 * IMPORTANT: Async to ensure logs are flushed before serverless function terminates
 */
export async function handleApiError(
  error: unknown,
  request?: Request,
  context?: Record<string, unknown>
): Promise<NextResponse> {
  const path = request?.url;

  // Log the error with context (await to ensure log is sent)
  await logError(error, {
    ...context,
    path,
    method: request?.method,
    userAgent: request?.headers.get("user-agent"),
  });

  // Flush logs before returning (critical for serverless)
  await logger.flush();

  // Format and return error response
  const errorResponse = formatErrorResponse(error, path);
  const statusCode = getStatusCode(error);

  // Add retry-after header for rate limit errors
  const headers: Record<string, string> = {};
  if (error instanceof RateLimitError && error.retryAfter) {
    headers["Retry-After"] = String(error.retryAfter);
  }

  return NextResponse.json(errorResponse, {
    status: statusCode,
    headers,
  });
}

/**
 * Higher-order function that wraps API route handlers with error handling
 *
 * @example
 * ```typescript
 * async function handlePOST(request: Request) {
 *   // Your handler logic
 *   return NextResponse.json({ success: true });
 * }
 *
 * export const POST = withErrorHandling(handlePOST);
 * ```
 */
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse> | NextResponse,
  context?: Record<string, unknown>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      // Extract request if it's the first argument
      const request = args[0] instanceof Request ? args[0] : undefined;
      // Await to ensure logs are flushed before serverless function terminates
      return await handleApiError(error, request, context);
    }
  };
}

/**
 * Asserts a condition and throws an error if false
 * Useful for validation in route handlers
 *
 * @example
 * ```typescript
 * assertDefined(user, new AuthenticationError());
 * assert(amount > 0, new ValidationError("Amount must be positive"));
 * ```
 */
export function assert(condition: unknown, error: Error): asserts condition {
  if (!condition) {
    throw error;
  }
}

/**
 * Asserts that a value is defined (not null or undefined)
 */
export function assertDefined<T>(value: T | null | undefined, error: Error): asserts value is T {
  if (value === null || value === undefined) {
    throw error;
  }
}

/**
 * Safely parses JSON and throws ValidationError if invalid
 */
export async function parseJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ValidationError("Invalid JSON in request body");
  }
}

/**
 * Extracts and validates search params
 */
export function getSearchParams(request: Request): URLSearchParams {
  const url = new URL(request.url);
  return url.searchParams;
}

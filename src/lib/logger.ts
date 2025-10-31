/**
 * Better Stack (Logtail) Logger Utility
 *
 * Provides centralized logging for server-side and client-side code.
 * Uses Better Stack's Logtail service for error tracking and monitoring.
 *
 * Usage:
 * - Server: import { logger } from '@/lib/logger'
 * - API Routes: Use withLogging() wrapper
 * - Client: Use useLogger() hook from @logtail/next
 */

import { Logtail } from "@logtail/node";
import { LogLevel } from "@logtail/types";

// Initialize Logtail with source token from environment
// Only initialize if token is present (graceful degradation)
const logtailToken = process.env.LOGTAIL_SOURCE_TOKEN;

// Create Logtail instance (server-side only)
const logtail = logtailToken ? new Logtail(logtailToken) : null;

// Fallback logger for when Logtail is not configured
const consoleLogger = {
  debug: (message: string, context?: Record<string, unknown>) => {
    console.debug(`[DEBUG] ${message}`, context || "");
  },
  info: (message: string, context?: Record<string, unknown>) => {
    console.info(`[INFO] ${message}`, context || "");
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    console.warn(`[WARN] ${message}`, context || "");
  },
  error: (message: string, error?: Error | Record<string, unknown>) => {
    console.error(`[ERROR] ${message}`, error || "");
  },
};

/**
 * Server-side logger
 * Automatically sends logs to Better Stack when configured
 */
export const logger = {
  /**
   * Log debug information (development only)
   */
  debug: async (message: string, context?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === "development") {
      consoleLogger.debug(message, context);
    }
    if (logtail) {
      await logtail.debug(message, context);
    }
  },

  /**
   * Log informational messages
   */
  info: async (message: string, context?: Record<string, unknown>) => {
    consoleLogger.info(message, context);
    if (logtail) {
      await logtail.info(message, context);
    }
  },

  /**
   * Log warning messages
   */
  warn: async (message: string, context?: Record<string, unknown>) => {
    consoleLogger.warn(message, context);
    if (logtail) {
      await logtail.warn(message, context);
    }
  },

  /**
   * Log error messages
   */
  error: async (
    message: string,
    error?: Error | Record<string, unknown>,
    context?: Record<string, unknown>
  ) => {
    consoleLogger.error(message, error);

    if (logtail) {
      // If error is an Error object, extract stack trace
      if (error instanceof Error) {
        await logtail.error(message, {
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
          ...context,
        });
      } else {
        await logtail.error(message, { ...error, ...context });
      }
    }
  },

  /**
   * Flush logs to Better Stack
   * IMPORTANT: Call this before returning from API routes/server components
   */
  flush: async () => {
    if (logtail) {
      await logtail.flush();
    }
  },
};

/**
 * API Route logging wrapper
 * Automatically logs requests, responses, and errors
 *
 * Usage:
 * export const GET = withLogging(async (request) => {
 *   // Your handler code
 * });
 */
export function withLogging<T extends (...args: unknown[]) => Promise<Response>>(
  handler: T,
  routeName?: string
): T {
  return (async (...args: unknown[]) => {
    const startTime = Date.now();
    const request = args[0] as Request;
    const route = routeName || request.url;

    try {
      await logger.info(`API Request: ${request.method} ${route}`, {
        method: request.method,
        url: request.url,
        headers: Object.fromEntries(request.headers.entries()),
      });

      const response = await handler(...args);
      const duration = Date.now() - startTime;

      await logger.info(`API Response: ${request.method} ${route}`, {
        status: response.status,
        duration,
      });

      await logger.flush();
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      await logger.error(`API Error: ${request.method} ${route}`, error as Error, {
        method: request.method,
        url: request.url,
        duration,
      });

      await logger.flush();

      // Re-throw to maintain error handling flow
      throw error;
    }
  }) as T;
}

/**
 * Check if Better Stack is configured
 */
export const isLoggingEnabled = (): boolean => logtail !== null;

/**
 * Log level type for Better Stack
 */
export type { LogLevel };

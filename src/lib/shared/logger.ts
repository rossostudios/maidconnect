/**
 * Better Stack (Logtail) Logger Utility
 *
 * Provides centralized logging for server-side and client-side code.
 * Uses Better Stack's Logtail service for error tracking and monitoring.
 *
 * Features:
 * - Automatic request context tracking via AsyncLocalStorage
 * - PII sanitization for security
 * - Edge Runtime compatibility
 * - Structured logging with metadata
 *
 * Usage:
 * - Server: import { logger } from '@/lib/shared/logger'
 * - API Routes: Use withLogging() wrapper
 * - Client: Use useLogger() hook from @logtail/next
 *
 * Edge Runtime Compatible: Uses console logging in Edge, full Logtail in Node.js
 *
 * @see AsyncLocalStorage integration in async-context.ts
 */

import { Logtail } from "@logtail/node";
import type { LogLevel } from "@logtail/types";
import { getContextMetadata } from "./asyncContext";

// Initialize Logtail with source token from environment
// Only initialize if token is present and we're in Node.js runtime (not Edge)
const logtailToken = process.env.LOGTAIL_SOURCE_TOKEN;

// Check if we're in Edge Runtime (Edge doesn't support Node.js Logtail)
const isEdgeRuntime = typeof EdgeRuntime !== "undefined" || process.env.NEXT_RUNTIME === "edge";

// Create Logtail instance (server-side Node.js runtime only)
// Edge runtime will gracefully fallback to console logging
const logtail: Logtail | null = !isEdgeRuntime && logtailToken ? new Logtail(logtailToken) : null;

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
 * Automatically includes request context from AsyncLocalStorage when available
 */
export const logger = {
  /**
   * Log debug information (development only)
   * Automatically includes request context (requestId, userId, etc.) from AsyncLocalStorage
   */
  debug: async (message: string, context?: Record<string, unknown>) => {
    // Merge request context with provided context
    const enrichedContext = { ...getContextMetadata(), ...context };

    if (process.env.NODE_ENV === "development") {
      consoleLogger.debug(message, enrichedContext);
    }
    if (logtail) {
      await logtail.debug(message, enrichedContext);
    }
  },

  /**
   * Log informational messages
   * Automatically includes request context (requestId, userId, etc.) from AsyncLocalStorage
   */
  info: async (message: string, context?: Record<string, unknown>) => {
    // Merge request context with provided context
    const enrichedContext = { ...getContextMetadata(), ...context };

    consoleLogger.info(message, enrichedContext);
    if (logtail) {
      await logtail.info(message, enrichedContext);
    }
  },

  /**
   * Log warning messages
   * Automatically includes request context (requestId, userId, etc.) from AsyncLocalStorage
   */
  warn: async (message: string, context?: Record<string, unknown>) => {
    // Merge request context with provided context
    const enrichedContext = { ...getContextMetadata(), ...context };

    consoleLogger.warn(message, enrichedContext);
    if (logtail) {
      await logtail.warn(message, enrichedContext);
    }
  },

  /**
   * Log error messages
   * Automatically includes request context (requestId, userId, etc.) from AsyncLocalStorage
   */
  error: async (
    message: string,
    error?: Error | Record<string, unknown>,
    context?: Record<string, unknown>
  ) => {
    // Merge request context with provided context
    const enrichedContext = { ...getContextMetadata(), ...context };

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
          ...enrichedContext,
        });
      } else {
        await logtail.error(message, { ...error, ...enrichedContext });
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
 * Get runtime information for debugging
 */
export const getRuntimeInfo = () => ({
  isEdge: isEdgeRuntime,
  logtailEnabled: logtail !== null,
  nodeEnv: process.env.NODE_ENV,
  hasToken: Boolean(logtailToken),
});

// ============================================
// Context Builders for Structured Logging
// ============================================

/**
 * Creates user context for logging (with PII sanitization)
 */
export function withUserContext(userId: string, additionalInfo?: Record<string, unknown>) {
  return {
    user: {
      id: userId,
      ...additionalInfo,
    },
  };
}

/**
 * Creates request context for logging
 */
export function withRequestContext(request: Request) {
  const url = new URL(request.url);

  return {
    request: {
      method: request.method,
      path: url.pathname,
      query: sanitizePII(Object.fromEntries(url.searchParams.entries())),
      userAgent: request.headers.get("user-agent"),
      referer: request.headers.get("referer"),
      ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
    },
  };
}

/**
 * Creates error context for logging
 */
export function withErrorContext(error: unknown) {
  if (error instanceof Error) {
    return {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause,
      },
    };
  }

  return {
    error: {
      message: String(error),
      type: typeof error,
    },
  };
}

/**
 * Creates performance context for logging
 */
export function withPerformanceContext(startTime: number) {
  const duration = Date.now() - startTime;

  return {
    performance: {
      duration,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Creates database query context for logging
 */
export function withDatabaseContext(
  operation: string,
  table: string,
  additionalInfo?: Record<string, unknown>
) {
  return {
    database: {
      operation,
      table,
      ...additionalInfo,
    },
  };
}

// ============================================
// PII Sanitization
// ============================================

/**
 * Fields that should be sanitized in logs
 */
const PII_FIELDS = [
  "password",
  "token",
  "apiKey",
  "api_key",
  "secret",
  "authorization",
  "creditCard",
  "credit_card",
  "ssn",
  "email", // Partially sanitize emails
  "phone",
  "phoneNumber",
  "phone_number",
  "address",
  "streetAddress",
  "street_address",
];

/**
 * Sanitizes PII from log data
 */
export function sanitizePII(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === "string") {
    // Don't sanitize strings directly, only when they're values in objects
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizePII(item));
  }

  if (typeof data === "object") {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();

      // Check if this field should be sanitized
      if (PII_FIELDS.some((field) => lowerKey.includes(field.toLowerCase()))) {
        if (lowerKey.includes("email") && typeof value === "string") {
          // Partially sanitize emails: show first 2 chars + domain
          const [local, domain] = value.split("@");
          if (local && domain) {
            sanitized[key] = `${local.slice(0, 2)}***@${domain}`;
          } else {
            sanitized[key] = "[REDACTED]";
          }
        } else {
          sanitized[key] = "[REDACTED]";
        }
      } else if (typeof value === "object" && value !== null) {
        // Recursively sanitize nested objects
        sanitized[key] = sanitizePII(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  return data;
}

/**
 * Logs with full context (combines multiple context builders)
 */
export async function logWithContext(
  level: LogLevel,
  message: string,
  ...contexts: Record<string, unknown>[]
) {
  const combinedContext = sanitizePII(Object.assign({}, ...contexts)) as Record<string, unknown>;

  switch (level) {
    case "debug":
      await logger.debug(message, combinedContext);
      break;
    case "info":
      await logger.info(message, combinedContext);
      break;
    case "warn":
      await logger.warn(message, combinedContext);
      break;
    case "error":
      await logger.error(message, combinedContext);
      break;
  }
}

/**
 * Log level type for Better Stack
 */
export type { LogLevel };

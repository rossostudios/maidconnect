/**
 * API Performance Monitoring
 *
 * Tracks and logs API route performance metrics using AsyncLocalStorage context.
 * Automatically includes request context (requestId, userId, etc.) in all logs.
 *
 * Features:
 * - Automatic slow request detection
 * - Performance metrics aggregation
 * - Context-aware logging
 * - Database query tracking
 * - External API call tracking
 *
 * @see async-context.ts for request context tracking
 */

import { getContextMetadata, getRequestDuration } from "./asyncContext";
import { logger } from "./logger";

/**
 * Performance thresholds in milliseconds
 */
export const PERFORMANCE_THRESHOLDS = {
  /** Warning threshold - log slow requests */
  SLOW_REQUEST_MS: 1000, // 1 second

  /** Critical threshold - urgent attention needed */
  VERY_SLOW_REQUEST_MS: 5000, // 5 seconds

  /** Database query warning threshold */
  SLOW_DB_QUERY_MS: 500, // 500ms

  /** External API call warning threshold */
  SLOW_EXTERNAL_API_MS: 2000, // 2 seconds
} as const;

/**
 * Performance event types
 */
export type PerformanceEvent =
  | "request_completed"
  | "slow_request"
  | "very_slow_request"
  | "db_query"
  | "slow_db_query"
  | "external_api_call"
  | "slow_external_api";

/**
 * Performance metrics for a request
 */
export type PerformanceMetrics = {
  /** Total request duration in ms */
  duration: number;

  /** Request ID for correlation */
  requestId: string;

  /** User ID (if authenticated) */
  userId?: string;

  /** HTTP method */
  method?: string;

  /** Request path */
  path?: string;

  /** Event type */
  event: PerformanceEvent;

  /** Additional context */
  metadata?: Record<string, unknown>;
};

/**
 * Track and log API route performance
 * Call this at the end of your API route handler
 *
 * Automatically:
 * - Gets duration from AsyncLocalStorage context
 * - Includes request metadata (requestId, userId, etc.)
 * - Logs warnings for slow requests
 *
 * @param endpoint - Optional endpoint name for better logging
 * @param metadata - Additional context to include in logs
 *
 * @example
 * ```typescript
 * export const POST = withAuth(async ({ user, supabase }, request: Request) => {
 *   // Your handler code
 *   const result = await processData();
 *
 *   // Track performance before returning
 *   trackApiPerformance('POST /api/bookings', { recordsProcessed: result.count });
 *
 *   return ok(result);
 * });
 * ```
 */
export async function trackApiPerformance(
  endpoint?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const duration = getRequestDuration();
  const context = getContextMetadata();

  // Determine event type based on duration
  let event: PerformanceEvent = "request_completed";
  let logLevel: "info" | "warn" | "error" = "info";

  if (duration > PERFORMANCE_THRESHOLDS.VERY_SLOW_REQUEST_MS) {
    event = "very_slow_request";
    logLevel = "error";
  } else if (duration > PERFORMANCE_THRESHOLDS.SLOW_REQUEST_MS) {
    event = "slow_request";
    logLevel = "warn";
  }

  const metrics: PerformanceMetrics = {
    duration,
    requestId: context.requestId as string,
    userId: context.userId as string | undefined,
    method: context.method as string | undefined,
    path: context.path as string | undefined,
    event,
    metadata,
  };

  const message = endpoint
    ? `${endpoint} completed in ${duration}ms`
    : `API request completed in ${duration}ms`;

  // Log with appropriate level
  switch (logLevel) {
    case "error":
      await logger.error(message, metrics);
      break;
    case "warn":
      await logger.warn(message, metrics);
      break;
    default:
      await logger.info(message, metrics);
  }
}

/**
 * Track database query performance
 *
 * @param operation - Database operation (e.g., "SELECT", "INSERT", "UPDATE")
 * @param table - Database table name
 * @param durationMs - Query duration in milliseconds
 * @param metadata - Additional context (e.g., row count, filters)
 *
 * @example
 * ```typescript
 * const startTime = Date.now();
 * const { data } = await supabase.from('bookings').select('*').eq('user_id', userId);
 * await trackDatabaseQuery('SELECT', 'bookings', Date.now() - startTime, {
 *   rowCount: data?.length,
 *   userId
 * });
 * ```
 */
export async function trackDatabaseQuery(
  operation: string,
  table: string,
  durationMs: number,
  metadata?: Record<string, unknown>
): Promise<void> {
  const isSlow = durationMs > PERFORMANCE_THRESHOLDS.SLOW_DB_QUERY_MS;
  const event: PerformanceEvent = isSlow ? "slow_db_query" : "db_query";

  const metrics = {
    event,
    operation,
    table,
    duration: durationMs,
    ...metadata,
  };

  const message = `Database ${operation} on ${table} completed in ${durationMs}ms`;

  if (isSlow) {
    await logger.warn(message, metrics);
  } else {
    await logger.debug(message, metrics);
  }
}

/**
 * Track external API call performance
 *
 * @param service - External service name (e.g., "Stripe", "SendGrid")
 * @param operation - Operation name (e.g., "createPaymentIntent", "sendEmail")
 * @param durationMs - Call duration in milliseconds
 * @param metadata - Additional context (e.g., status code, response size)
 *
 * @example
 * ```typescript
 * const startTime = Date.now();
 * const paymentIntent = await stripe.paymentIntents.create({...});
 * await trackExternalApiCall('Stripe', 'createPaymentIntent', Date.now() - startTime, {
 *   paymentIntentId: paymentIntent.id,
 *   amount: paymentIntent.amount
 * });
 * ```
 */
export async function trackExternalApiCall(
  service: string,
  operation: string,
  durationMs: number,
  metadata?: Record<string, unknown>
): Promise<void> {
  const isSlow = durationMs > PERFORMANCE_THRESHOLDS.SLOW_EXTERNAL_API_MS;
  const event: PerformanceEvent = isSlow ? "slow_external_api" : "external_api_call";

  const metrics = {
    event,
    service,
    operation,
    duration: durationMs,
    ...metadata,
  };

  const message = `${service} ${operation} completed in ${durationMs}ms`;

  if (isSlow) {
    await logger.warn(message, metrics);
  } else {
    await logger.debug(message, metrics);
  }
}

/**
 * Performance measurement utility
 * Wraps a function and automatically tracks its execution time
 *
 * @param fn - Function to measure
 * @param name - Name for logging
 * @param tracker - Tracking function to use (trackDatabaseQuery, trackExternalApiCall, etc.)
 *
 * @example
 * ```typescript
 * const result = await measurePerformance(
 *   () => supabase.from('bookings').select('*'),
 *   'fetchBookings',
 *   (duration) => trackDatabaseQuery('SELECT', 'bookings', duration)
 * );
 * ```
 */
export async function measurePerformance<T>(
  fn: () => Promise<T>,
  name: string,
  tracker?: (duration: number) => Promise<void>
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await fn();
    const duration = Date.now() - startTime;

    if (tracker) {
      await tracker(duration);
    } else {
      await logger.debug(`${name} completed in ${duration}ms`);
    }

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    await logger.error(`${name} failed after ${duration}ms`, {
      error: error instanceof Error ? error.message : String(error),
      duration,
    });
    throw error;
  }
}

/**
 * Create a performance tracker for a specific operation
 * Returns start/stop functions for fine-grained tracking
 *
 * @param name - Operation name
 * @returns Object with start() and stop() methods
 *
 * @example
 * ```typescript
 * const tracker = createPerformanceTracker('processBooking');
 * tracker.start();
 *
 * // Your code here
 * await processBooking(data);
 *
 * await tracker.stop({ bookingId: booking.id });
 * ```
 */
export function createPerformanceTracker(name: string) {
  let startTime: number | null = null;

  return {
    start() {
      startTime = Date.now();
    },

    async stop(metadata?: Record<string, unknown>) {
      if (startTime === null) {
        await logger.warn(`Performance tracker '${name}' stopped without being started`);
        return;
      }

      const duration = Date.now() - startTime;
      await logger.debug(`${name} completed in ${duration}ms`, {
        duration,
        ...metadata,
      });

      startTime = null;
    },

    getDuration(): number {
      if (startTime === null) {
        return 0;
      }
      return Date.now() - startTime;
    },
  };
}

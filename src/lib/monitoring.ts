/**
 * Enhanced Monitoring & Structured Logging
 *
 * Provides comprehensive logging and performance monitoring for API routes,
 * database queries, and critical business operations.
 *
 * Features:
 * - Structured logging with context (user, request, timing)
 * - Performance tracking (API response times, DB query times)
 * - Error tracking with stack traces and context
 * - Business metrics (booking success rates, payment success rates)
 *
 * Usage:
 * import { withMonitoring, trackPerformance, logBusinessMetric } from '@/lib/monitoring';
 *
 * export const POST = withMonitoring(async (request) => {
 *   const perfTracker = trackPerformance('booking.create');
 *
 *   try {
 *     // Your logic here
 *     perfTracker.end({ success: true });
 *     return response;
 *   } catch (error) {
 *     perfTracker.end({ success: false, error });
 *     throw error;
 *   }
 * });
 */

import { logger } from '@/lib/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface LogContext {
  userId?: string;
  requestId?: string;
  method?: string;
  path?: string;
  ip?: string;
  userAgent?: string;
  [key: string]: unknown;
}

export interface PerformanceMetrics {
  operation: string;
  durationMs: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface BusinessMetric {
  metricName: string;
  value: number;
  unit?: string;
  tags?: Record<string, string>;
  timestamp?: string;
}

// ============================================================================
// PERFORMANCE TRACKING
// ============================================================================

export class PerformanceTracker {
  private startTime: number;
  private operation: string;
  private context: Record<string, unknown>;

  constructor(operation: string, context: Record<string, unknown> = {}) {
    this.startTime = Date.now();
    this.operation = operation;
    this.context = context;
  }

  /**
   * End performance tracking and log metrics
   */
  end(result: { success: boolean; error?: Error | string; metadata?: Record<string, unknown> } = { success: true }): number {
    const durationMs = Date.now() - this.startTime;

    const metrics: PerformanceMetrics = {
      operation: this.operation,
      durationMs,
      success: result.success,
      error: result.error instanceof Error ? result.error.message : result.error,
      metadata: {
        ...this.context,
        ...result.metadata,
      },
    };

    // Log performance metrics
    if (result.success) {
      logger.info(`[Performance] ${this.operation}`, {
        ...metrics,
        level: durationMs > 1000 ? 'slow' : durationMs > 500 ? 'moderate' : 'fast',
      });
    } else {
      logger.error(`[Performance] ${this.operation} failed`, {
        ...metrics,
        errorDetails: result.error instanceof Error ? result.error.stack : result.error,
      });
    }

    // Warn on slow operations
    if (durationMs > 1000) {
      logger.warn(`[Slow Operation] ${this.operation} took ${durationMs}ms`, metrics);
    }

    return durationMs;
  }

  /**
   * Add checkpoint to track sub-operation timing
   */
  checkpoint(checkpointName: string): void {
    const elapsed = Date.now() - this.startTime;
    logger.info(`[Checkpoint] ${this.operation}.${checkpointName}`, {
      operation: this.operation,
      checkpoint: checkpointName,
      elapsedMs: elapsed,
    });
  }
}

/**
 * Track performance of an operation
 */
export function trackPerformance(operation: string, context: Record<string, unknown> = {}): PerformanceTracker {
  return new PerformanceTracker(operation, context);
}

// ============================================================================
// STRUCTURED LOGGING HELPERS
// ============================================================================

/**
 * Extract request context for logging
 */
export function getRequestContext(request: Request): LogContext {
  return {
    method: request.method,
    path: new URL(request.url).pathname,
    ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        request.headers.get('cf-connecting-ip') ||
        'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    // @ts-ignore - Set by auth middleware
    userId: request.userId,
    // @ts-ignore - Set by proxy/middleware
    requestId: request.requestId || crypto.randomUUID(),
  };
}

/**
 * Log API request with structured data
 */
export function logApiRequest(params: {
  method: string;
  path: string;
  userId?: string;
  statusCode: number;
  durationMs: number;
  error?: string;
  metadata?: Record<string, unknown>;
}): void {
  const { method, path, userId, statusCode, durationMs, error, metadata } = params;

  const logData = {
    type: 'api_request',
    method,
    path,
    userId,
    statusCode,
    durationMs,
    error,
    ...metadata,
    timestamp: new Date().toISOString(),
  };

  if (statusCode >= 500) {
    logger.error(`[API Error] ${method} ${path}`, logData);
  } else if (statusCode >= 400) {
    logger.warn(`[API Client Error] ${method} ${path}`, logData);
  } else {
    logger.info(`[API Success] ${method} ${path}`, logData);
  }
}

/**
 * Log database query with timing
 */
export function logDatabaseQuery(params: {
  table: string;
  operation: 'select' | 'insert' | 'update' | 'delete' | 'rpc';
  durationMs: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, unknown>;
}): void {
  const { table, operation, durationMs, success, error, metadata } = params;

  const logData = {
    type: 'database_query',
    table,
    operation,
    durationMs,
    success,
    error,
    ...metadata,
    timestamp: new Date().toISOString(),
  };

  if (!success) {
    logger.error(`[DB Error] ${operation} on ${table}`, logData);
  } else if (durationMs > 100) {
    logger.warn(`[Slow DB Query] ${operation} on ${table} took ${durationMs}ms`, logData);
  } else {
    logger.info(`[DB Query] ${operation} on ${table}`, logData);
  }
}

/**
 * Log business metric
 */
export function logBusinessMetric(metric: BusinessMetric): void {
  logger.info(`[Metric] ${metric.metricName}`, {
    type: 'business_metric',
    metricName: metric.metricName,
    value: metric.value,
    unit: metric.unit || 'count',
    tags: metric.tags || {},
    timestamp: metric.timestamp || new Date().toISOString(),
  });
}

// ============================================================================
// MONITORING MIDDLEWARE
// ============================================================================

/**
 * Wrap an API route handler with monitoring
 *
 * Usage:
 * export const POST = withMonitoring(async (request) => {
 *   // Your handler
 * });
 */
export function withMonitoring<T extends (request: Request, ...args: unknown[]) => Promise<Response>>(
  handler: T,
  options: {
    operationName?: string;
    trackPerformance?: boolean;
    logRequests?: boolean;
  } = {}
): T {
  const { operationName, trackPerformance: shouldTrackPerf = true, logRequests = true } = options;

  return (async (request: Request, ...args: unknown[]) => {
    const startTime = Date.now();
    const context = getRequestContext(request);
    const operation = operationName || `${context.method} ${context.path}`;

    // Create performance tracker
    const perfTracker = shouldTrackPerf ? trackPerformance(operation, context) : null;

    try {
      // Call handler
      const response = await handler(request, ...args);
      const durationMs = Date.now() - startTime;

      // Log successful request
      if (logRequests) {
        logApiRequest({
          method: context.method!,
          path: context.path!,
          userId: context.userId as string | undefined,
          statusCode: response.status,
          durationMs,
          metadata: {
            requestId: context.requestId,
          },
        });
      }

      // End performance tracking
      if (perfTracker) {
        perfTracker.end({
          success: response.status < 400,
          metadata: { statusCode: response.status },
        });
      }

      return response;
    } catch (error) {
      const durationMs = Date.now() - startTime;

      // Log error request
      if (logRequests) {
        logApiRequest({
          method: context.method!,
          path: context.path!,
          userId: context.userId as string | undefined,
          statusCode: 500,
          durationMs,
          error: error instanceof Error ? error.message : String(error),
          metadata: {
            requestId: context.requestId,
            errorStack: error instanceof Error ? error.stack : undefined,
          },
        });
      }

      // End performance tracking with error
      if (perfTracker) {
        perfTracker.end({
          success: false,
          error: error instanceof Error ? error : String(error),
        });
      }

      throw error;
    }
  }) as T;
}

// ============================================================================
// DATABASE QUERY WRAPPER
// ============================================================================

/**
 * Wrap Supabase query with performance logging
 *
 * Usage:
 * const { data, error } = await monitorQuery(
 *   'bookings',
 *   'select',
 *   supabase.from('bookings').select('*')
 * );
 */
export async function monitorQuery<T>(
  table: string,
  operation: 'select' | 'insert' | 'update' | 'delete' | 'rpc',
  query: Promise<T>
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await query;
    const durationMs = Date.now() - startTime;

    logDatabaseQuery({
      table,
      operation,
      durationMs,
      success: true,
    });

    return result;
  } catch (error) {
    const durationMs = Date.now() - startTime;

    logDatabaseQuery({
      table,
      operation,
      durationMs,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
}

// ============================================================================
// BUSINESS METRICS TRACKING
// ============================================================================

/**
 * Track booking success rate
 */
export function trackBookingCreated(success: boolean, metadata?: Record<string, string>): void {
  logBusinessMetric({
    metricName: 'booking.created',
    value: success ? 1 : 0,
    unit: 'success',
    tags: {
      success: String(success),
      ...metadata,
    },
  });
}

/**
 * Track payment success rate
 */
export function trackPaymentProcessed(success: boolean, amountCents: number, metadata?: Record<string, string>): void {
  logBusinessMetric({
    metricName: 'payment.processed',
    value: amountCents,
    unit: 'cents',
    tags: {
      success: String(success),
      ...metadata,
    },
  });
}

/**
 * Track message sent
 */
export function trackMessageSent(conversationId: string): void {
  logBusinessMetric({
    metricName: 'message.sent',
    value: 1,
    unit: 'count',
    tags: {
      conversationId,
    },
  });
}

/**
 * Track dispute filed
 */
export function trackDisputeFiled(bookingId: string, disputeType: string): void {
  logBusinessMetric({
    metricName: 'dispute.filed',
    value: 1,
    unit: 'count',
    tags: {
      bookingId,
      disputeType,
    },
  });
}

/**
 * Track professional onboarding completed
 */
export function trackProfessionalOnboarded(professionalId: string, durationDays: number): void {
  logBusinessMetric({
    metricName: 'professional.onboarded',
    value: 1,
    unit: 'count',
    tags: {
      professionalId,
      durationDays: String(durationDays),
    },
  });
}

// ============================================================================
// ERROR TRACKING HELPERS
// ============================================================================

/**
 * Log error with full context
 */
export function logError(error: Error, context: Record<string, unknown> = {}): void {
  logger.error('Application Error', {
    type: 'error',
    message: error.message,
    name: error.name,
    stack: error.stack,
    ...context,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log warning
 */
export function logWarning(message: string, context: Record<string, unknown> = {}): void {
  logger.warn(message, {
    type: 'warning',
    ...context,
    timestamp: new Date().toISOString(),
  });
}

// ============================================================================
// HEALTH CHECK METRICS
// ============================================================================

/**
 * Log health check status
 */
export function logHealthCheck(checks: {
  database: boolean;
  redis?: boolean;
  stripe?: boolean;
  [key: string]: boolean | undefined;
}): void {
  const healthy = Object.values(checks).every((status) => status === true);

  logger.info('[Health Check]', {
    type: 'health_check',
    healthy,
    checks,
    timestamp: new Date().toISOString(),
  });
}

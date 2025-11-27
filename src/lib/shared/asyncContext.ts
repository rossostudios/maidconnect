/**
 * Async Context - Request-scoped context tracking using AsyncLocalStorage
 *
 * Enables tracking of request metadata (requestId, userId, locale, etc.)
 * across all async operations without prop-drilling. Critical for:
 * - Distributed tracing
 * - Structured logging
 * - Performance monitoring
 * - Request correlation
 *
 * @see https://nodejs.org/api/async_context.html
 *
 * @example
 * ```typescript
 * // In middleware
 * await runWithContext({ requestId: '123', userId: 'user_1' }, async () => {
 *   await handler(request);
 * });
 *
 * // Anywhere in the async call stack
 * const context = getRequestContext();
 * logger.info('Processing', { requestId: context?.requestId });
 * ```
 */

import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Request context data available throughout the async call stack
 */
export type RequestContext = {
  /** Unique identifier for this request (for tracing/correlation) */
  requestId: string;

  /** Authenticated user ID (if available) */
  userId?: string;

  /** User role (admin, professional, customer) */
  userRole?: string;

  /** User email (for logging/debugging) */
  userEmail?: string;

  /** Request locale/language (en, es) */
  locale: string;

  /** Request start time (for performance tracking) */
  startTime: number;

  /** Request method (GET, POST, etc.) */
  method?: string;

  /** Request path */
  path?: string;

  /** Client IP address */
  clientIp?: string;

  /** User agent string */
  userAgent?: string;
};

/**
 * AsyncLocalStorage instance for request context
 * This is a singleton that persists across the entire async call chain
 */
const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

/**
 * Initialize and run code with request context
 *
 * @param context - Request context to make available
 * @param callback - Async function to run with context
 * @returns Promise resolving to callback result
 *
 * @example
 * ```typescript
 * const result = await runWithContext(
 *   { requestId: '123', userId: 'user_1', locale: 'en', startTime: Date.now() },
 *   async () => {
 *     // All code here has access to context
 *     return await processRequest();
 *   }
 * );
 * ```
 */
export async function runWithContext<T>(
  context: RequestContext,
  callback: () => Promise<T>
): Promise<T> {
  return asyncLocalStorage.run(context, callback);
}

/**
 * Get current request context (if available)
 *
 * @returns Current request context or undefined if not in a context
 *
 * @example
 * ```typescript
 * const context = getRequestContext();
 * if (context) {
 *   console.log('Request ID:', context.requestId);
 *   console.log('User ID:', context.userId);
 *   console.log('Duration:', Date.now() - context.startTime);
 * }
 * ```
 */
export function getRequestContext(): RequestContext | undefined {
  return asyncLocalStorage.getStore();
}

/**
 * Get request ID from current context
 * Convenience method for the most commonly accessed field
 *
 * @returns Request ID or 'unknown' if not in context
 *
 * @example
 * ```typescript
 * logger.info('Processing payment', { requestId: getRequestId() });
 * ```
 */
function getRequestId(): string {
  return getRequestContext()?.requestId || "unknown";
}

/**
 * Get user ID from current context
 * Convenience method for authentication-related operations
 *
 * @returns User ID or undefined if not authenticated
 *
 * @example
 * ```typescript
 * const userId = getUserId();
 * if (userId) {
 *   await logUserAction(userId, 'completed_booking');
 * }
 * ```
 */
function getUserId(): string | undefined {
  return getRequestContext()?.userId;
}

/**
 * Get request duration in milliseconds
 * Useful for performance monitoring
 *
 * @returns Duration in ms or 0 if not in context
 *
 * @example
 * ```typescript
 * const duration = getRequestDuration();
 * if (duration > 1000) {
 *   logger.warn('Slow request detected', { duration });
 * }
 * ```
 */
function getRequestDuration(): number {
  const context = getRequestContext();
  if (!context) {
    return 0;
  }
  return Date.now() - context.startTime;
}

/**
 * Update context with additional data
 * Useful for adding userId after authentication
 *
 * @param updates - Partial context to merge with existing
 *
 * @example
 * ```typescript
 * // After authentication
 * updateContext({ userId: user.id, userEmail: user.email, userRole: user.role });
 * ```
 */
export function updateContext(updates: Partial<RequestContext>): void {
  const current = getRequestContext();
  if (current) {
    Object.assign(current, updates);
  }
}

/**
 * Create a context object from a Request
 * Extracts common metadata from Next.js Request object
 *
 * @param request - Next.js Request object
 * @returns RequestContext ready to use with runWithContext
 *
 * @example
 * ```typescript
 * const context = createContextFromRequest(request);
 * await runWithContext(context, async () => {
 *   return await handler(request);
 * });
 * ```
 */
export function createContextFromRequest(request: Request): RequestContext {
  const url = new URL(request.url);

  // Extract client IP from headers (respecting proxies)
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  return {
    requestId: crypto.randomUUID(),
    locale: request.headers.get("accept-language")?.split(",")[0] || "en",
    startTime: Date.now(),
    method: request.method,
    path: url.pathname,
    clientIp,
    userAgent: request.headers.get("user-agent") || undefined,
  };
}

/**
 * Helper to get context metadata for logging
 * Returns common fields formatted for structured logging
 *
 * @returns Object with common context fields for logging
 *
 * @example
 * ```typescript
 * logger.info('Payment processed', {
 *   ...getContextMetadata(),
 *   amount: 100,
 *   currency: 'USD',
 * });
 * ```
 */
export function getContextMetadata(): Record<string, unknown> {
  const context = getRequestContext();
  if (!context) {
    return {};
  }

  return {
    requestId: context.requestId,
    userId: context.userId,
    userRole: context.userRole,
    userEmail: context.userEmail,
    locale: context.locale,
    method: context.method,
    path: context.path,
    duration: Date.now() - context.startTime,
    clientIp: context.clientIp,
  };
}

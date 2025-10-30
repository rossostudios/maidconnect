/**
 * Rate Limiting Utility
 *
 * Prevents brute force attacks and API abuse by limiting the number of requests
 * from a single IP address or user within a time window.
 *
 * For production with multiple servers, consider using Redis (Upstash) instead
 * of in-memory storage.
 */

type RateLimitStore = Map<string, { count: number; resetTime: number }>;

// In-memory store for rate limiting
// Note: This resets on server restart. For production with multiple instances,
// use Redis (e.g., Upstash) for distributed rate limiting
const store: RateLimitStore = new Map();

// Clean up expired entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, value] of store.entries()) {
      if (now > value.resetTime) {
        store.delete(key);
      }
    }
  },
  5 * 60 * 1000
);

export type RateLimitConfig = {
  /**
   * Maximum number of requests allowed within the time window
   */
  maxRequests: number;

  /**
   * Time window in milliseconds
   */
  windowMs: number;

  /**
   * Optional: Custom error message
   */
  message?: string;
};

export type RateLimitResult = {
  /**
   * Whether the request is allowed
   */
  allowed: boolean;

  /**
   * Number of requests remaining in the current window
   */
  remaining: number;

  /**
   * Timestamp when the rate limit resets (Unix timestamp in ms)
   */
  resetTime: number;

  /**
   * Error message if rate limit is exceeded
   */
  message?: string;
};

/**
 * Check if a request should be rate limited
 *
 * @param identifier - Unique identifier for the requester (IP address, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(identifier: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const key = identifier;
  const entry = store.get(key);

  // No previous requests from this identifier
  if (!entry) {
    store.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    };
  }

  // Rate limit window has expired, reset
  if (now > entry.resetTime) {
    store.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    };
  }

  // Still within the rate limit window
  if (entry.count < config.maxRequests) {
    entry.count++;
    store.set(key, entry);

    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  // Rate limit exceeded
  return {
    allowed: false,
    remaining: 0,
    resetTime: entry.resetTime,
    message:
      config.message ||
      `Rate limit exceeded. Try again in ${Math.ceil((entry.resetTime - now) / 1000)} seconds.`,
  };
}

/**
 * Get the client's IP address from the request
 *
 * @param request - Next.js Request object
 * @returns IP address or fallback identifier
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from headers (works with proxies/load balancers)
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback to connection remote address (not available in Edge Runtime)
  return "unknown";
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const RateLimiters = {
  /**
   * Strict rate limit for authentication endpoints (login, signup)
   * 5 requests per 15 minutes
   */
  auth: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: "Too many authentication attempts. Please try again in 15 minutes.",
  },

  /**
   * Moderate rate limit for password reset
   * 3 requests per hour
   */
  passwordReset: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "Too many password reset attempts. Please try again in 1 hour.",
  },

  /**
   * Lenient rate limit for API endpoints
   * 100 requests per minute
   */
  api: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    message: "API rate limit exceeded. Please slow down your requests.",
  },

  /**
   * Very strict rate limit for sensitive operations (account deletion, data export)
   * 2 requests per hour
   */
  sensitive: {
    maxRequests: 2,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "Too many requests for this sensitive operation. Please try again in 1 hour.",
  },
} as const;

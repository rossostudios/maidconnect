/**
 * Rate Limiting Utility
 *
 * Provides production-ready rate limiting with automatic failover:
 * - Production: Uses Upstash Redis (distributed, scales across Edge functions)
 * - Development: Uses in-memory store (no setup required)
 *
 * Setup:
 * 1. Development: Works out of the box with in-memory store
 * 2. Production: Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env
 *
 * Usage:
 * import { rateLimit, createRateLimitResponse } from '@/lib/rate-limit'
 *
 * export async function GET(request: Request) {
 *   const result = await rateLimit(request, 'api')
 *   if (!result.success) {
 *     return createRateLimitResponse(result)
 *   }
 *   // Your handler code
 * }
 *
 * Rate Limit Rejection Logging:
 * When rate limits are exceeded, comprehensive logs are emitted with:
 * - [RATE_LIMIT_REJECTED] tag for easy filtering
 * - Client IP, path, method, and user agent
 * - Rate limit type and tier configuration
 * - Current limits (remaining, reset time, retry after)
 *
 * Example log:
 * [RATE_LIMIT_REJECTED] {
 *   timestamp: "2025-01-14T12:00:00.000Z",
 *   ip: "192.168.1.1",
 *   path: "/api/admin/users",
 *   method: "POST",
 *   rateLimitType: "admin",
 *   tier: { maxRequests: 10, windowMs: 60000, windowMinutes: 1 },
 *   current: { remaining: 0, limit: 10, reset: "...", retryAfter: 45 },
 *   userAgent: "Mozilla/5.0..."
 * }
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

type RateLimitStore = Map<string, { count: number; resetTime: number }>;

// In-memory store for rate limiting (development only)
const store: RateLimitStore = new Map();

// Clean up expired entries every 5 minutes (in-memory only)
if (typeof setInterval !== "undefined") {
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
}

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
  success: boolean;

  /**
   * Number of requests remaining in the current window
   */
  remaining: number;

  /**
   * Maximum requests allowed
   */
  limit: number;

  /**
   * Timestamp when the rate limit resets (Unix timestamp in ms)
   */
  reset: number;

  /**
   * Seconds until rate limit resets
   */
  retryAfter?: number;
};

export type SimpleRateLimitResult = {
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
   * Optional error message
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
export function checkRateLimit(identifier: string, config: RateLimitConfig): SimpleRateLimitResult {
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
    // split always returns at least one element
    return forwardedFor.split(",")[0]!.trim();
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

  /**
   * Moderate rate limit for booking creation
   * 20 requests per minute
   */
  booking: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
    message: "Too many booking requests. Please try again shortly.",
  },

  /**
   * Moderate rate limit for messaging
   * 30 messages per minute
   */
  messaging: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
    message: "Too many messages. Please slow down.",
  },

  /**
   * Strict rate limit for feedback submissions
   * 5 requests per hour
   */
  feedback: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "Too many feedback submissions. Please try again in 1 hour.",
  },

  /**
   * Strict rate limit for admin operations (user management, moderation)
   * 10 requests per minute
   */
  admin: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    message: "Too many admin requests. Please slow down.",
  },

  /**
   * Moderate rate limit for payment operations (payment intents)
   * 15 requests per minute
   */
  payment: {
    maxRequests: 15,
    windowMs: 60 * 1000, // 1 minute
    message: "Too many payment requests. Please try again shortly.",
  },

  /**
   * Very strict rate limit for financial operations (payout processing)
   * 1 request per minute
   */
  financial: {
    maxRequests: 1,
    windowMs: 60 * 1000, // 1 minute
    message: "Financial operations are rate limited to 1 request per minute.",
  },

  /**
   * Strict rate limit for dispute creation
   * 3 requests per hour
   */
  dispute: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "Too many dispute requests. Please try again in 1 hour.",
  },

  /**
   * Moderate rate limit for file uploads
   * 5 requests per minute
   */
  upload: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
    message: "Too many upload requests. Please try again shortly.",
  },

  /**
   * Very strict rate limit for cron jobs (prevents concurrent execution)
   * 1 request per 5 minutes
   */
  cron: {
    maxRequests: 1,
    windowMs: 5 * 60 * 1000, // 5 minutes
    message: "Cron job rate limit exceeded. Operations must be at least 5 minutes apart.",
  },
} as const;

// ============================================
// Upstash Redis Rate Limiting (Production)
// ============================================

/**
 * Initialize Upstash rate limiters (used in production)
 * Falls back to in-memory if Upstash is not configured
 */
let upstashLimiters: {
  auth: Ratelimit | null;
  api: Ratelimit | null;
  booking: Ratelimit | null;
  messaging: Ratelimit | null;
  feedback: Ratelimit | null;
  sensitive: Ratelimit | null;
  admin: Ratelimit | null;
  payment: Ratelimit | null;
  financial: Ratelimit | null;
  dispute: Ratelimit | null;
  upload: Ratelimit | null;
  cron: Ratelimit | null;
} = {
  auth: null,
  api: null,
  booking: null,
  messaging: null,
  feedback: null,
  sensitive: null,
  admin: null,
  payment: null,
  financial: null,
  dispute: null,
  upload: null,
  cron: null,
};

// Only initialize Upstash in production or if explicitly configured
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    upstashLimiters = {
      // Auth: 10 requests per minute (stricter than in-memory)
      auth: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "1 m"),
        analytics: true,
        prefix: "casaora:ratelimit:auth",
      }),

      // API: 100 requests per minute
      api: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, "1 m"),
        analytics: true,
        prefix: "casaora:ratelimit:api",
      }),

      // Booking: 20 requests per minute
      booking: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, "1 m"),
        analytics: true,
        prefix: "casaora:ratelimit:booking",
      }),

      // Messaging: 30 requests per minute
      messaging: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(30, "1 m"),
        analytics: true,
        prefix: "casaora:ratelimit:messaging",
      }),

      // Feedback: 5 requests per hour
      feedback: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "1 h"),
        analytics: true,
        prefix: "casaora:ratelimit:feedback",
      }),

      // Sensitive: 2 requests per hour (account deletion, data export)
      sensitive: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(2, "1 h"),
        analytics: true,
        prefix: "casaora:ratelimit:sensitive",
      }),

      // Admin: 10 requests per minute (admin operations)
      admin: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "1 m"),
        analytics: true,
        prefix: "casaora:ratelimit:admin",
      }),

      // Payment: 15 requests per minute (payment intents)
      payment: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(15, "1 m"),
        analytics: true,
        prefix: "casaora:ratelimit:payment",
      }),

      // Financial: 1 request per minute (payout processing)
      financial: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(1, "1 m"),
        analytics: true,
        prefix: "casaora:ratelimit:financial",
      }),

      // Dispute: 3 requests per hour (dispute creation)
      dispute: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, "1 h"),
        analytics: true,
        prefix: "casaora:ratelimit:dispute",
      }),

      // Upload: 5 requests per minute (file uploads)
      upload: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "1 m"),
        analytics: true,
        prefix: "casaora:ratelimit:upload",
      }),

      // Cron: 1 request per 5 minutes (prevents concurrent execution)
      cron: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(1, "5 m"),
        analytics: true,
        prefix: "casaora:ratelimit:cron",
      }),
    };

    console.log("✓ Upstash Redis rate limiting initialized");
  } catch (error) {
    console.error("Failed to initialize Upstash Redis:", error);
    console.log("Falling back to in-memory rate limiting");
  }
}

/**
 * Apply rate limit using Upstash (production) or in-memory (development)
 */
export async function rateLimit(
  request: Request,
  type:
    | "auth"
    | "api"
    | "booking"
    | "messaging"
    | "feedback"
    | "sensitive"
    | "admin"
    | "payment"
    | "financial"
    | "dispute"
    | "upload"
    | "cron" = "api"
): Promise<RateLimitResult> {
  const identifier = getClientIdentifier(request);
  const limiter = upstashLimiters[type];

  // Use Upstash if available
  if (limiter) {
    try {
      const result = await limiter.limit(identifier);

      return {
        success: result.success,
        remaining: result.remaining,
        limit: result.limit,
        reset: result.reset,
        retryAfter: result.success ? undefined : Math.ceil((result.reset - Date.now()) / 1000),
      };
    } catch (error) {
      console.error("Upstash rate limit error:", error);
      // Fall through to in-memory on error
    }
  }

  // Fallback to in-memory rate limiting
  const config = RateLimiters[type];
  const result = checkRateLimit(identifier, config);

  return {
    success: result.allowed,
    remaining: result.remaining,
    limit: config.maxRequests,
    reset: result.resetTime,
    retryAfter: result.allowed ? undefined : Math.ceil((result.resetTime - Date.now()) / 1000),
  };
}

/**
 * Create a rate limit response (429 Too Many Requests)
 */
export function createRateLimitResponse(result: RateLimitResult): NextResponse {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": new Date(result.reset).toISOString(),
  };

  if (result.retryAfter) {
    headers["Retry-After"] = result.retryAfter.toString();
  }

  return NextResponse.json(
    {
      error: "Too many requests",
      message: `Rate limit exceeded. Please try again in ${result.retryAfter} seconds.`,
      retryAfter: result.retryAfter,
    },
    {
      status: 429,
      headers,
    }
  );
}

/**
 * Middleware wrapper for rate limiting
 * Automatically applies rate limit and returns 429 if exceeded
 *
 * Usage:
 * export const GET = withRateLimit(async (request) => {
 *   // Your handler code
 * }, 'api')
 */
export function withRateLimit<
  T extends (request: Request, ...args: unknown[]) => Promise<Response>,
>(
  handler: T,
  type:
    | "auth"
    | "api"
    | "booking"
    | "messaging"
    | "feedback"
    | "sensitive"
    | "admin"
    | "payment"
    | "financial"
    | "dispute"
    | "upload"
    | "cron" = "api"
): T {
  return (async (request: Request, ...args: unknown[]) => {
    const result = await rateLimit(request, type);

    if (!result.success) {
      // Log rate limit rejection with comprehensive details
      const identifier = getClientIdentifier(request);
      const url = new URL(request.url);
      const config = RateLimiters[type];

      console.warn("[RATE_LIMIT_REJECTED]", {
        timestamp: new Date().toISOString(),
        ip: identifier,
        path: url.pathname,
        method: request.method,
        rateLimitType: type,
        tier: {
          maxRequests: config.maxRequests,
          windowMs: config.windowMs,
          windowMinutes: Math.round(config.windowMs / 60_000),
        },
        current: {
          remaining: result.remaining,
          limit: result.limit,
          reset: new Date(result.reset).toISOString(),
          retryAfter: result.retryAfter,
        },
        userAgent: request.headers.get("user-agent") || "unknown",
      });

      return createRateLimitResponse(result);
    }

    return handler(request, ...args);
  }) as T;
}

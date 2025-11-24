/**
 * Cache Configuration Constants
 *
 * Centralized cache settings for the application.
 * Adjust these values based on data freshness requirements.
 */

/**
 * Cache duration presets in seconds
 */
export const CACHE_DURATIONS = {
  /** 1 minute - Volatile data (availability, live counts) */
  SHORT: 60,

  /** 5 minutes - Semi-dynamic data (stats, dashboards) */
  MEDIUM: 300,

  /** 10 minutes - Content that changes occasionally (directory listings) */
  STANDARD: 600,

  /** 1 hour - Stable public data (profiles, add-ons) */
  LONG: 3600,

  /** 24 hours - Static/reference data (cities, services) */
  DAY: 86400,
} as const;

export type CacheDuration =
  (typeof CACHE_DURATIONS)[keyof typeof CACHE_DURATIONS];

/**
 * CDN Cache-Control headers matching duration presets
 * Uses stale-while-revalidate for better UX during revalidation
 */
export const CACHE_HEADERS = {
  /** 1 min fresh, 2 min stale */
  SHORT: {
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
  },
  /** 5 min fresh, 10 min stale */
  MEDIUM: {
    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
  },
  /** 10 min fresh, 20 min stale */
  STANDARD: {
    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
  },
  /** 1 hour fresh, 2 hours stale */
  LONG: {
    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
  },
} as const;

export type CacheHeaderPreset = keyof typeof CACHE_HEADERS;

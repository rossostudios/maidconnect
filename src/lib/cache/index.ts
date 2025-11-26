/**
 * Cache Utilities
 *
 * Centralized caching infrastructure for public API routes.
 *
 * @example
 * ```typescript
 * import {
 *   CACHE_DURATIONS,
 *   CACHE_HEADERS,
 *   CACHE_TAGS,
 *   directoryKey,
 *   invalidateProfessionals
 * } from '@/lib/cache';
 *
 * // In route handler:
 * const getCachedData = unstable_cache(
 *   async (params) => { ... },
 *   directoryKey(params),
 *   { revalidate: CACHE_DURATIONS.STANDARD, tags: [CACHE_TAGS.PROFESSIONALS] }
 * );
 *
 * return NextResponse.json(data, { headers: CACHE_HEADERS.STANDARD });
 *
 * // In mutation handler:
 * invalidateProfessionals();
 * ```
 */

// Configuration
export {
  CACHE_DURATIONS,
  CACHE_HEADERS,
  type CacheDuration,
  type CacheHeaderPreset,
} from "./config";
// Invalidation helpers
export {
  invalidateBookings,
  invalidateChangelogs,
  invalidateCities,
  invalidateDomain,
  invalidateHelp,
  invalidatePlatformStats,
  invalidateProfessionalAddons,
  invalidateProfessionalAvailability,
  invalidateProfessionals,
  invalidateRoadmap,
  invalidateSanityContent,
  invalidateTag,
  invalidateTags,
} from "./invalidate";

// Key generators
export {
  addonsKey,
  availabilityKey,
  changelogListKey,
  cityProfessionalsKey,
  type DirectoryParams,
  directoryKey,
  latestProfessionalsKey,
  platformStatsKey,
  searchKey,
} from "./keys";
// Tags
export {
  CACHE_TAGS,
  type CacheTag,
  getTagsForDomain,
  isValidTag,
} from "./tags";

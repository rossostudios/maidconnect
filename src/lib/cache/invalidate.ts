import { revalidateTag } from "next/cache";
import { CACHE_TAGS, type CacheTag, getTagsForDomain } from "./tags";

/**
 * Invalidate a single cache tag
 */
export function invalidateTag(tag: CacheTag): void {
  revalidateTag(tag);
}

/**
 * Invalidate multiple cache tags
 */
export function invalidateTags(tags: CacheTag[]): void {
  for (const tag of tags) {
    revalidateTag(tag);
  }
}

/**
 * Invalidate all tags for a domain
 * @example invalidateDomain('professionals') // Invalidates all professionals:* tags
 */
function invalidateDomain(domain: string): void {
  invalidateTags(getTagsForDomain(domain));
}

// ============================================
// Domain-Specific Invalidation Helpers
// ============================================

/**
 * Invalidate all professional-related caches
 * Call when: Professional profile updated, new professional verified
 */
export function invalidateProfessionals(): void {
  invalidateTags([
    CACHE_TAGS.PROFESSIONALS,
    CACHE_TAGS.PROFESSIONALS_DIRECTORY,
    CACHE_TAGS.PROFESSIONALS_SEARCH,
    CACHE_TAGS.PLATFORM_STATS,
  ]);
}

/**
 * Invalidate professional availability cache
 * Call when: Booking created, cancelled, or rescheduled
 */
function invalidateProfessionalAvailability(): void {
  invalidateTag(CACHE_TAGS.PROFESSIONALS_AVAILABILITY);
}

/**
 * Invalidate professional add-ons cache
 * Call when: Add-ons created, updated, or deleted
 */
export function invalidateProfessionalAddons(): void {
  invalidateTag(CACHE_TAGS.PROFESSIONALS_ADDONS);
}

/**
 * Invalidate booking-related caches
 * Call when: Booking state changes (created, confirmed, cancelled)
 */
export function invalidateBookings(): void {
  invalidateTags([
    CACHE_TAGS.BOOKINGS,
    CACHE_TAGS.BOOKINGS_STATS,
    CACHE_TAGS.PROFESSIONALS_AVAILABILITY,
    CACHE_TAGS.PLATFORM_STATS,
  ]);
}

/**
 * Invalidate changelog cache
 * Call when: Changelog published or updated
 */
export function invalidateChangelogs(): void {
  invalidateTag(CACHE_TAGS.CHANGELOGS);
}

/**
 * Invalidate roadmap cache
 * Call when: Roadmap item updated or votes change
 */
export function invalidateRoadmap(): void {
  invalidateTag(CACHE_TAGS.ROADMAP);
}

/**
 * Invalidate platform statistics cache
 * Call when: Any statistic-affecting event occurs
 */
function invalidatePlatformStats(): void {
  invalidateTag(CACHE_TAGS.PLATFORM_STATS);
}

/**
 * Invalidate help center cache
 * Call when: Help article published, updated, or deleted
 */
export function invalidateHelp(): void {
  invalidateTag(CACHE_TAGS.HELP);
}

/**
 * Invalidate cities cache
 * Call when: City page published, updated, or deleted
 */
export function invalidateCities(): void {
  invalidateTag(CACHE_TAGS.CITIES);
}

// ============================================
// Sanity Document Type Mapping
// ============================================

/**
 * Invalidate cache based on Sanity document type
 * Used by the Sanity webhook to trigger appropriate cache invalidation
 */
export function invalidateSanityContent(documentType: string): void {
  const typeToInvalidator: Record<string, () => void> = {
    helpArticle: invalidateHelp,
    changelog: invalidateChangelogs,
    roadmapItem: invalidateRoadmap,
    cityPage: invalidateCities,
  };

  const invalidator = typeToInvalidator[documentType];
  if (invalidator) {
    invalidator();
  }
}

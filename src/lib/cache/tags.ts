/**
 * Cache Tags - Type-Safe Tag Registry
 *
 * Naming Convention: `domain` or `domain:resource`
 * These tags enable coordinated cache invalidation via revalidateTag()
 */

export const CACHE_TAGS = {
  // ============================================
  // PROFESSIONALS DOMAIN
  // ============================================

  /** All professional-related data */
  PROFESSIONALS: "professionals",

  /** Directory listings (/api/directory/professionals) */
  PROFESSIONALS_DIRECTORY: "professionals:directory",

  /** Professional search results */
  PROFESSIONALS_SEARCH: "professionals:search",

  /** Availability calendar data */
  PROFESSIONALS_AVAILABILITY: "professionals:availability",

  /** Service add-ons */
  PROFESSIONALS_ADDONS: "professionals:addons",

  // ============================================
  // BOOKINGS DOMAIN
  // ============================================

  /** All booking-related data */
  BOOKINGS: "bookings",

  /** Booking statistics */
  BOOKINGS_STATS: "bookings:stats",

  // ============================================
  // CONTENT DOMAIN (Sanity CMS)
  // ============================================

  /** Changelog entries */
  CHANGELOGS: "changelogs",

  /** Roadmap items */
  ROADMAP: "roadmap",

  /** Help center articles */
  HELP: "help",

  /** City/location data */
  CITIES: "cities",

  // ============================================
  // PLATFORM DOMAIN
  // ============================================

  /** Platform-wide statistics */
  PLATFORM_STATS: "platform:stats",

  /** Reference data (services, categories) */
  REFERENCE_DATA: "reference-data",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

/**
 * Get all tags for a domain (including sub-tags)
 * @example getTagsForDomain('professionals') // ['professionals', 'professionals:directory', ...]
 */
export function getTagsForDomain(domain: string): CacheTag[] {
  return Object.values(CACHE_TAGS).filter(
    (tag) => tag === domain || tag.startsWith(`${domain}:`)
  ) as CacheTag[];
}

/**
 * Type guard to check if a string is a valid cache tag
 */
export function isValidTag(tag: string): tag is CacheTag {
  return Object.values(CACHE_TAGS).includes(tag as CacheTag);
}

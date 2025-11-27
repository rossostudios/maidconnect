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

  // ============================================
  // ADMIN DOMAIN
  // ============================================

  /** Admin analytics data */
  ADMIN_ANALYTICS: "admin:analytics",

  /** Admin analytics overview dashboard */
  ADMIN_ANALYTICS_OVERVIEW: "admin:analytics:overview",

  /** Admin analytics growth metrics */
  ADMIN_ANALYTICS_GROWTH: "admin:analytics:growth",

  /** Admin analytics top performers */
  ADMIN_ANALYTICS_TOP_PERFORMERS: "admin:analytics:top-performers",

  /** Admin analytics financial health */
  ADMIN_ANALYTICS_FINANCIAL: "admin:analytics:financial",

  /** Admin analytics disputes */
  ADMIN_ANALYTICS_DISPUTES: "admin:analytics:disputes",

  /** Admin applications statistics */
  ADMIN_APPLICATIONS: "admin:applications",

  /** Admin professionals queue */
  ADMIN_PROFESSIONALS_QUEUE: "admin:professionals:queue",

  /** Admin bookings list */
  ADMIN_BOOKINGS: "admin:bookings",

  /** Admin background checks */
  ADMIN_BACKGROUND_CHECKS: "admin:background-checks",

  /** Admin interviews */
  ADMIN_INTERVIEWS: "admin:interviews",

  /** Admin ambassadors */
  ADMIN_AMBASSADORS: "admin:ambassadors",

  /** Admin roadmap list */
  ADMIN_ROADMAP: "admin:roadmap",
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
function isValidTag(tag: string): tag is CacheTag {
  return Object.values(CACHE_TAGS).includes(tag as CacheTag);
}

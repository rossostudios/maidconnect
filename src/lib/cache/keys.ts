/**
 * Cache Key Generators
 *
 * These functions generate consistent cache keys for parameterized queries.
 * Keys are arrays of strings that uniquely identify cached data.
 *
 * Convention: ['domain', 'resource', 'param:value', ...]
 */

export type DirectoryParams = {
  country?: string;
  city?: string;
  service?: string;
  minExperience?: number;
  minRating?: number;
  verifiedOnly?: boolean;
  backgroundCheck?: boolean;
  query?: string;
  sort?: string;
  page?: number;
  limit?: number;
};

/**
 * Generate cache key for professional directory listings
 * Normalizes params to ensure consistent cache hits
 */
export function directoryKey(params: DirectoryParams): string[] {
  return [
    "directory",
    `c:${params.country?.toUpperCase() || "all"}`,
    `city:${params.city?.toLowerCase() || "all"}`,
    `svc:${params.service || "all"}`,
    `exp:${params.minExperience || 0}`,
    `rat:${params.minRating || 0}`,
    `ver:${params.verifiedOnly ? "1" : "0"}`,
    `bg:${params.backgroundCheck ? "1" : "0"}`,
    `q:${params.query?.toLowerCase().trim() || ""}`,
    `s:${params.sort || "rating"}`,
    `p:${params.page || 1}`,
    `l:${params.limit || 20}`,
  ];
}

/**
 * Generate cache key for professional availability
 */
export function availabilityKey(
  professionalId: string,
  startDate: string,
  endDate: string
): string[] {
  return ["availability", professionalId, startDate, endDate];
}

/**
 * Generate cache key for professional add-ons
 */
export function addonsKey(professionalId: string): string[] {
  return ["addons", professionalId];
}

/**
 * Generate cache key for platform statistics
 */
export function platformStatsKey(): string[] {
  return ["stats", "platform"];
}

/**
 * Generate cache key for changelog list
 */
export function changelogListKey(params: {
  page?: number;
  limit?: number;
  category?: string | null;
}): string[] {
  return [
    "changelogs",
    "list",
    `p:${params.page || 1}`,
    `l:${params.limit || 10}`,
    `cat:${params.category || "all"}`,
  ];
}

/**
 * Generate cache key for professional search
 */
export function searchKey(query: string, limit: number): string[] {
  return ["professionals", "search", `q:${query.toLowerCase().trim()}`, `l:${limit}`];
}

/**
 * Generate cache key for latest professionals
 */
export function latestProfessionalsKey(limit: number): string[] {
  return ["professionals", "latest", `l:${limit}`];
}

/**
 * Generate cache key for city professionals
 */
export function cityProfessionalsKey(cityName: string): string[] {
  return ["professionals", "city", cityName.toLowerCase()];
}

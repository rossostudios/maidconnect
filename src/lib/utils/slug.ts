/**
 * Slug Generation and Validation Utilities
 *
 * Functions for creating and managing SEO-friendly URL slugs
 * for professional profiles (vanity URLs).
 *
 * @module slug
 */

/**
 * Generates a URL-safe slug from a given string
 *
 * Transformations:
 * 1. Convert to lowercase
 * 2. Replace spaces with hyphens
 * 3. Remove special characters (keep only letters, numbers, hyphens)
 * 4. Remove consecutive hyphens
 * 5. Trim leading/trailing hyphens
 * 6. Limit to max length
 *
 * @param text - Input text to convert to slug
 * @param maxLength - Maximum slug length (default: 50)
 * @returns URL-safe slug
 *
 * @example
 * ```ts
 * generateSlug("María García López");
 * // Returns: "maria-garcia-lopez"
 *
 * generateSlug("Juan Pérez & Associates!");
 * // Returns: "juan-perez-associates"
 * ```
 */
export function generateSlug(text: string, maxLength = 50): string {
  let slug = text.toLowerCase();

  // Replace accented characters with ASCII equivalents
  slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Replace spaces with hyphens
  slug = slug.replace(/\s+/g, '-');

  // Remove special characters (keep only letters, numbers, hyphens)
  slug = slug.replace(/[^a-z0-9\-]/g, '');

  // Remove consecutive hyphens
  slug = slug.replace(/\-+/g, '-');

  // Trim leading/trailing hyphens
  slug = slug.replace(/^\-+|\-+$/g, '');

  // Limit length
  if (slug.length > maxLength) {
    slug = slug.substring(0, maxLength);
    // Remove trailing hyphen if present after truncation
    slug = slug.replace(/\-+$/g, '');
  }

  // Fallback if slug is empty
  if (!slug) {
    slug = 'professional';
  }

  return slug;
}

/**
 * Generates a unique slug by appending a hash suffix
 *
 * Creates a slug from the input text and appends a short hash
 * from the profile ID to ensure uniqueness.
 *
 * @param text - Input text to convert to slug
 * @param profileId - Professional's profile ID (UUID)
 * @returns Unique slug with hash suffix
 *
 * @example
 * ```ts
 * generateUniqueSlug("María García", "abc123-def456-ghi789");
 * // Returns: "maria-garcia-abc123"
 * ```
 */
export function generateUniqueSlug(text: string, profileId: string): string {
  const baseSlug = generateSlug(text);
  const hash = profileId.substring(0, 6); // First 6 chars of UUID
  return `${baseSlug}-${hash}`;
}

/**
 * Validates if a string is a valid slug format
 *
 * Valid slugs:
 * - Only lowercase letters, numbers, and hyphens
 * - No leading/trailing hyphens
 * - No consecutive hyphens
 * - Between 3 and 60 characters
 *
 * @param slug - Slug to validate
 * @returns True if valid slug format
 *
 * @example
 * ```ts
 * isValidSlug("maria-garcia-abc123"); // true
 * isValidSlug("María García"); // false (has spaces and accents)
 * isValidSlug("ab"); // false (too short)
 * isValidSlug("slug--with--double-hyphens"); // false (consecutive hyphens)
 * ```
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') {
    return false;
  }

  // Check length
  if (slug.length < 3 || slug.length > 60) {
    return false;
  }

  // Check format: only lowercase letters, numbers, and single hyphens
  const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

/**
 * Sanitizes user input for slug generation
 *
 * Removes dangerous characters and validates input before
 * generating a slug.
 *
 * @param input - User-provided text
 * @returns Sanitized text safe for slug generation
 *
 * @example
 * ```ts
 * sanitizeSlugInput("<script>alert('xss')</script> María García");
 * // Returns: "scriptalertxssscript maria garcia"
 * ```
 */
export function sanitizeSlugInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');

  // Remove special characters that could be dangerous
  sanitized = sanitized.replace(/[<>\"'%;()&+]/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Extracts slug from a vanity URL
 *
 * @param url - Full or partial URL
 * @returns Extracted slug or null
 *
 * @example
 * ```ts
 * extractSlugFromUrl("/pro/maria-garcia-abc123");
 * // Returns: "maria-garcia-abc123"
 *
 * extractSlugFromUrl("https://casaora.com/pro/juan-perez-xyz789");
 * // Returns: "juan-perez-xyz789"
 * ```
 */
export function extractSlugFromUrl(url: string): string | null {
  if (!url) {
    return null;
  }

  // Match /pro/{slug} pattern
  const match = url.match(/\/pro\/([a-z0-9\-]+)/);
  return match ? match[1] : null;
}

/**
 * Builds a full vanity URL from a slug
 *
 * @param slug - Professional's slug
 * @param baseUrl - Base URL (optional, uses NEXT_PUBLIC_SITE_URL if not provided)
 * @returns Full vanity URL
 *
 * @example
 * ```ts
 * buildVanityUrl("maria-garcia-abc123");
 * // Returns: "https://casaora.com/pro/maria-garcia-abc123"
 *
 * buildVanityUrl("juan-perez", "http://localhost:3000");
 * // Returns: "http://localhost:3000/pro/juan-perez"
 * ```
 */
export function buildVanityUrl(slug: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return `${base}/pro/${slug}`;
}

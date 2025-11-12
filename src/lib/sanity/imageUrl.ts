/**
 * Sanity Image URL Builder
 *
 * Generates optimized image URLs from Sanity CDN
 */

import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { serverClient } from "./client";

const builder = imageUrlBuilder(serverClient);

/**
 * Generate optimized image URL from Sanity image reference
 *
 * @example
 * ```ts
 * // Basic usage
 * const url = imageUrl(image).width(800).height(600).url();
 *
 * // With auto format and quality
 * const url = imageUrl(image)
 *   .width(1200)
 *   .height(630)
 *   .auto('format')
 *   .quality(85)
 *   .url();
 * ```
 */
export function imageUrl(source: SanityImageSource) {
  return builder.image(source);
}

import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "./client";

/**
 * Image URL builder for Sanity images
 * Provides helpers for generating optimized image URLs with transformations
 */

const builder = imageUrlBuilder(client);

/**
 * Get image URL from Sanity image reference
 * @param source - Sanity image reference
 * @returns Image URL builder
 */
export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

/**
 * Get optimized image URL with common transformations
 * @param source - Sanity image reference
 * @param width - Desired width
 * @param height - Desired height (optional)
 * @param format - Image format (webp, jpg, png)
 * @param quality - Image quality (1-100)
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
  source: SanityImageSource,
  options: {
    width?: number;
    height?: number;
    format?: "webp" | "jpg" | "png";
    quality?: number;
    fit?: "clip" | "crop" | "fill" | "fillmax" | "max" | "scale" | "min";
  } = {}
): string {
  const { width, height, format = "webp", quality = 80, fit = "max" } = options;

  // biome-ignore lint/suspicious/noFocusedTests: .fit() is an image builder method, not a test
  let imageUrl = builder.image(source).format(format).quality(quality).fit(fit);

  if (width) {
    imageUrl = imageUrl.width(width);
  }

  if (height) {
    imageUrl = imageUrl.height(height);
  }

  return imageUrl.url();
}

/**
 * Get blur placeholder data URL for lazy loading
 * @param source - Sanity image reference
 * @returns Base64 encoded blur data URL
 */
export function getBlurDataUrl(source: SanityImageSource): string {
  return builder.image(source).width(20).height(20).blur(50).quality(20).format("jpg").url();
}

/**
 * Get srcset for responsive images
 * @param source - Sanity image reference
 * @param widths - Array of image widths
 * @returns srcset string
 */
function getSrcSet(
  source: SanityImageSource,
  widths: number[] = [640, 750, 828, 1080, 1200, 1920, 2048, 3840]
): string {
  return widths
    .map((width) => {
      const url = builder.image(source).width(width).format("webp").quality(80).url();
      return `${url} ${width}w`;
    })
    .join(", ");
}

/**
 * Extract alt text from Sanity image
 * @param image - Sanity image object with alt field
 * @returns Alt text or empty string
 */
function getImageAlt(image: any): string {
  return image?.alt || image?.caption || "";
}

/**
 * Check if image source is valid
 * @param source - Sanity image reference
 * @returns True if valid image source
 */
function isValidImageSource(source: any): boolean {
  return !!source && typeof source === "object" && "_type" in source && source._type === "image";
}

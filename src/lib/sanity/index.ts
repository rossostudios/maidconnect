/**
 * Sanity.io Integration
 * Centralized exports for all Sanity-related utilities
 */

// Clients
export { client, sanityConfig, serverClient, writeClient } from "./client";
// Image utilities
export {
  getBlurDataUrl,
  getImageAlt,
  getOptimizedImageUrl,
  getSrcSet,
  isValidImageSource,
  urlFor,
} from "./image";
// Portable Text
export { portableTextComponents, SanityPortableText } from "./portable-text";
// Queries
export * from "./queries";

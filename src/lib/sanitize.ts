import DOMPurify from "isomorphic-dompurify";
import type { Config as DOMPurifyConfig } from "dompurify";

/**
 * Sanitize HTML content to prevent XSS attacks
 *
 * This function uses DOMPurify to clean HTML content while preserving safe formatting.
 * It removes dangerous elements like scripts, iframes, and event handlers.
 *
 * @param dirty - The potentially unsafe HTML string
 * @param options - Optional configuration for DOMPurify
 * @returns Sanitized HTML string safe for rendering
 *
 * @example
 * ```ts
 * const safeHTML = sanitizeHTML(userInput);
 * <div dangerouslySetInnerHTML={{ __html: safeHTML }} />
 * ```
 */
export function sanitizeHTML(dirty: string, options?: DOMPurifyConfig): string {
  // Default configuration that allows common formatting
  const defaultConfig = {
    // Allow common HTML tags
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "a",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "code",
      "pre",
      "hr",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "img",
      "div",
      "span",
    ],
    // Allow common attributes
    ALLOWED_ATTR: [
      "href",
      "title",
      "alt",
      "src",
      "class",
      "id",
      "rel",
      "target",
      "width",
      "height",
    ],
    // Allow data attributes for Tailwind classes
    ALLOW_DATA_ATTR: true,
    // Force all links to open in new tab with noopener
    ADD_ATTR: ["target"],
    FORBID_ATTR: ["onerror", "onload", "onclick"],
    FORBID_TAGS: ["script", "iframe", "object", "embed", "form"],
    ...options,
  } satisfies DOMPurifyConfig;

  return String(DOMPurify.sanitize(dirty, defaultConfig));
}

/**
 * Sanitize HTML for rich text content (help articles, changelog, etc.)
 *
 * This allows a broader set of HTML tags and attributes for content
 * that comes from trusted sources (admins) but still protects against XSS.
 *
 * @param dirty - The potentially unsafe HTML string
 * @returns Sanitized HTML string
 */
export function sanitizeRichContent(dirty: string): string {
  const config = {
    // More permissive for admin-created content
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "a",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "code",
      "pre",
      "hr",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "img",
      "div",
      "span",
      "figure",
      "figcaption",
      "video",
      "audio",
      "source",
    ],
    ALLOWED_ATTR: [
      "href",
      "title",
      "alt",
      "src",
      "class",
      "id",
      "rel",
      "target",
      "width",
      "height",
      "controls",
      "autoplay",
      "loop",
      "muted",
      "poster",
    ],
    ALLOW_DATA_ATTR: true,
    // Still forbid dangerous attributes
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
    FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "input"],
  } satisfies DOMPurifyConfig;

  return String(DOMPurify.sanitize(dirty, config));
}

/**
 * Sanitize user-generated content (reviews, comments, bios)
 *
 * This is the most restrictive sanitization for user-submitted content.
 * It strips most HTML and only allows basic text formatting.
 *
 * @param dirty - The potentially unsafe HTML string
 * @returns Sanitized HTML string
 */
export function sanitizeUserContent(dirty: string): string {
  const config = {
    // Very restrictive for user content
    ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "a"],
    ALLOWED_ATTR: ["href", "rel", "target"],
    ALLOW_DATA_ATTR: false,
    // Force safe link handling
    FORBID_ATTR: ["onerror", "onload", "onclick"],
    FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "input", "img", "video", "audio"],
  } satisfies DOMPurifyConfig;

  return String(DOMPurify.sanitize(dirty, config));
}

/**
 * Strip all HTML tags and return plain text
 *
 * Use this when you need to display content as plain text
 * without any formatting.
 *
 * @param dirty - The potentially unsafe HTML string
 * @returns Plain text string with all HTML removed
 */
export function stripHTML(dirty: string): string {
  const config = {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  } satisfies DOMPurifyConfig;

  return String(DOMPurify.sanitize(dirty, config));
}

/**
 * Validate and sanitize URLs to prevent javascript: and data: URI attacks
 *
 * @param url - The URL to validate
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeURL(url: string): string {
  if (!url) {
    return "";
  }

  // Remove any whitespace
  url = url.trim();

  // Block dangerous protocols
  const dangerousProtocols = ["javascript:", "data:", "vbscript:", "file:"];
  const lowerUrl = url.toLowerCase();

  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      console.warn("[Sanitize] Blocked dangerous URL:", url);
      return "";
    }
  }

  // Allow http, https, mailto, tel
  if (
    lowerUrl.startsWith("http://") ||
    lowerUrl.startsWith("https://") ||
    lowerUrl.startsWith("mailto:") ||
    lowerUrl.startsWith("tel:") ||
    lowerUrl.startsWith("/")
  ) {
    return url;
  }

  // If no protocol, assume https
  return `https://${url}`;
}

/**
 * Configuration presets for different content types
 */
export const SANITIZE_PRESETS = {
  /** For admin-created content like help articles, changelog */
  RICH_CONTENT: sanitizeRichContent,
  /** For user-generated content like reviews, comments */
  USER_CONTENT: sanitizeUserContent,
  /** For general HTML with balanced security */
  DEFAULT: sanitizeHTML,
  /** Remove all HTML tags */
  PLAIN_TEXT: stripHTML,
} as const;

/**
 * Type-safe wrapper for sanitization
 *
 * @example
 * ```ts
 * const safeContent = sanitize(userInput, 'USER_CONTENT');
 * ```
 */
export function sanitize(dirty: string, preset: keyof typeof SANITIZE_PRESETS = "DEFAULT"): string {
  return SANITIZE_PRESETS[preset](dirty);
}

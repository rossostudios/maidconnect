/**
 * SkipLink Component
 *
 * Provides keyboard navigation to skip repetitive content.
 * Essential for WCAG 2.2 AA compliance and screen reader users.
 *
 * @see https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html
 */

"use client";

import { useTranslations } from "next-intl";

type SkipLinkProps = {
  /**
   * ID of the element to skip to (without #)
   * @default "main-content"
   */
  href?: string;
  /**
   * Text content for the skip link
   * If not provided, uses translation key "skipLink.skipToContent"
   */
  children?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
};

/**
 * SkipLink - Accessible skip navigation component
 *
 * @example
 * ```tsx
 * // In your layout
 * <body>
 *   <SkipLink />
 *   <Header />
 *   <main id="main-content">
 *     {children}
 *   </main>
 * </body>
 * ```
 *
 * @example
 * ```tsx
 * // Multiple skip links
 * <SkipLinks>
 *   <SkipLink href="#main-content">Skip to main content</SkipLink>
 *   <SkipLink href="#search">Skip to search</SkipLink>
 * </SkipLinks>
 * ```
 */
export function SkipLink({ href = "main-content", children, className = "" }: SkipLinkProps) {
  const t = useTranslations("common");

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(href);
    if (target) {
      // Focus the target element
      target.focus();
      // Scroll into view smoothly
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      // Add visual focus if tabIndex was set
      if (target.tabIndex === -1) {
        target.style.outline = "2px solid var(--focus-ring, var(--red))";
        target.style.outlineOffset = "4px";
        // Remove outline after a short delay
        setTimeout(() => {
          target.style.outline = "";
          target.style.outlineOffset = "";
        }, 2000);
      }
    }
  };

  return (
    <a className={`skip-link ${className}`.trim()} href={`#${href}`} onClick={handleClick}>
      {children || t("skipToContent", { default: "Skip to main content" })}
    </a>
  );
}

/**
 * SkipLinks - Container for multiple skip links
 *
 * @example
 * ```tsx
 * <SkipLinks>
 *   <SkipLink href="main-content">Skip to content</SkipLink>
 *   <SkipLink href="footer">Skip to footer</SkipLink>
 * </SkipLinks>
 * ```
 */
export function SkipLinks({ children }: { children: React.ReactNode }) {
  return (
    <div aria-label="Skip links" className="skip-links" role="navigation">
      {children}
    </div>
  );
}

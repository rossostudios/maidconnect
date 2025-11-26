/**
 * FlexibleCarousel - Airbnb-Inspired Horizontal Scroll Carousel
 *
 * A reusable horizontal scroll carousel with:
 * - Smooth scroll with navigation arrows
 * - Touch/swipe support
 * - Responsive card sizing
 * - Gradient fade edges
 *
 * Inspired by Airbnb's 2025 flexible search carousels.
 *
 * Following Lia Design System.
 */

"use client";

import { ArrowLeft02Icon, ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils/core";

type FlexibleCarouselProps = {
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
  viewAllHref?: string;
  viewAllLabel?: string;
  children: React.ReactNode;
  className?: string;
  itemClassName?: string;
  gap?: "sm" | "md" | "lg";
};

export function FlexibleCarousel({
  title,
  subtitle,
  showViewAll = false,
  viewAllHref,
  viewAllLabel = "View all",
  children,
  className,
  gap = "md",
}: FlexibleCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const gapClass = {
    sm: "gap-3",
    md: "gap-4",
    lg: "gap-6",
  }[gap];

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) {
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    checkScroll();
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener("scroll", checkScroll);
      }
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) {
      return;
    }

    const scrollAmount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className={cn("relative", className)}>
      {/* Header */}
      {(title || showViewAll) && (
        <div className="mb-4 flex items-center justify-between">
          <div>
            {title && (
              <h2 className={cn("font-semibold text-foreground text-xl", geistSans.className)}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={cn("mt-1 text-muted-foreground text-sm", geistSans.className)}>
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Navigation Arrows - Desktop (Airbnb-style) */}
            <div className="hidden items-center gap-1 md:flex">
              <button
                aria-label="Scroll left"
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-600 shadow-sm transition-all hover:scale-105 hover:shadow-md active:scale-95 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700",
                  !canScrollLeft && "pointer-events-none opacity-30"
                )}
                disabled={!canScrollLeft}
                onClick={() => scroll("left")}
                type="button"
              >
                <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} strokeWidth={2} />
              </button>
              <button
                aria-label="Scroll right"
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-600 shadow-sm transition-all hover:scale-105 hover:shadow-md active:scale-95 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700",
                  !canScrollRight && "pointer-events-none opacity-30"
                )}
                disabled={!canScrollRight}
                onClick={() => scroll("right")}
                type="button"
              >
                <HugeiconsIcon className="h-4 w-4" icon={ArrowRight02Icon} strokeWidth={2} />
              </button>
            </div>

            {/* View All Link */}
            {showViewAll && viewAllHref && (
              <a
                className={cn(
                  "flex items-center gap-1 text-rausch-600 text-sm hover:text-rausch-700",
                  geistSans.className
                )}
                href={viewAllHref}
              >
                {viewAllLabel}
                <HugeiconsIcon className="h-4 w-4" icon={ArrowRight02Icon} />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="relative">
        {/* Left Gradient Fade - Uses semantic background color */}
        {canScrollLeft && (
          <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-16 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-neutral-900 dark:via-neutral-900/80" />
        )}

        {/* Right Gradient Fade - Uses semantic background color */}
        {canScrollRight && (
          <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-16 bg-gradient-to-l from-white via-white/80 to-transparent dark:from-neutral-900 dark:via-neutral-900/80" />
        )}

        {/* Scrollable Container */}
        <div
          className={cn("scrollbar-hide flex overflow-x-auto scroll-smooth pb-2", gapClass)}
          ref={scrollRef}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Carousel Item wrapper for consistent styling
 */
export function CarouselItem({
  children,
  className,
  minWidth = "240px",
}: {
  children: React.ReactNode;
  className?: string;
  minWidth?: string;
}) {
  return (
    <div className={cn("flex-shrink-0", className)} style={{ minWidth }}>
      {children}
    </div>
  );
}

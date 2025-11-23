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
import { Button } from "@/components/ui/button";
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
    if (!scrollRef.current) return;

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
    if (!scrollRef.current) return;

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
              <h2 className={cn("font-semibold text-neutral-900 text-xl", geistSans.className)}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={cn("mt-1 text-neutral-500 text-sm", geistSans.className)}>{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Navigation Arrows - Desktop */}
            <div className="hidden items-center gap-2 md:flex">
              <Button
                className={cn(
                  "h-8 w-8 rounded-full p-0 transition-opacity",
                  !canScrollLeft && "cursor-not-allowed opacity-30"
                )}
                disabled={!canScrollLeft}
                onClick={() => scroll("left")}
                size="sm"
                variant="outline"
              >
                <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} />
                <span className="sr-only">Scroll left</span>
              </Button>
              <Button
                className={cn(
                  "h-8 w-8 rounded-full p-0 transition-opacity",
                  !canScrollRight && "cursor-not-allowed opacity-30"
                )}
                disabled={!canScrollRight}
                onClick={() => scroll("right")}
                size="sm"
                variant="outline"
              >
                <HugeiconsIcon className="h-4 w-4" icon={ArrowRight02Icon} />
                <span className="sr-only">Scroll right</span>
              </Button>
            </div>

            {/* View All Link */}
            {showViewAll && viewAllHref && (
              <a
                className={cn(
                  "flex items-center gap-1 text-orange-600 text-sm hover:text-orange-700",
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
        {/* Left Gradient Fade */}
        {canScrollLeft && (
          <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-12 bg-gradient-to-r from-white to-transparent" />
        )}

        {/* Right Gradient Fade */}
        {canScrollRight && (
          <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-12 bg-gradient-to-l from-white to-transparent" />
        )}

        {/* Scrollable Container */}
        <div
          className={cn(
            "scrollbar-hide flex overflow-x-auto scroll-smooth pb-2",
            gapClass
          )}
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
    <div
      className={cn("flex-shrink-0", className)}
      style={{ minWidth }}
    >
      {children}
    </div>
  );
}

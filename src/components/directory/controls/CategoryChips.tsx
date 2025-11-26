"use client";

/**
 * CategoryChips - Airbnb-style horizontal scrollable category navigation
 *
 * Features:
 * - Icon + label format like Airbnb category tabs
 * - Horizontal scrolling with gradient fade indicators
 * - Active state with underline indicator
 * - Keyboard accessible with focus states
 */

import {
  BabyBottleIcon,
  Bone01Icon,
  Car01Icon,
  CleaningBucketIcon,
  HeartCheckIcon,
  Home01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef, useState } from "react";
import type { ServiceCategory, useDirectoryFilters } from "@/hooks/use-directory-filters";
import { cn } from "@/lib/utils";

type CategoryChipsProps = {
  filters: ReturnType<typeof useDirectoryFilters>["filters"];
  setFilter: ReturnType<typeof useDirectoryFilters>["setFilter"];
  className?: string;
};

/**
 * Category definitions with icons matching Airbnb's visual style
 */
const CATEGORIES = [
  {
    value: null as ServiceCategory | null,
    label: "All Services",
    icon: Home01Icon,
  },
  {
    value: "housekeeping" as ServiceCategory,
    label: "Housekeeping",
    icon: CleaningBucketIcon,
  },
  {
    value: "childcare" as ServiceCategory,
    label: "Childcare",
    icon: BabyBottleIcon,
  },
  {
    value: "elder-care" as ServiceCategory,
    label: "Elder Care",
    icon: HeartCheckIcon,
  },
  {
    value: "pet-care" as ServiceCategory,
    label: "Pet Care",
    icon: Bone01Icon,
  },
  {
    value: "relocation" as ServiceCategory,
    label: "Relocation",
    icon: Car01Icon,
  },
  {
    value: "lifestyle" as ServiceCategory,
    label: "Lifestyle",
    icon: SparklesIcon,
  },
];

export function CategoryChips({ filters, setFilter, className }: CategoryChipsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(true);

  // Update gradient visibility on scroll
  const updateGradients = () => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftGradient(scrollLeft > 0);
    setShowRightGradient(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }

    updateGradients();
    container.addEventListener("scroll", updateGradients);
    window.addEventListener("resize", updateGradients);

    return () => {
      container.removeEventListener("scroll", updateGradients);
      window.removeEventListener("resize", updateGradients);
    };
  }, [updateGradients]);

  const handleCategoryClick = (value: ServiceCategory | null) => {
    setFilter("service", value);
    // Reset to page 1 when changing category
    setFilter("page", 1);
  };

  return (
    <div className={cn("relative", className)}>
      {/* Left gradient fade */}
      <div
        className={cn(
          "pointer-events-none absolute top-0 left-0 z-10 h-full w-12 bg-gradient-to-r from-neutral-50 to-transparent transition-opacity duration-200 dark:from-neutral-950",
          showLeftGradient ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Scrollable container */}
      <div className="scrollbar-hide flex gap-8 overflow-x-auto px-1 py-4" ref={scrollRef}>
        {CATEGORIES.map((category) => {
          const isActive =
            category.value === null ? filters.service === null : filters.service === category.value;

          return (
            <button
              className={cn(
                "group flex shrink-0 flex-col items-center gap-2 pb-3 transition-all",
                "border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background",
                isActive
                  ? "border-neutral-900 text-neutral-900 dark:border-neutral-50 dark:text-neutral-50"
                  : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:text-neutral-300"
              )}
              key={category.value ?? "all"}
              onClick={() => handleCategoryClick(category.value)}
              type="button"
            >
              <HugeiconsIcon
                className={cn(
                  "h-6 w-6 transition-colors",
                  isActive
                    ? "text-neutral-900 dark:text-neutral-50"
                    : "text-neutral-500 group-hover:text-neutral-700 dark:text-neutral-400 dark:group-hover:text-neutral-300"
                )}
                icon={category.icon}
              />
              <span className="whitespace-nowrap font-medium text-xs">{category.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right gradient fade */}
      <div
        className={cn(
          "pointer-events-none absolute top-0 right-0 z-10 h-full w-12 bg-gradient-to-l from-neutral-50 to-transparent transition-opacity duration-200 dark:from-neutral-950",
          showRightGradient ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}

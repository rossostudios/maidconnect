/**
 * CategoryCarousel - Airbnb-Inspired Category Icons
 *
 * Horizontal scrollable category filter with:
 * - Icon + label pills
 * - Active state highlighting
 * - Sticky positioning option
 *
 * Inspired by Airbnb's 2025 category icons bar.
 *
 * Following Lia Design System.
 */

"use client";

import {
  BriefcaseIcon,
  CleaningBucketIcon,
  FlashIcon,
  Home01Icon,
  Home09Icon,
  PackageIcon,
  Settings01Icon,
  Shield01Icon,
  SparklesIcon,
  ToolsIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils/core";
import type { HugeIcon } from "@/types/icons";
import { FlexibleCarousel } from "./FlexibleCarousel";

export type ServiceCategory = {
  id: string;
  label: string;
  icon: HugeIcon;
  count?: number;
};

const DEFAULT_CATEGORIES: ServiceCategory[] = [
  { id: "all", label: "All Services", icon: SparklesIcon },
  { id: "cleaning", label: "Cleaning", icon: CleaningBucketIcon },
  { id: "electrical", label: "Electrical", icon: FlashIcon },
  { id: "handyman", label: "Handyman", icon: ToolsIcon },
  { id: "home", label: "Home", icon: Home09Icon },
  { id: "appliances", label: "Appliances", icon: Settings01Icon },
  { id: "moving", label: "Moving", icon: PackageIcon },
  { id: "security", label: "Security", icon: Shield01Icon },
  { id: "business", label: "Business", icon: BriefcaseIcon },
  { id: "other", label: "Other", icon: Home01Icon },
];

type CategoryCarouselProps = {
  categories?: ServiceCategory[];
  activeCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
  className?: string;
  sticky?: boolean;
};

export function CategoryCarousel({
  categories = DEFAULT_CATEGORIES,
  activeCategory = "all",
  onCategoryChange,
  className,
  sticky = false,
}: CategoryCarouselProps) {
  return (
    <div
      className={cn(
        sticky && "sticky top-16 z-20 -mx-4 bg-white px-4 py-3 shadow-sm md:-mx-8 md:px-8",
        className
      )}
    >
      <FlexibleCarousel gap="sm">
        {categories.map((category) => {
          const isActive = activeCategory === category.id;

          return (
            <button
              className={cn(
                "group flex flex-col items-center gap-2 rounded-lg px-4 py-3 transition-all",
                "min-w-[80px] flex-shrink-0",
                isActive
                  ? "bg-orange-50 text-orange-600"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
              )}
              key={category.id}
              onClick={() => onCategoryChange?.(category.id)}
              type="button"
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                  isActive ? "bg-orange-100" : "bg-neutral-100 group-hover:bg-neutral-200"
                )}
              >
                <HugeiconsIcon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-orange-600" : "text-neutral-500 group-hover:text-neutral-700"
                  )}
                  icon={category.icon}
                />
              </div>
              <span
                className={cn(
                  "whitespace-nowrap font-medium text-xs",
                  isActive ? "text-orange-600" : "text-neutral-600 group-hover:text-neutral-900",
                  geistSans.className
                )}
              >
                {category.label}
              </span>
              {/* Active indicator line */}
              <div
                className={cn(
                  "h-0.5 w-full rounded-full transition-colors",
                  isActive ? "bg-orange-500" : "bg-transparent"
                )}
              />
            </button>
          );
        })}
      </FlexibleCarousel>
    </div>
  );
}

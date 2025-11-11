/**
 * Roadmap Filters Component
 *
 * Allows filtering roadmap items by status and category
 */

"use client";

import {
  BulbIcon,
  Calendar01Icon,
  Cancel01Icon,
  Database01Icon,
  Link04Icon,
  LockIcon,
  MagicWand01Icon,
  PaintBoardIcon,
  Rocket01Icon,
  Search01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import type { RoadmapCategory, RoadmapStatus } from "@/types/roadmap";
import { ROADMAP_CATEGORY_CONFIG, ROADMAP_STATUS_CONFIG } from "@/types/roadmap";

// Icon mapping for status and category icons
const ICON_MAP = {
  BulbIcon,
  Calendar01Icon,
  Rocket01Icon,
  Tick02Icon,
  MagicWand01Icon,
  Database01Icon,
  PaintBoardIcon,
  LockIcon,
  Link04Icon,
} as const;

type RoadmapFiltersProps = {
  selectedStatuses: RoadmapStatus[];
  selectedCategories: RoadmapCategory[];
  searchQuery: string;
  onStatusChange: (statuses: RoadmapStatus[]) => void;
  onCategoryChange: (categories: RoadmapCategory[]) => void;
  onSearchChange: (query: string) => void;
};

export function RoadmapFilters({
  selectedStatuses,
  selectedCategories,
  searchQuery,
  onStatusChange,
  onCategoryChange,
  onSearchChange,
}: RoadmapFiltersProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleStatusToggle = (status: RoadmapStatus) => {
    if (selectedStatuses.includes(status)) {
      onStatusChange(selectedStatuses.filter((s) => s !== status));
    } else {
      onStatusChange([...selectedStatuses, status]);
    }
  };

  const handleCategoryToggle = (category: RoadmapCategory) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter((c) => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  const clearAllFilters = () => {
    onStatusChange([]);
    onCategoryChange([]);
    onSearchChange("");
  };

  const hasActiveFilters =
    selectedStatuses.length > 0 || selectedCategories.length > 0 || searchQuery.length > 0;

  return (
    /* Auto Layout: Vertical stack, gap 24px */
    <div className="flex flex-col gap-6">
      {/* Search bar - Auto Layout: Horizontal stack, padding 12px, gap 8px */}
      <div className="relative">
        <div
          className={`relative flex items-center gap-2 rounded-[16px] border-2 bg-[#f8fafc] px-4 py-3 transition-all ${isSearchFocused ? "border-[#64748b]" : "border-[#e2e8f0]"}
        `}
        >
          <HugeiconsIcon className="flex-shrink-0 text-[#94a3b8]" icon={Search01Icon} size={20} />
          <input
            className="flex-1 bg-transparent text-[#0f172a] outline-none placeholder:text-[#94a3b8]"
            onBlur={() => setIsSearchFocused(false)}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Search roadmap items..."
            type="text"
            value={searchQuery}
          />
          {searchQuery && (
            <button
              aria-label="Clear search"
              className="rounded-lg p-1 transition-colors hover:bg-[#f8fafc]"
              onClick={() => onSearchChange("")}
              type="button"
            >
              <HugeiconsIcon className="text-[#94a3b8]" icon={Cancel01Icon} size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Status filters - Auto Layout: Vertical stack, gap 12px */}
      <div className="flex flex-col gap-3">
        <h3 className="font-semibold text-[#0f172a] text-sm">Filter by Status</h3>
        {/* Auto Layout: Wrap, gap 8px */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(ROADMAP_STATUS_CONFIG) as RoadmapStatus[]).map((status) => {
            const config = ROADMAP_STATUS_CONFIG[status];
            const isSelected = selectedStatuses.includes(status);
            const StatusIcon = ICON_MAP[config.icon as keyof typeof ICON_MAP];

            return (
              <button
                className={`inline-flex items-center gap-1.5 rounded-[12px] border-2 px-3 py-2 font-medium text-sm transition-all duration-200 ${
                  isSelected
                    ? "border-[#64748b] bg-[#f8fafc] text-[#64748b]"
                    : "border-[#e2e8f0] bg-[#f8fafc] text-[#94a3b8] hover:border-[#64748b]"
                }
                `}
                key={status}
                onClick={() => handleStatusToggle(status)}
                type="button"
              >
                <HugeiconsIcon icon={StatusIcon} size={16} />
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category filters - Auto Layout: Vertical stack, gap 12px */}
      <div className="flex flex-col gap-3">
        <h3 className="font-semibold text-[#0f172a] text-sm">Filter by Category</h3>
        {/* Auto Layout: Wrap, gap 8px */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(ROADMAP_CATEGORY_CONFIG) as RoadmapCategory[]).map((category) => {
            const config = ROADMAP_CATEGORY_CONFIG[category];
            const isSelected = selectedCategories.includes(category);
            const CategoryIcon = ICON_MAP[config.icon as keyof typeof ICON_MAP];

            return (
              <button
                className={`inline-flex items-center gap-1.5 rounded-[12px] border-2 px-3 py-2 font-medium text-sm transition-all duration-200 ${
                  isSelected
                    ? "border-[#64748b] bg-[#f8fafc] text-[#64748b]"
                    : "border-[#e2e8f0] bg-[#f8fafc] text-[#94a3b8] hover:border-[#64748b]"
                }
                `}
                key={category}
                onClick={() => handleCategoryToggle(category)}
                type="button"
              >
                <HugeiconsIcon icon={CategoryIcon} size={16} />
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Clear filters - Auto Layout: Hug content */}
      {hasActiveFilters && (
        <button
          className="self-start font-medium text-[#64748b] text-sm transition-colors hover:text-[#64748b]"
          onClick={clearAllFilters}
          type="button"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}

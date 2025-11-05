/**
 * Roadmap Filters Component
 *
 * Allows filtering roadmap items by status and category
 */

"use client";

import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import type { RoadmapCategory, RoadmapStatus } from "@/types/roadmap";
import { ROADMAP_CATEGORY_CONFIG, ROADMAP_STATUS_CONFIG } from "@/types/roadmap";

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
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative">
        <div
          className={`relative flex items-center gap-2 rounded-[16px] border-2 bg-white px-4 py-3 transition-all ${isSearchFocused ? "border-[var(--red)]" : "border-[#ebe5d8]"}
        `}
        >
          <HugeiconsIcon className="flex-shrink-0 text-[#6B7280]" icon={Search01Icon} size={20} />
          <input
            className="flex-1 bg-transparent text-[var(--foreground)] outline-none placeholder:text-[#9CA3AF]"
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
              className="rounded-lg p-1 transition-colors hover:bg-[#f3f4f6]"
              onClick={() => onSearchChange("")}
              type="button"
            >
              <HugeiconsIcon className="text-[#6B7280]" icon={Cancel01Icon} size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Status filters */}
      <div>
        <h3 className="mb-3 font-semibold text-[var(--foreground)] text-sm">Filter by Status</h3>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(ROADMAP_STATUS_CONFIG) as RoadmapStatus[]).map((status) => {
            const config = ROADMAP_STATUS_CONFIG[status];
            const isSelected = selectedStatuses.includes(status);

            return (
              <button
                className={`inline-flex items-center gap-1.5 rounded-[12px] border-2 px-3 py-2 font-medium text-sm transition-all duration-200 ${
                  isSelected
                    ? "border-[var(--red)] bg-[#fff5f3] text-[var(--red)]"
                    : "border-[#ebe5d8] bg-white text-[#6B7280] hover:border-[var(--red)]"
                }
                `}
                key={status}
                onClick={() => handleStatusToggle(status)}
                type="button"
              >
                <span>{config.icon}</span>
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category filters */}
      <div>
        <h3 className="mb-3 font-semibold text-[var(--foreground)] text-sm">Filter by Category</h3>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(ROADMAP_CATEGORY_CONFIG) as RoadmapCategory[]).map((category) => {
            const config = ROADMAP_CATEGORY_CONFIG[category];
            const isSelected = selectedCategories.includes(category);

            return (
              <button
                className={`inline-flex items-center gap-1.5 rounded-[12px] border-2 px-3 py-2 font-medium text-sm transition-all duration-200 ${
                  isSelected
                    ? "border-[var(--red)] bg-[#fff5f3] text-[var(--red)]"
                    : "border-[#ebe5d8] bg-white text-[#6B7280] hover:border-[var(--red)]"
                }
                `}
                key={category}
                onClick={() => handleCategoryToggle(category)}
                type="button"
              >
                <span>{config.icon}</span>
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          className="font-medium text-[var(--red)] text-sm transition-colors hover:text-[var(--red)]"
          onClick={clearAllFilters}
          type="button"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}

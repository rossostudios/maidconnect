/**
 * Roadmap Filters Component
 *
 * Allows filtering roadmap items by status and category
 */

"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import type { RoadmapStatus, RoadmapCategory } from "@/types/roadmap";
import { ROADMAP_STATUS_CONFIG, ROADMAP_CATEGORY_CONFIG } from "@/types/roadmap";

interface RoadmapFiltersProps {
  selectedStatuses: RoadmapStatus[];
  selectedCategories: RoadmapCategory[];
  searchQuery: string;
  onStatusChange: (statuses: RoadmapStatus[]) => void;
  onCategoryChange: (categories: RoadmapCategory[]) => void;
  onSearchChange: (query: string) => void;
}

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
          className={`
          relative flex items-center gap-2 px-4 py-3 bg-white border-2 rounded-[16px] transition-all
          ${isSearchFocused ? "border-[#ff5d46]" : "border-[#ebe5d8]"}
        `}
        >
          <Search size={20} className="text-[#6B7280] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search roadmap items..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="flex-1 bg-transparent text-[#211f1a] placeholder:text-[#9CA3AF] outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="p-1 hover:bg-[#f3f4f6] rounded-lg transition-colors"
              aria-label="Clear search"
            >
              <X size={16} className="text-[#6B7280]" />
            </button>
          )}
        </div>
      </div>

      {/* Status filters */}
      <div>
        <h3 className="text-sm font-semibold text-[#211f1a] mb-3">Filter by Status</h3>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(ROADMAP_STATUS_CONFIG) as RoadmapStatus[]).map((status) => {
            const config = ROADMAP_STATUS_CONFIG[status];
            const isSelected = selectedStatuses.includes(status);

            return (
              <button
                key={status}
                onClick={() => handleStatusToggle(status)}
                className={`
                  inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-[12px]
                  border-2 transition-all duration-200
                  ${
                    isSelected
                      ? "border-[#ff5d46] bg-[#fff5f3] text-[#ff5d46]"
                      : "border-[#ebe5d8] bg-white text-[#6B7280] hover:border-[#ff5d46]"
                  }
                `}
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
        <h3 className="text-sm font-semibold text-[#211f1a] mb-3">Filter by Category</h3>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(ROADMAP_CATEGORY_CONFIG) as RoadmapCategory[]).map((category) => {
            const config = ROADMAP_CATEGORY_CONFIG[category];
            const isSelected = selectedCategories.includes(category);

            return (
              <button
                key={category}
                onClick={() => handleCategoryToggle(category)}
                className={`
                  inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-[12px]
                  border-2 transition-all duration-200
                  ${
                    isSelected
                      ? "border-[#ff5d46] bg-[#fff5f3] text-[#ff5d46]"
                      : "border-[#ebe5d8] bg-white text-[#6B7280] hover:border-[#ff5d46]"
                  }
                `}
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
          onClick={clearAllFilters}
          className="text-sm text-[#ff5d46] hover:text-[#e54d36] font-medium transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}

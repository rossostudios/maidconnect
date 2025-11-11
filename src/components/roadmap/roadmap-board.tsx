/**
 * Roadmap Board Component
 *
 * Main component for displaying and filtering roadmap items
 */

"use client";

import {
  BulbIcon,
  Calendar01Icon,
  Rocket01Icon,
  Search01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import type {
  RoadmapCategory,
  RoadmapItemWithVoteStatus,
  RoadmapListResponse,
  RoadmapStatus,
} from "@/types/roadmap";
import { RoadmapFilters } from "./roadmap-filters";
import { RoadmapItemCard } from "./roadmap-item-card";

export function RoadmapBoard() {
  const t = useTranslations("roadmap");
  const [items, setItems] = useState<RoadmapItemWithVoteStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatuses, setSelectedStatuses] = useState<RoadmapStatus[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<RoadmapCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchRoadmapItems = useCallback(async () => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        sort_by: "vote_count",
        sort_order: "desc",
      });

      if (selectedStatuses.length > 0) {
        params.append("status", selectedStatuses.join(","));
      }

      if (selectedCategories.length > 0) {
        params.append("category", selectedCategories.join(","));
      }

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await fetch(`/api/roadmap/list?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch roadmap items");
      }

      const data: RoadmapListResponse = await response.json();

      if (data.success) {
        setItems(data.data);
      }
    } catch (error) {
      console.error("Error fetching roadmap items:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatuses, selectedCategories, searchQuery]);

  useEffect(() => {
    fetchRoadmapItems();
  }, [fetchRoadmapItems]);

  // Group items by status
  const itemsByStatus = items.reduce(
    (acc, item) => {
      if (!acc[item.status]) {
        acc[item.status] = [];
      }
      acc[item.status]!.push(item);
      return acc;
    },
    {} as Record<RoadmapStatus, RoadmapItemWithVoteStatus[]>
  );

  return (
    /* Auto Layout: Horizontal stack (lg), gap 32px, responsive to vertical on mobile */
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
      {/* Filters sidebar - Auto Layout: Fixed width 320px, sticky position */}
      <div className="lg:col-span-1">
        <div className="sticky top-6">
          <RoadmapFilters
            onCategoryChange={setSelectedCategories}
            onSearchChange={setSearchQuery}
            onStatusChange={setSelectedStatuses}
            searchQuery={searchQuery}
            selectedCategories={selectedCategories}
            selectedStatuses={selectedStatuses}
          />
        </div>
      </div>

      {/* Roadmap items - Auto Layout: Fill remaining width, vertical stack */}
      <div className="lg:col-span-1">
        {isLoading ? (
          /* Loading state - Auto Layout: Center aligned, padding 48px vertical */
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#64748b] border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          /* Empty state - Auto Layout: Vertical stack, center aligned, gap 16px, padding 48px */
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#64748b]/10">
              <HugeiconsIcon className="text-[#64748b]" icon={Search01Icon} size={32} />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="serif-headline-sm text-[#0f172a]">{t("empty.title")}</h3>
              <p className="text-[#94a3b8]">{t("empty.description")}</p>
            </div>
          </div>
        ) : (
          /* Items list - Auto Layout: Vertical stack, gap 32px */
          <div className="flex flex-col gap-8">
            {/* Show items grouped by status if no status filter is active */}
            {selectedStatuses.length === 0 ? (
              <>
                {/* In Progress - Auto Layout: Vertical stack, gap 16px */}
                {itemsByStatus.in_progress && itemsByStatus.in_progress.length > 0 && (
                  <div className="flex flex-col gap-4">
                    <h2 className="serif-headline-md flex items-center gap-2 text-[#0f172a]">
                      <HugeiconsIcon icon={Rocket01Icon} size={24} />
                      {t("status.in_progress")}
                    </h2>
                    {/* Auto Layout: Grid, 2 columns on md+, gap 16px */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {itemsByStatus.in_progress.map((item) => (
                        <RoadmapItemCard item={item} key={item.id} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Planned - Auto Layout: Vertical stack, gap 16px */}
                {itemsByStatus.planned && itemsByStatus.planned.length > 0 && (
                  <div className="flex flex-col gap-4">
                    <h2 className="serif-headline-md flex items-center gap-2 text-[#0f172a]">
                      <HugeiconsIcon icon={Calendar01Icon} size={24} />
                      {t("status.planned")}
                    </h2>
                    {/* Auto Layout: Grid, 2 columns on md+, gap 16px */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {itemsByStatus.planned.map((item) => (
                        <RoadmapItemCard item={item} key={item.id} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Under Consideration - Auto Layout: Vertical stack, gap 16px */}
                {itemsByStatus.under_consideration &&
                  itemsByStatus.under_consideration.length > 0 && (
                    <div className="flex flex-col gap-4">
                      <h2 className="serif-headline-md flex items-center gap-2 text-[#0f172a]">
                        <HugeiconsIcon icon={BulbIcon} size={24} />
                        {t("status.under_consideration")}
                      </h2>
                      {/* Auto Layout: Grid, 2 columns on md+, gap 16px */}
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {itemsByStatus.under_consideration.map((item) => (
                          <RoadmapItemCard item={item} key={item.id} />
                        ))}
                      </div>
                    </div>
                  )}

                {/* Shipped - Auto Layout: Vertical stack, gap 16px */}
                {itemsByStatus.shipped && itemsByStatus.shipped.length > 0 && (
                  <div className="flex flex-col gap-4">
                    <h2 className="serif-headline-md flex items-center gap-2 text-[#0f172a]">
                      <HugeiconsIcon icon={Tick02Icon} size={24} />
                      {t("status.shipped")}
                    </h2>
                    {/* Auto Layout: Grid, 2 columns on md+, gap 16px */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {itemsByStatus.shipped.map((item) => (
                        <RoadmapItemCard item={item} key={item.id} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* If status filter is active, show all items in a grid */
              /* Auto Layout: Grid, 2 columns on md+, gap 16px */
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {items.map((item) => (
                  <RoadmapItemCard item={item} key={item.id} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Roadmap Board Component
 *
 * Main component for displaying and filtering roadmap items
 */

"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    fetchRoadmapItems();
  }, [selectedStatuses, selectedCategories, searchQuery]);

  const fetchRoadmapItems = async () => {
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
  };

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
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
      {/* Filters sidebar */}
      <div className="lg:col-span-1">
        <div className="sticky top-4">
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

      {/* Roadmap items */}
      <div className="lg:col-span-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#8B7355] border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f3f4f6]">
              <span className="text-3xl">🔍</span>
            </div>
            <h3 className="mb-2 font-semibold text-[#211f1a] text-lg">{t("empty.title")}</h3>
            <p className="text-[#6B7280]">{t("empty.description")}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Show items grouped by status if no status filter is active */}
            {selectedStatuses.length === 0 ? (
              <>
                {/* In Progress */}
                {itemsByStatus.in_progress && itemsByStatus.in_progress.length > 0 && (
                  <div>
                    <h2 className="mb-4 flex items-center gap-2 font-bold text-[#211f1a] text-xl">
                      <span>🚀</span>
                      {t("status.in_progress")}
                    </h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {itemsByStatus.in_progress.map((item) => (
                        <RoadmapItemCard item={item} key={item.id} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Planned */}
                {itemsByStatus.planned && itemsByStatus.planned.length > 0 && (
                  <div>
                    <h2 className="mb-4 flex items-center gap-2 font-bold text-[#211f1a] text-xl">
                      <span>📅</span>
                      {t("status.planned")}
                    </h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {itemsByStatus.planned.map((item) => (
                        <RoadmapItemCard item={item} key={item.id} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Under Consideration */}
                {itemsByStatus.under_consideration &&
                  itemsByStatus.under_consideration.length > 0 && (
                    <div>
                      <h2 className="mb-4 flex items-center gap-2 font-bold text-[#211f1a] text-xl">
                        <span>💡</span>
                        {t("status.under_consideration")}
                      </h2>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {itemsByStatus.under_consideration.map((item) => (
                          <RoadmapItemCard item={item} key={item.id} />
                        ))}
                      </div>
                    </div>
                  )}

                {/* Shipped */}
                {itemsByStatus.shipped && itemsByStatus.shipped.length > 0 && (
                  <div>
                    <h2 className="mb-4 flex items-center gap-2 font-bold text-[#211f1a] text-xl">
                      <span>✅</span>
                      {t("status.shipped")}
                    </h2>
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

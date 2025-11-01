/**
 * Roadmap Board Component
 *
 * Main component for displaying and filtering roadmap items
 */

"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { RoadmapFilters } from "./roadmap-filters";
import { RoadmapItemCard } from "./roadmap-item-card";
import type {
  RoadmapItemWithVoteStatus,
  RoadmapStatus,
  RoadmapCategory,
  RoadmapListResponse,
} from "@/types/roadmap";

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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Filters sidebar */}
      <div className="lg:col-span-1">
        <div className="sticky top-4">
          <RoadmapFilters
            selectedStatuses={selectedStatuses}
            selectedCategories={selectedCategories}
            searchQuery={searchQuery}
            onStatusChange={setSelectedStatuses}
            onCategoryChange={setSelectedCategories}
            onSearchChange={setSearchQuery}
          />
        </div>
      </div>

      {/* Roadmap items */}
      <div className="lg:col-span-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#ff5d46] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#f3f4f6] rounded-full flex items-center justify-center">
              <span className="text-3xl">🔍</span>
            </div>
            <h3 className="text-lg font-semibold text-[#211f1a] mb-2">
              {t("empty.title")}
            </h3>
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
                    <h2 className="text-xl font-bold text-[#211f1a] mb-4 flex items-center gap-2">
                      <span>🚀</span>
                      {t("status.in_progress")}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {itemsByStatus.in_progress.map((item) => (
                        <RoadmapItemCard key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Planned */}
                {itemsByStatus.planned && itemsByStatus.planned.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-[#211f1a] mb-4 flex items-center gap-2">
                      <span>📅</span>
                      {t("status.planned")}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {itemsByStatus.planned.map((item) => (
                        <RoadmapItemCard key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Under Consideration */}
                {itemsByStatus.under_consideration &&
                  itemsByStatus.under_consideration.length > 0 && (
                    <div>
                      <h2 className="text-xl font-bold text-[#211f1a] mb-4 flex items-center gap-2">
                        <span>💡</span>
                        {t("status.under_consideration")}
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {itemsByStatus.under_consideration.map((item) => (
                          <RoadmapItemCard key={item.id} item={item} />
                        ))}
                      </div>
                    </div>
                  )}

                {/* Shipped */}
                {itemsByStatus.shipped && itemsByStatus.shipped.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-[#211f1a] mb-4 flex items-center gap-2">
                      <span>✅</span>
                      {t("status.shipped")}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {itemsByStatus.shipped.map((item) => (
                        <RoadmapItemCard key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* If status filter is active, show all items in a grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => (
                  <RoadmapItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

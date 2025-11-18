/**
 * Roadmap Admin List Component
 *
 * Displays all roadmap items for admin management
 */

"use client";

import {
  ArrowUp01Icon,
  Delete01Icon,
  Edit01Icon,
  Loading03Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { confirm } from "@/lib/toast";
import type { RoadmapItem, RoadmapListResponse, RoadmapVisibility } from "@/types/roadmap";
import { ROADMAP_CATEGORY_CONFIG, ROADMAP_STATUS_CONFIG } from "@/types/roadmap";

export function RoadmapAdminList() {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<RoadmapVisibility | "all">("all");

  const fetchRoadmapItems = useCallback(async () => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams();

      if (activeFilter !== "all") {
        params.append("visibility", activeFilter);
      }

      const response = await fetch(`/api/admin/roadmap/list?${params.toString()}`);

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
  }, [activeFilter]);

  useEffect(() => {
    fetchRoadmapItems();
  }, [fetchRoadmapItems]);

  const handleDelete = async (id: string, title: string) => {
    const confirmed = await confirm(
      `Are you sure you want to archive "${title}"?`,
      "Archive Roadmap Item"
    );
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/roadmap/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete roadmap item");
      }

      // Refresh list
      fetchRoadmapItems();
      toast.success("Roadmap item archived successfully");
    } catch (error) {
      console.error("Error deleting roadmap item:", error);
      toast.error("Failed to delete roadmap item");
    }
  };

  const getStatusBadge = (visibility: RoadmapVisibility) => {
    const colors = {
      draft: "bg-neutral-100 text-neutral-700 border-neutral-200",
      published: "bg-green-100 text-green-700 border-green-200",
      archived: "bg-amber-100 text-amber-700 border-amber-200",
    };

    return (
      <span className={`border px-2 py-1 font-medium text-xs ${colors[visibility]}`}>
        {visibility.charAt(0).toUpperCase() + visibility.slice(1)}
      </span>
    );
  };

  const filterCounts = {
    all: items.length,
    draft: items.filter((i) => i.visibility === "draft").length,
    published: items.filter((i) => i.visibility === "published").length,
    archived: items.filter((i) => i.visibility === "archived").length,
  };

  return (
    <div className="space-y-6">
      {/* Filter tabs */}
      <div className="flex items-center gap-2 border-neutral-200 border-b">
        {(["all", "draft", "published", "archived"] as const).map((filter) => (
          <button
            className={`border-b-2 px-4 py-3 font-medium text-sm transition-colors ${
              activeFilter === filter
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-neutral-600 hover:border-orange-500 hover:text-orange-600"
            }`}
            key={filter}
            onClick={() => setActiveFilter(filter)}
            type="button"
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
            <span className="ml-2 bg-neutral-100 px-2 py-0.5 text-xs">{filterCounts[filter]}</span>
          </button>
        ))}
      </div>

      {/* Items list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <HugeiconsIcon className="h-8 w-8 animate-spin text-orange-500" icon={Loading03Icon} />
        </div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center bg-neutral-100">
            <span className="text-3xl">📋</span>
          </div>
          <h3 className="mb-2 font-semibold text-lg text-neutral-900">No roadmap items</h3>
          <p className="mb-4 text-neutral-600">Get started by creating your first roadmap item</p>
          <Link
            className="inline-flex items-center gap-2 bg-orange-500 px-6 py-3 font-medium text-white transition-all hover:bg-orange-600"
            href="/admin/roadmap/new"
          >
            Create Roadmap Item
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const statusConfig = ROADMAP_STATUS_CONFIG[item.status];
            const categoryConfig = ROADMAP_CATEGORY_CONFIG[item.category];

            return (
              <div
                className="border border-neutral-200 bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all hover:border-neutral-300 hover:shadow-md"
                key={item.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="font-semibold text-lg text-neutral-900">{item.title}</h3>
                      {getStatusBadge(item.visibility)}
                    </div>

                    <div className="mb-3 flex items-center gap-3">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 font-medium text-xs"
                        style={{
                          backgroundColor: statusConfig.bgColor,
                          color: statusConfig.color,
                        }}
                      >
                        <span>{statusConfig.icon}</span>
                        <span>{statusConfig.label}</span>
                      </span>

                      <span className="inline-flex items-center gap-1 bg-neutral-100 px-2 py-1 font-medium text-neutral-600 text-xs">
                        <span>{categoryConfig.icon}</span>
                        <span>{categoryConfig.label}</span>
                      </span>

                      {item.target_quarter && (
                        <span className="text-neutral-600 text-xs">{item.target_quarter}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-neutral-600 text-sm">
                      <div className="flex items-center gap-1.5">
                        <HugeiconsIcon icon={ArrowUp01Icon} size={16} />
                        <span>{item.vote_count} votes</span>
                      </div>

                      <div className="text-xs">
                        Created {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {item.visibility === "published" && (
                      <Link
                        className="p-2 transition-colors hover:bg-neutral-50"
                        href={`/roadmap/${item.slug}`}
                        target="_blank"
                        title="Preview"
                      >
                        <HugeiconsIcon className="text-neutral-600" icon={ViewIcon} size={18} />
                      </Link>
                    )}

                    <Link
                      className="p-2 transition-colors hover:bg-neutral-50"
                      href={`/admin/roadmap/${item.id}/edit`}
                      title="Edit"
                    >
                      <HugeiconsIcon className="text-neutral-600" icon={Edit01Icon} size={18} />
                    </Link>

                    <button
                      className="p-2 transition-colors hover:bg-red-50"
                      onClick={() => handleDelete(item.id, item.title)}
                      title="Archive"
                      type="button"
                    >
                      <HugeiconsIcon className="text-red-600" icon={Delete01Icon} size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

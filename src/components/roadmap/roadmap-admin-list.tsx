/**
 * Roadmap Admin List Component
 *
 * Displays all roadmap items for admin management
 */

"use client";

import { ChevronUp, Edit, Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { RoadmapItem, RoadmapListResponse, RoadmapVisibility } from "@/types/roadmap";
import { ROADMAP_CATEGORY_CONFIG, ROADMAP_STATUS_CONFIG } from "@/types/roadmap";

export function RoadmapAdminList() {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<RoadmapVisibility | "all">("all");

  useEffect(() => {
    fetchRoadmapItems();
  }, [activeFilter]);

  const fetchRoadmapItems = async () => {
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
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to archive "${title}"?`)) {
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
    } catch (error) {
      console.error("Error deleting roadmap item:", error);
      alert("Failed to delete roadmap item");
    }
  };

  const getStatusBadge = (visibility: RoadmapVisibility) => {
    const colors = {
      draft: "bg-gray-100 text-gray-700 border-gray-300",
      published: "bg-green-100 text-green-700 border-green-300",
      archived: "bg-red-100 text-red-700 border-red-300",
    };

    return (
      <span className={`rounded-lg border px-2 py-1 font-medium text-xs ${colors[visibility]}`}>
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
      <div className="flex items-center gap-2 border-[#ebe5d8] border-b">
        {(["all", "draft", "published", "archived"] as const).map((filter) => (
          <button
            className={`border-b-2 px-4 py-3 font-medium text-sm transition-colors ${
              activeFilter === filter
                ? "border-[#8B7355] text-[#8B7355]"
                : "border-transparent text-[#6B7280] hover:text-[#211f1a]"
            }`}
            key={filter}
            onClick={() => setActiveFilter(filter)}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
            <span className="ml-2 rounded-full bg-[#f3f4f6] px-2 py-0.5 text-xs">
              {filterCounts[filter]}
            </span>
          </button>
        ))}
      </div>

      {/* Items list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#8B7355] border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f3f4f6]">
            <span className="text-3xl">📋</span>
          </div>
          <h3 className="mb-2 font-semibold text-[#211f1a] text-lg">No roadmap items</h3>
          <p className="mb-4 text-[#6B7280]">Get started by creating your first roadmap item</p>
          <Link
            className="inline-flex items-center gap-2 rounded-[12px] bg-[#8B7355] px-6 py-3 font-medium text-white transition-all hover:bg-[#8B7355]"
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
                className="rounded-[20px] border-2 border-[#ebe5d8] bg-white p-6 transition-all hover:border-[#8B7355]"
                key={item.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="font-semibold text-[#211f1a] text-lg">{item.title}</h3>
                      {getStatusBadge(item.visibility)}
                    </div>

                    <div className="mb-3 flex items-center gap-3">
                      <span
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-xs"
                        style={{
                          backgroundColor: statusConfig.bgColor,
                          color: statusConfig.color,
                        }}
                      >
                        <span>{statusConfig.icon}</span>
                        <span>{statusConfig.label}</span>
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-lg bg-[#f3f4f6] px-2 py-1 font-medium text-[#6B7280] text-xs">
                        <span>{categoryConfig.icon}</span>
                        <span>{categoryConfig.label}</span>
                      </span>

                      {item.target_quarter && (
                        <span className="text-[#6B7280] text-xs">{item.target_quarter}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-[#6B7280] text-sm">
                      <div className="flex items-center gap-1.5">
                        <ChevronUp size={16} />
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
                        className="rounded-lg p-2 transition-colors hover:bg-[#f3f4f6]"
                        href={`/roadmap/${item.slug}`}
                        target="_blank"
                        title="Preview"
                      >
                        <Eye className="text-[#6B7280]" size={18} />
                      </Link>
                    )}

                    <Link
                      className="rounded-lg p-2 transition-colors hover:bg-[#f3f4f6]"
                      href={`/admin/roadmap/${item.id}/edit`}
                      title="Edit"
                    >
                      <Edit className="text-[#6B7280]" size={18} />
                    </Link>

                    <button
                      className="rounded-lg p-2 transition-colors hover:bg-red-50"
                      onClick={() => handleDelete(item.id, item.title)}
                      title="Archive"
                    >
                      <Trash2 className="text-red-600" size={18} />
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

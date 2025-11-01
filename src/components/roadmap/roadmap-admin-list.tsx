/**
 * Roadmap Admin List Component
 *
 * Displays all roadmap items for admin management
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Edit, Eye, Trash2, ChevronUp } from "lucide-react";
import type { RoadmapItem, RoadmapVisibility, RoadmapListResponse } from "@/types/roadmap";
import { ROADMAP_STATUS_CONFIG, ROADMAP_CATEGORY_CONFIG } from "@/types/roadmap";

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
      <span
        className={`px-2 py-1 text-xs font-medium rounded-lg border ${colors[visibility]}`}
      >
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
      <div className="flex items-center gap-2 border-b border-[#ebe5d8]">
        {(["all", "draft", "published", "archived"] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeFilter === filter
                ? "border-[#ff5d46] text-[#ff5d46]"
                : "border-transparent text-[#6B7280] hover:text-[#211f1a]"
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
            <span className="ml-2 px-2 py-0.5 bg-[#f3f4f6] rounded-full text-xs">
              {filterCounts[filter]}
            </span>
          </button>
        ))}
      </div>

      {/* Items list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#ff5d46] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#f3f4f6] rounded-full flex items-center justify-center">
            <span className="text-3xl">📋</span>
          </div>
          <h3 className="text-lg font-semibold text-[#211f1a] mb-2">No roadmap items</h3>
          <p className="text-[#6B7280] mb-4">Get started by creating your first roadmap item</p>
          <Link
            href="/admin/roadmap/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff5d46] text-white rounded-[12px] font-medium hover:bg-[#e54d36] transition-all"
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
                key={item.id}
                className="p-6 bg-white border-2 border-[#ebe5d8] rounded-[20px] hover:border-[#ff5d46] transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-[#211f1a]">{item.title}</h3>
                      {getStatusBadge(item.visibility)}
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg"
                        style={{
                          backgroundColor: statusConfig.bgColor,
                          color: statusConfig.color,
                        }}
                      >
                        <span>{statusConfig.icon}</span>
                        <span>{statusConfig.label}</span>
                      </span>

                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg bg-[#f3f4f6] text-[#6B7280]">
                        <span>{categoryConfig.icon}</span>
                        <span>{categoryConfig.label}</span>
                      </span>

                      {item.target_quarter && (
                        <span className="text-xs text-[#6B7280]">{item.target_quarter}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-[#6B7280]">
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
                        href={`/roadmap/${item.slug}`}
                        target="_blank"
                        className="p-2 hover:bg-[#f3f4f6] rounded-lg transition-colors"
                        title="Preview"
                      >
                        <Eye size={18} className="text-[#6B7280]" />
                      </Link>
                    )}

                    <Link
                      href={`/admin/roadmap/${item.id}/edit`}
                      className="p-2 hover:bg-[#f3f4f6] rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={18} className="text-[#6B7280]" />
                    </Link>

                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Archive"
                    >
                      <Trash2 size={18} className="text-red-600" />
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

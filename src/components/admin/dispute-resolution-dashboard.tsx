"use client";

import { FilterIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useState } from "react";
import { type Dispute, DisputesTable } from "./disputes-table";

type DisputeListResponse = {
  disputes: Dispute[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export function DisputeResolutionDashboard() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const loadDisputes = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (priorityFilter !== "all") {
        params.append("priority", priorityFilter);
      }
      if (search) {
        params.append("search", search);
      }

      const response = await fetch(`/api/admin/disputes?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch disputes");
      }

      const data: DisputeListResponse = await response.json();
      setDisputes(data.disputes);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error loading disputes:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter, priorityFilter, search]);

  useEffect(() => {
    loadDisputes();
  }, [loadDisputes]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const activeFiltersCount = (statusFilter !== "all" ? 1 : 0) + (priorityFilter !== "all" ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <HugeiconsIcon
            className="-tranneutral-y-1/2 absolute top-1/2 left-4 h-5 w-5 text-[#A3A3A3]"
            icon={Search01Icon}
          />
          <input
            className="w-full rounded-lg border border-[#E5E5E5] bg-white py-3 pr-4 pl-12 text-[#171717] placeholder:text-[#A3A3A3] focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]"
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search disputes..."
            type="text"
            value={search}
          />
        </div>

        {/* Filter Toggle Button */}
        <button
          className="flex items-center gap-2 rounded-lg border border-[#E5E5E5] bg-white px-4 py-2 font-medium text-[#171717] text-sm transition-colors hover:bg-[#F5F5F5]"
          onClick={() => setShowFilters(!showFilters)}
        >
          <HugeiconsIcon className="h-4 w-4" icon={FilterIcon} />
          Filters
          {activeFiltersCount > 0 && (
            <span className="ml-1 rounded-full bg-[#E85D48] px-2 py-0.5 font-semibold text-white text-xs">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Filters Panel */}
        {showFilters && (
          <div className="rounded-lg border border-[#E5E5E5] bg-white p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Status Filter */}
              <div>
                <label className="mb-2 block font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
                  Status
                </label>
                <select
                  className="w-full rounded-lg border border-[#E5E5E5] bg-white px-4 py-2.5 text-[#171717] focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]"
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  value={statusFilter}
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="mb-2 block font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
                  Priority
                </label>
                <select
                  className="w-full rounded-lg border border-[#E5E5E5] bg-white px-4 py-2.5 text-[#171717] focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]"
                  onChange={(e) => {
                    setPriorityFilter(e.target.value);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  value={priorityFilter}
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <div className="mt-4 border-[#E5E5E5] border-t pt-4">
                <button
                  className="font-medium text-[#E85D48] text-sm transition-colors hover:text-[#D32F40]"
                  onClick={() => {
                    setStatusFilter("all");
                    setPriorityFilter("all");
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <DisputesTable
        disputes={disputes}
        isLoading={isLoading}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
        pagination={pagination}
      />
    </div>
  );
}

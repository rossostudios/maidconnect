"use client";

import { FilterIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useState } from "react";
import { AuditLogsTable } from "./AuditLogsTable";

type AuditLog = {
  id: string;
  action_type: string;
  details: any;
  notes: string | null;
  created_at: string;
  admin: { full_name: string | null };
  target_user: { full_name: string | null; email: string } | null;
};

type AuditLogListResponse = {
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export function AuditLogsDashboard() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (actionFilter !== "all") {
        params.append("actionType", actionFilter);
      }
      if (search) {
        params.append("search", search);
      }

      const response = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch audit logs");
      }

      const data: AuditLogListResponse = await response.json();
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error loading audit logs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, actionFilter, search]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const activeFiltersCount = actionFilter !== "all" ? 1 : 0;

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
            className="w-full border border-[#E5E5E5] bg-white py-3 pr-4 pl-12 text-[#171717] placeholder:text-[#A3A3A3] focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]"
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by admin name, target user, or notes..."
            type="text"
            value={search}
          />
        </div>

        {/* Filter Toggle Button */}
        <button
          className="flex items-center gap-2 border border-[#E5E5E5] bg-white px-4 py-2 font-medium text-[#171717] text-sm transition-colors hover:bg-[#F5F5F5]"
          onClick={() => setShowFilters(!showFilters)}
          type="button"
        >
          <HugeiconsIcon className="h-4 w-4" icon={FilterIcon} />
          Filters
          {activeFiltersCount > 0 && (
            <span className="-full ml-1 bg-[#E85D48] px-2 py-0.5 font-semibold text-white text-xs">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border border-[#E5E5E5] bg-white p-6">
            <div className="grid grid-cols-1 gap-4">
              {/* Action Type Filter */}
              <div>
                <label
                  className="mb-2 block font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider"
                  htmlFor="audit-action-filter"
                >
                  Action Type
                </label>
                <select
                  className="w-full border border-[#E5E5E5] bg-white px-4 py-2.5 text-[#171717] focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]"
                  id="audit-action-filter"
                  onChange={(e) => {
                    setActionFilter(e.target.value);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  value={actionFilter}
                >
                  <option value="all">All Actions</option>
                  <option value="approve_professional">Approve Professional</option>
                  <option value="reject_professional">Reject Professional</option>
                  <option value="suspend_user">Suspend User</option>
                  <option value="unsuspend_user">Unsuspend User</option>
                  <option value="ban_user">Ban User</option>
                  <option value="unban_user">Unban User</option>
                  <option value="resolve_dispute">Resolve Dispute</option>
                  <option value="update_pricing">Update Pricing</option>
                  <option value="update_user_role">Update User Role</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <div className="mt-4 border-[#E5E5E5] border-t pt-4">
                <button
                  className="font-medium text-[#E85D48] text-sm transition-colors hover:text-[#D32F40]"
                  onClick={() => {
                    setActionFilter("all");
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  type="button"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <AuditLogsTable
        isLoading={isLoading}
        logs={logs}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
        pagination={pagination}
      />
    </div>
  );
}

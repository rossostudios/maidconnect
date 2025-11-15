"use client";

import { FilterIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useState } from "react";
import { UserManagementTable } from "./User";

type UserRole = "customer" | "professional" | "admin";
type SuspensionFilter = "all" | "active" | "suspended" | "banned";

type UserSuspension = {
  type: "temporary" | "permanent";
  reason: string;
  expires_at: string | null;
};

export type User = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  avatar_url: string | null;
  city: string | null;
  created_at: string;
  suspension: UserSuspension | null;
};

type UserListResponse = {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export function UserManagementDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [suspensionFilter, setSuspensionFilter] = useState<SuspensionFilter>("all");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (roleFilter !== "all") {
        params.append("role", roleFilter);
      }
      if (suspensionFilter !== "all") {
        params.append("suspensionFilter", suspensionFilter);
      }
      if (search) {
        params.append("search", search);
      }

      const url = `/api/admin/users?${params.toString()}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data: UserListResponse = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, roleFilter, suspensionFilter, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const activeFiltersCount = (roleFilter !== "all" ? 1 : 0) + (suspensionFilter !== "all" ? 1 : 0);

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
            placeholder="Search by name or email..."
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Role Filter */}
              <div>
                <label
                  className="mb-2 block font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider"
                  htmlFor="user-role-filter"
                >
                  Role
                </label>
                <select
                  className="w-full border border-[#E5E5E5] bg-white px-4 py-2.5 text-[#171717] focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]"
                  id="user-role-filter"
                  onChange={(e) => {
                    setRoleFilter(e.target.value as UserRole | "all");
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  value={roleFilter}
                >
                  <option value="all">All Roles</option>
                  <option value="customer">Customer</option>
                  <option value="professional">Professional</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label
                  className="mb-2 block font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider"
                  htmlFor="user-status-filter"
                >
                  Account Status
                </label>
                <select
                  className="w-full border border-[#E5E5E5] bg-white px-4 py-2.5 text-[#171717] focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]"
                  id="user-status-filter"
                  onChange={(e) => {
                    setSuspensionFilter(e.target.value as SuspensionFilter);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  value={suspensionFilter}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="suspended">Suspended</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <div className="mt-4 border-[#E5E5E5] border-t pt-4">
                <button
                  className="font-medium text-[#E85D48] text-sm transition-colors hover:text-[#D32F40]"
                  onClick={() => {
                    setRoleFilter("all");
                    setSuspensionFilter("all");
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
      <UserManagementTable
        isLoading={isLoading}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
        pagination={pagination}
        users={users}
      />
    </div>
  );
}

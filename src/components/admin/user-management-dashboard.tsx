"use client";

import { useEffect, useState } from "react";
import { useAdminCountryFilter } from "@/lib/contexts/AdminCountryFilterContext";
import type { User } from "./user-management-table";
import { UserManagementTable } from "./user-management-table";

/**
 * UserManagementDashboard - Main user management interface with Lia design
 *
 * Features:
 * - Fetches all users once for instant client-side filtering
 * - PrecisionDataTable handles search, filtering, sorting, pagination
 * - URL state synchronization for shareable links
 * - Export to CSV/JSON
 * - Column visibility control
 *
 * Performance: Client-side filtering is optimal for admin dashboards with <10k users.
 * For larger datasets, consider implementing server-side pagination.
 */
export function UserManagementDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { selectedCountry } = useAdminCountryFilter();

  useEffect(() => {
    async function loadUsers() {
      setIsLoading(true);
      try {
        // Fetch users with country filter
        const params = new URLSearchParams({
          limit: "10000",
          country: selectedCountry,
        });

        const response = await fetch(`/api/admin/users?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        setUsers(data.users || []);
      } catch (error) {
        console.error("Error loading users:", error);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadUsers();
  }, [selectedCountry]); // Reload when country filter changes

  return <UserManagementTable isLoading={isLoading} users={users} />;
}

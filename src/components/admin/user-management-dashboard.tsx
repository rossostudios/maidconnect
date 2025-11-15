"use client";

import { useEffect, useState } from "react";
import type { User } from "./user-management-table";
import { UserManagementTable } from "./user-management-table";

/**
 * UserManagementDashboard - Main user management interface with Precision design
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

  useEffect(() => {
    async function loadUsers() {
      setIsLoading(true);
      try {
        // Fetch all users (no pagination - client-side filtering is faster for admin UX)
        const response = await fetch("/api/admin/users?limit=10000");
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
  }, []);

  return <UserManagementTable isLoading={isLoading} users={users} />;
}

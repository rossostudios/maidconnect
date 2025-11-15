"use client";

import { useEffect, useState } from "react";
import { type Dispute, DisputesTable } from "./disputes-table";

/**
 * DisputeResolutionDashboard - Main dispute management interface with Lia design
 *
 * Features:
 * - Fetches all disputes once for instant client-side filtering
 * - PrecisionDataTable handles search, filtering, sorting, pagination
 * - URL state synchronization for shareable links
 * - Export to CSV/JSON
 * - Column visibility control
 *
 * Performance: Client-side filtering is optimal for admin dashboards with <10k disputes.
 * For larger datasets, consider implementing server-side pagination.
 */
export function DisputeResolutionDashboard() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDisputes() {
      setIsLoading(true);
      try {
        // Fetch all disputes (no pagination - client-side filtering is faster for admin UX)
        const response = await fetch("/api/admin/disputes?limit=10000");
        if (!response.ok) {
          throw new Error("Failed to fetch disputes");
        }

        const data = await response.json();
        setDisputes(data.disputes || []);
      } catch (error) {
        console.error("Error loading disputes:", error);
        setDisputes([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadDisputes();
  }, []);

  return <DisputesTable disputes={disputes} isLoading={isLoading} />;
}

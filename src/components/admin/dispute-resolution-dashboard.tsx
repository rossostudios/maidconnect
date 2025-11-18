"use client";

import { useEffect, useState } from "react";
import { useRealtimeDisputes } from "@/hooks/useRealtimeDisputes";
import { type Dispute, DisputesTable } from "./disputes-table";

/**
 * DisputeResolutionDashboard - Main dispute management interface with Lia design
 *
 * Features:
 * - Real-time dispute updates via Supabase Realtime (PostgreSQL CDC)
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
  const [initialDisputes, setInitialDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial dispute data
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
        setInitialDisputes(data.disputes || []);
      } catch (error) {
        console.error("Error loading disputes:", error);
        setInitialDisputes([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadDisputes();
  }, []);

  // Real-time subscription for live dispute updates
  const { disputes, isConnected, addOptimisticDispute, updateOptimisticDispute } =
    useRealtimeDisputes({
      initialDisputes,
      enabled: !isLoading, // Only enable after initial data is loaded
    });

  return (
    <DisputesTable
      addOptimisticDispute={addOptimisticDispute}
      disputes={disputes}
      isConnected={isConnected}
      isLoading={isLoading}
      updateOptimisticDispute={updateOptimisticDispute}
    />
  );
}

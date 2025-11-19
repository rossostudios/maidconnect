"use client";

import { useEffect, useState } from "react";
import { useRealtimeAdminModeration } from "@/hooks/use-realtime-admin-moderation";
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

  // Real-time subscription for live dispute updates using multiplexed hook
  // Note: This uses the new multiplexed admin moderation hook which combines
  // disputes, professional reviews, and moderation flags into a single channel
  const { disputes, isConnected, updateOptimisticDispute } = useRealtimeAdminModeration({
    enabled: !isLoading, // Only enable after initial data is loaded
  });

  // Merge initial fetched disputes with real-time disputes
  // Use real-time disputes if available (they contain the latest updates)
  const displayDisputes = disputes.length > 0 ? disputes : initialDisputes;

  return (
    <DisputesTable
      disputes={displayDisputes}
      isConnected={isConnected}
      isLoading={isLoading}
      updateOptimisticDispute={updateOptimisticDispute}
    />
  );
}

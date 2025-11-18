"use client";

/**
 * useRealtimeDisputes Hook
 *
 * Subscribes to real-time updates for dispute management via Supabase Realtime.
 * Uses PostgreSQL CDC (Change Data Capture) - NOT manual WebSocket management.
 *
 * Features:
 * - Live updates when disputes are created/updated/resolved
 * - Optional filtering by status (pending, in_progress, resolved)
 * - Optimistic UI support with merge strategy
 * - Automatic reconnection handling
 */

import type { RealtimeChannel } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import {
  CHANNEL_CONFIGS,
  type DisputePayload,
  isDeleteEvent,
  isInsertEvent,
  isUpdateEvent,
} from "@/lib/realtime/admin-channels";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export interface Dispute {
  id: string;
  booking_id: string;
  filed_by: string;
  respondent_id: string;
  dispute_type: string;
  status: "pending" | "in_progress" | "resolved" | "escalated";
  priority: "low" | "medium" | "high" | "urgent";
  description: string;
  resolution: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

interface UseRealtimeDisputesOptions {
  initialDisputes?: Dispute[];
  filterByStatus?: string;
  enabled?: boolean;
}

interface UseRealtimeDisputesReturn {
  disputes: Dispute[];
  isConnected: boolean;
  error: Error | null;
  addOptimisticDispute: (dispute: Dispute) => void;
  updateOptimisticDispute: (id: string, updates: Partial<Dispute>) => void;
}

/**
 * Hook to subscribe to real-time dispute updates
 *
 * @example
 * ```tsx
 * const { disputes, isConnected, updateOptimisticDispute } = useRealtimeDisputes({
 *   initialDisputes: serverData,
 *   filterByStatus: 'pending',
 *   enabled: true
 * });
 *
 * // Optimistic UI update
 * updateOptimisticDispute('dispute-123', { status: 'in_progress' });
 * await assignDisputeAction('dispute-123', adminId);
 * ```
 */
export function useRealtimeDisputes({
  initialDisputes = [],
  filterByStatus,
  enabled = true,
}: UseRealtimeDisputesOptions = {}): UseRealtimeDisputesReturn {
  const [disputes, setDisputes] = useState<Dispute[]>(initialDisputes);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Optimistic UI: Add a dispute immediately
  const addOptimisticDispute = useCallback((dispute: Dispute) => {
    setDisputes((prev) => [dispute, ...prev]);
  }, []);

  // Optimistic UI: Update a dispute immediately
  const updateOptimisticDispute = useCallback((id: string, updates: Partial<Dispute>) => {
    setDisputes((prev) =>
      prev.map((dispute) =>
        dispute.id === id
          ? { ...dispute, ...updates, updated_at: new Date().toISOString() }
          : dispute
      )
    );
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    let channel: RealtimeChannel | null = null;

    const setupSubscription = async () => {
      try {
        const config = filterByStatus
          ? CHANNEL_CONFIGS.disputesByStatus(filterByStatus)
          : CHANNEL_CONFIGS.disputes();

        channel = supabase
          .channel(config.channelName)
          .on(
            "postgres_changes",
            {
              event: config.event,
              schema: config.schema || "public",
              table: config.table,
              filter: config.filter,
            },
            (payload: DisputePayload) => {
              handleRealtimeUpdate(payload);
            }
          )
          .subscribe((status) => {
            if (status === "SUBSCRIBED") {
              setIsConnected(true);
              setError(null);
            } else if (status === "CHANNEL_ERROR") {
              setIsConnected(false);
              setError(new Error("Failed to subscribe to real-time dispute updates"));
            } else if (status === "TIMED_OUT") {
              setIsConnected(false);
              setError(new Error("Dispute subscription timed out"));
            }
          });
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setIsConnected(false);
      }
    };

    const handleRealtimeUpdate = (payload: DisputePayload) => {
      if (isInsertEvent(payload)) {
        // New dispute created
        const newDispute = payload.new as Dispute;
        setDisputes((prev) => {
          // Avoid duplicates (in case of optimistic update)
          if (prev.some((d) => d.id === newDispute.id)) {
            return prev.map((d) => (d.id === newDispute.id ? newDispute : d));
          }
          return [newDispute, ...prev];
        });
      } else if (isUpdateEvent(payload)) {
        // Dispute updated (status change, assignment, resolution, etc.)
        const updatedDispute = payload.new as Dispute;
        setDisputes((prev) =>
          prev.map((dispute) => (dispute.id === updatedDispute.id ? updatedDispute : dispute))
        );
      } else if (isDeleteEvent(payload)) {
        // Dispute deleted (rare, but handle it)
        const deletedDispute = payload.old as Dispute;
        setDisputes((prev) => prev.filter((dispute) => dispute.id !== deletedDispute.id));
      }
    };

    setupSubscription();

    // Cleanup function - unsubscribe when component unmounts or filter changes
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
        setIsConnected(false);
      }
    };
  }, [enabled, filterByStatus]);

  // Sync initial disputes when they change
  useEffect(() => {
    setDisputes(initialDisputes);
  }, [initialDisputes]);

  return {
    disputes,
    isConnected,
    error,
    addOptimisticDispute,
    updateOptimisticDispute,
  };
}

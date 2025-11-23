"use client";

/**
 * useRealtimeUserStatus Hook
 *
 * Subscribes to real-time updates for user suspension status via Supabase Realtime.
 * Uses PostgreSQL CDC (Change Data Capture) - NOT manual WebSocket management.
 *
 * Features:
 * - Live updates when suspensions are created/lifted/modified
 * - Automatic reconnection handling
 * - Type-safe payload handling
 * - Cleanup on unmount
 */

import { useEffect, useState } from "react";
import { getConnectionManager } from "@/lib/integrations/supabase/realtime-connection-manager";
import {
  CHANNEL_CONFIGS,
  isDeleteEvent,
  isInsertEvent,
  isUpdateEvent,
  type UserSuspensionPayload,
} from "@/lib/realtime/admin-channels";

export type UserSuspension = {
  id: string;
  user_id: string;
  suspension_type: "temporary" | "permanent";
  reason: string;
  suspended_at: string;
  expires_at: string | null;
  is_active: boolean;
  suspended_by?: {
    full_name: string | null;
  };
};

type UseRealtimeUserStatusOptions = {
  userId: string;
  initialSuspension?: UserSuspension | null;
  enabled?: boolean;
};

type UseRealtimeUserStatusReturn = {
  activeSuspension: UserSuspension | null;
  isConnected: boolean;
  error: Error | null;
};

/**
 * Hook to subscribe to real-time user suspension status updates
 *
 * @example
 * ```tsx
 * const { activeSuspension, isConnected } = useRealtimeUserStatus({
 *   userId: 'user-123',
 *   initialSuspension: serverData,
 *   enabled: true
 * });
 * ```
 */
export function useRealtimeUserStatus({
  userId,
  initialSuspension = null,
  enabled = true,
}: UseRealtimeUserStatusOptions): UseRealtimeUserStatusReturn {
  const [activeSuspension, setActiveSuspension] = useState<UserSuspension | null>(
    initialSuspension
  );
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!(enabled && userId)) {
      return;
    }

    const manager = getConnectionManager();

    const handleRealtimeUpdate = (payload: UserSuspensionPayload) => {
      if (isInsertEvent(payload)) {
        // New suspension created
        const newSuspension = payload.new as UserSuspension;
        if (newSuspension.is_active) {
          setActiveSuspension(newSuspension);
        }
      } else if (isUpdateEvent(payload)) {
        // Suspension updated (e.g., lifted or modified)
        const updatedSuspension = payload.new as UserSuspension;
        if (updatedSuspension.is_active) {
          setActiveSuspension(updatedSuspension);
        } else {
          // Suspension was lifted
          setActiveSuspension(null);
        }
      } else if (isDeleteEvent(payload)) {
        // Suspension deleted
        const deletedSuspension = payload.old as UserSuspension;
        if (activeSuspension?.id === deletedSuspension.id) {
          setActiveSuspension(null);
        }
      }
    };

    try {
      const config = CHANNEL_CONFIGS.userSuspensionsByUser(userId);

      const subscription = manager.createSubscription(config.channelName, (channel) =>
        channel.on(
          "postgres_changes",
          {
            event: config.event,
            schema: config.schema || "public",
            table: config.table,
            filter: config.filter,
          },
          (payload: UserSuspensionPayload) => {
            handleRealtimeUpdate(payload);
          }
        )
      );

      // Monitor connection state
      const unsubscribeHealth = manager.onConnectionChange((health) => {
        setIsConnected(health.state === "connected");
        if (health.errors.length > 0) {
          setError(new Error(health.errors.at(-1) || "Unknown error"));
        } else {
          setError(null);
        }
      });

      // Cleanup function - unsubscribe when component unmounts
      return () => {
        subscription.unsubscribe();
        unsubscribeHealth();
      };
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setIsConnected(false);
    }
  }, [userId, enabled, activeSuspension?.id]);

  // Sync initial suspension when it changes
  useEffect(() => {
    setActiveSuspension(initialSuspension);
  }, [initialSuspension]);

  return {
    activeSuspension,
    isConnected,
    error,
  };
}

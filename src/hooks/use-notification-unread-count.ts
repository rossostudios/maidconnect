"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Hook to fetch and track unread notification count using Supabase Realtime
 * Provides instant updates when notifications are added or read
 */
export function useNotificationUnreadCount() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications/unread-count");

      if (!response.ok) {
        throw new Error("Failed to fetch unread count");
      }

      const data = await response.json();
      setUnreadCount(data.unreadCount || 0);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount (no polling - using Realtime instead)
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Subscribe to real-time updates on notifications table
  useEffect(() => {
    // Import supabase client dynamically to avoid SSR issues
    import("@/lib/supabase/browser-client").then(({ createSupabaseBrowserClient }) => {
      const supabase = createSupabaseBrowserClient();

      const channel = supabase
        .channel("notification-unread-count-updates")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
          },
          () => {
            // Refresh count when notifications change
            fetchUnreadCount();
          }
        )
        .subscribe((status) => {
          console.log("[Realtime] Notification unread count subscription status:", status);
        });

      // Cleanup function
      return () => {
        console.log("[Realtime] Unsubscribing from notification unread count updates");
        supabase.removeChannel(channel);
      };
    });
  }, [fetchUnreadCount]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  return {
    unreadCount,
    isLoading,
    error,
    refresh,
  };
}

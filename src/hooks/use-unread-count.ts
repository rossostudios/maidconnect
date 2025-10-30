"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Hook to fetch and track unread message count using Supabase Realtime
 * Provides instant updates when conversations or messages change
 */
export function useUnreadCount() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch("/api/messages/unread-count");

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

  // Subscribe to real-time updates
  useEffect(() => {
    // Import supabase client dynamically to avoid SSR issues
    import("@/lib/supabase/browser-client").then(({ createSupabaseBrowserClient }) => {
      const supabase = createSupabaseBrowserClient();

      const channel = supabase
        .channel("unread-count-updates")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "conversations",
          },
          () => {
            // Refresh count when any conversation changes
            fetchUnreadCount();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
          },
          () => {
            // Refresh count when new messages arrive
            fetchUnreadCount();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "messages",
          },
          () => {
            // Refresh count when messages are marked as read
            fetchUnreadCount();
          }
        )
        .subscribe((status) => {
          console.log("[Realtime] Unread count subscription status:", status);
        });

      // Cleanup function
      return () => {
        console.log("[Realtime] Unsubscribing from unread count updates");
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

"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

/**
 * Hook to fetch and track unread notification count using TanStack Query + Supabase Realtime
 *
 * Benefits over previous implementation:
 * - Shared cache across all components (no duplicate requests)
 * - Automatic request deduplication
 * - Configurable staleTime prevents excessive refetching
 * - React 19 optimized (no unnecessary memoization)
 */
export function useNotificationUnreadCount() {
  const queryClient = useQueryClient();

  // Fetch unread count with TanStack Query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const response = await fetch("/api/notifications/unread-count");

      if (!response.ok) {
        throw new Error("Failed to fetch unread count");
      }

      const responseData = await response.json();
      return responseData.unreadCount || 0;
    },
    // Consider data stale after 30 seconds
    staleTime: 30 * 1000,
    // Refetch every minute in the background
    refetchInterval: 60 * 1000,
    // Don't refetch on window focus (too aggressive for unread counts)
    refetchOnWindowFocus: false,
  });

  // Subscribe to real-time updates (invalidate cache instead of direct fetch)
  useEffect(() => {
    // Import supabase client dynamically to avoid SSR issues
    import("@/lib/supabase/browserClient").then(({ createSupabaseBrowserClient }) => {
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
            // Invalidate cache to trigger refetch (shared across all components)
            queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
          }
        )
        .subscribe((status) => {
          // Subscribe callback required for Supabase Realtime - status changes are handled internally
          if (status === "CHANNEL_ERROR") {
            console.warn("Notification channel error");
          }
        });

      // Cleanup function
      return () => {
        supabase.removeChannel(channel);
      };
    });
  }, [queryClient]);

  return {
    unreadCount: data ?? 0,
    isLoading,
    error: error ? (error instanceof Error ? error.message : "Unknown error") : null,
    refresh: () => refetch(),
  };
}

"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

/**
 * Hook to fetch and track unread message count using TanStack Query + Supabase Realtime
 *
 * Benefits over previous implementation:
 * - Shared cache across all components (no duplicate requests)
 * - Automatic request deduplication
 * - Configurable staleTime prevents excessive refetching
 * - React 19 optimized (no unnecessary memoization)
 */
export function useUnreadCount() {
  const queryClient = useQueryClient();

  // Fetch unread count with TanStack Query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["messages", "unread-count"],
    queryFn: async () => {
      const response = await fetch("/api/messages/unread-count");

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
            // Invalidate cache to trigger refetch (shared across all components)
            queryClient.invalidateQueries({ queryKey: ["messages", "unread-count"] });
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
            queryClient.invalidateQueries({ queryKey: ["messages", "unread-count"] });
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
            queryClient.invalidateQueries({ queryKey: ["messages", "unread-count"] });
          }
        )
        .subscribe((status) => {
          // Subscribe callback required for Supabase Realtime - status changes are handled internally
          if (status === "CHANNEL_ERROR") {
            console.warn("Messages unread count channel error");
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

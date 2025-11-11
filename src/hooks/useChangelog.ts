"use client";

import { useQuery } from "@tanstack/react-query";

/**
 * Hook to track unread changelog count using TanStack Query
 *
 * Benefits over previous implementation:
 * - Shared cache across all components (no duplicate requests)
 * - Automatic request deduplication
 * - Longer staleTime since changelogs are infrequent (bi-weekly)
 * - React 19 optimized (no unnecessary memoization)
 */
export function useChangelogUnreadCount() {
  // Fetch unread count with TanStack Query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["changelog", "unread-count"],
    queryFn: async () => {
      // We'll use the latest changelog endpoint since we don't have
      // a dedicated unread count endpoint yet
      const response = await fetch("/api/changelog/latest");

      if (!response.ok) {
        throw new Error("Failed to fetch changelog status");
      }

      const responseData = await response.json();

      // If there's a changelog and it hasn't been viewed, count is 1
      // In the future, this could query all unread changelogs
      if (responseData.changelog && !responseData.hasViewed) {
        return 1;
      }

      return 0;
    },
    // Consider data stale after 5 minutes (changelogs are infrequent)
    staleTime: 5 * 60 * 1000,
    // Refetch every 10 minutes in the background
    refetchInterval: 10 * 60 * 1000,
    // Don't refetch on window focus (changelog status changes infrequently)
    refetchOnWindowFocus: false,
  });

  return {
    unreadCount: data ?? 0,
    isLoading,
    error: error ? (error instanceof Error ? error.message : "Unknown error") : null,
    refresh: () => refetch(),
  };
}

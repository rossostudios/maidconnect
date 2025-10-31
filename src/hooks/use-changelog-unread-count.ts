"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Hook to track unread changelog count
 * Uses the database function get_unread_changelog_count()
 *
 * Note: This is a simple polling implementation since changelogs
 * are updated infrequently (bi-weekly sprints). For more frequent
 * updates, consider adding Realtime subscriptions.
 */
export function useChangelogUnreadCount() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    try {
      // We'll use the latest changelog endpoint since we don't have
      // a dedicated unread count endpoint yet
      const response = await fetch("/api/changelog/latest");

      if (!response.ok) {
        throw new Error("Failed to fetch changelog status");
      }

      const data = await response.json();

      // If there's a changelog and it hasn't been viewed, count is 1
      // In the future, this could query all unread changelogs
      if (data.changelog && !data.hasViewed) {
        setUnreadCount(1);
      } else {
        setUnreadCount(0);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Poll every 5 minutes (changelogs are infrequent)
  useEffect(() => {
    const interval = setInterval(
      () => {
        fetchUnreadCount();
      },
      5 * 60 * 1000
    ); // 5 minutes

    return () => clearInterval(interval);
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

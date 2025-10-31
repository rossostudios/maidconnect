"use client";

import { useCallback, useEffect, useState } from "react";

type Changelog = {
  id: string;
  sprint_number: number;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  published_at: string;
  categories: string[];
  tags: string[];
  target_audience: string[];
  featured_image_url: string | null;
};

/**
 * Hook to fetch the latest published changelog entry
 * Returns the changelog and whether the user has viewed it
 */
export function useLatestChangelog() {
  const [changelog, setChangelog] = useState<Changelog | null>(null);
  const [hasViewed, setHasViewed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestChangelog = useCallback(async () => {
    try {
      const response = await fetch("/api/changelog/latest");

      if (!response.ok) {
        throw new Error("Failed to fetch latest changelog");
      }

      const data = await response.json();
      setChangelog(data.changelog || null);
      setHasViewed(data.hasViewed);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchLatestChangelog();
  }, [fetchLatestChangelog]);

  // Mark as read function
  const markAsRead = useCallback(async () => {
    if (!changelog) return;

    try {
      const response = await fetch("/api/changelog/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ changelogId: changelog.id }),
      });

      if (response.ok) {
        setHasViewed(true);
      }
    } catch (err) {
      console.error("Error marking changelog as read:", err);
    }
  }, [changelog]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchLatestChangelog();
  }, [fetchLatestChangelog]);

  return {
    changelog,
    hasViewed,
    isLoading,
    error,
    markAsRead,
    refresh,
  };
}

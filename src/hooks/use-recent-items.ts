/**
 * Recent Items Hook
 *
 * Tracks recently visited pages in localStorage for quick access in command palette.
 * Maintains a list of the last 8 items with deduplication and automatic cleanup.
 */

"use client";

import { useCallback, useEffect, useState } from "react";

export type RecentItem = {
  id: string;
  title: string;
  description?: string;
  url: string;
  timestamp: number;
  type: "navigation" | "search" | "page";
  icon?: unknown;
};

const STORAGE_KEY = "casaora-recent-items";
const MAX_ITEMS = 8;

/**
 * Custom hook for managing recent items in localStorage
 */
export function useRecentItems() {
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);

  // Load recent items from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as RecentItem[];
        // Filter out items older than 30 days
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const filtered = parsed.filter((item) => item.timestamp > thirtyDaysAgo);
        setRecentItems(filtered);
      }
    } catch (error) {
      console.error("Failed to load recent items:", error);
    }
  }, []);

  /**
   * Add a new item to recent items
   * Deduplicates by URL and maintains max items limit
   */
  const addRecentItem = useCallback((item: Omit<RecentItem, "timestamp">) => {
    setRecentItems((prev) => {
      // Remove duplicates (same URL)
      const filtered = prev.filter((existing) => existing.url !== item.url);

      // Add new item at the beginning
      const newItem: RecentItem = {
        ...item,
        timestamp: Date.now(),
      };

      const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);

      // Persist to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("Failed to save recent items:", error);
      }

      return updated;
    });
  }, []);

  /**
   * Clear all recent items
   */
  const clearRecentItems = useCallback(() => {
    setRecentItems([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear recent items:", error);
    }
  }, []);

  /**
   * Remove a specific item by URL
   */
  const removeRecentItem = useCallback((url: string) => {
    setRecentItems((prev) => {
      const updated = prev.filter((item) => item.url !== url);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("Failed to update recent items:", error);
      }

      return updated;
    });
  }, []);

  return {
    recentItems,
    addRecentItem,
    clearRecentItems,
    removeRecentItem,
  };
}

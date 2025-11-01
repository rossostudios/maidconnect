import { useEffect, useState } from "react";

const STORAGE_KEY = "maidconnect_recently_viewed";
const MAX_ITEMS = 10;

export interface RecentlyViewedItem {
  id: string;
  name: string;
  photo: string;
  service: string;
  rating: number;
  hourlyRate: number;
  viewedAt: number; // timestamp
}

/**
 * Hook to track and retrieve recently viewed professionals
 * Persists to localStorage for cross-session continuity
 */
export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as RecentlyViewedItem[];
        // Sort by viewedAt descending
        const sorted = parsed.sort((a, b) => b.viewedAt - a.viewedAt);
        setRecentlyViewed(sorted);
      }
    } catch (error) {
      console.error("Failed to load recently viewed:", error);
    }
  }, []);

  const addToRecentlyViewed = (item: Omit<RecentlyViewedItem, "viewedAt">) => {
    const newItem: RecentlyViewedItem = {
      ...item,
      viewedAt: Date.now(),
    };

    setRecentlyViewed((prev) => {
      // Remove if already exists
      const filtered = prev.filter((i) => i.id !== item.id);

      // Add to beginning
      const updated = [newItem, ...filtered];

      // Limit to MAX_ITEMS
      const limited = updated.slice(0, MAX_ITEMS);

      // Persist to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
      } catch (error) {
        console.error("Failed to save recently viewed:", error);
      }

      return limited;
    });
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear recently viewed:", error);
    }
  };

  return {
    recentlyViewed,
    addToRecentlyViewed,
    clearRecentlyViewed,
  };
}

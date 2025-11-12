"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";

type SearchResultType = "help_article" | "changelog" | "roadmap" | "city_page";

type SearchResult = {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  url: string;
  metadata?: Record<string, unknown>;
};

type UseSearchOptions = {
  locale: string;
  type?: "all" | "help" | "changelog" | "roadmap" | "city";
  limit?: number;
  debounceMs?: number;
};

type UseSearchReturn = {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  total: number;
};

export function useSearch(options: UseSearchOptions): UseSearchReturn {
  const { locale, type = "all", limit = 20, debounceMs = 300 } = options;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const debouncedQuery = useDebounce(query, debounceMs);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setTotal(0);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          q: debouncedQuery,
          locale,
          type,
          limit: limit.toString(),
        });

        const response = await fetch(`/api/search?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const data = await response.json();

        if (data.success) {
          setResults(data.data || []);
          setTotal(data.total || 0);
        } else {
          throw new Error(data.error || "Search failed");
        }
      } catch (err) {
        console.error("Search error:", err);
        setError(err instanceof Error ? err.message : "Search failed");
        setResults([]);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, locale, type, limit]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    total,
  };
}

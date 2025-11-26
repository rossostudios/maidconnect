"use client";

/**
 * useProfessionals - Data fetching hook for professionals directory
 *
 * Encapsulates all data fetching logic:
 * - URL-synced filter state via useDirectoryFilters
 * - Fetches professionals from API
 * - Manages loading/error states
 * - Handles pagination
 *
 * @example
 * ```tsx
 * const {
 *   professionals,
 *   isLoading,
 *   error,
 *   totalResults,
 *   totalPages,
 *   filters,
 *   setFilter,
 *   clearFilters,
 *   activeFilterCount,
 *   handlePrevPage,
 *   handleNextPage,
 *   refetch,
 * } = useProfessionals();
 * ```
 */

import { useCallback, useEffect, useState } from "react";
import type { DirectoryProfessional, DirectoryResponse } from "@/components/directory/types";
import { buildApiQueryParams, useDirectoryFilters } from "@/hooks/use-directory-filters";

export type UseProfessionalsReturn = {
  // Data
  professionals: DirectoryProfessional[];
  totalResults: number;
  totalPages: number;

  // Loading & error states
  isLoading: boolean;
  error: string | null;

  // Filter state (from useDirectoryFilters)
  filters: ReturnType<typeof useDirectoryFilters>["filters"];
  setFilter: ReturnType<typeof useDirectoryFilters>["setFilter"];
  setFilters: ReturnType<typeof useDirectoryFilters>["setFilters"];
  clearFilters: ReturnType<typeof useDirectoryFilters>["clearFilters"];
  activeFilterCount: number;
  hasActiveFilters: boolean;
  getActiveFilterChips: ReturnType<typeof useDirectoryFilters>["getActiveFilterChips"];
  removeFilter: ReturnType<typeof useDirectoryFilters>["removeFilter"];

  // Pagination handlers
  handlePrevPage: () => void;
  handleNextPage: () => void;

  // Manual refetch
  refetch: () => Promise<void>;
};

export function useProfessionals(): UseProfessionalsReturn {
  const {
    filters,
    setFilter,
    setFilters,
    clearFilters,
    activeFilterCount,
    hasActiveFilters,
    getActiveFilterChips,
    removeFilter,
  } = useDirectoryFilters();

  const [professionals, setProfessionals] = useState<DirectoryProfessional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch professionals when filters change
  const fetchProfessionals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = buildApiQueryParams(filters);
      const response = await fetch(`/api/directory/professionals?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch professionals");
      }

      const data: DirectoryResponse = await response.json();
      setProfessionals(data.professionals);
      setTotalResults(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Error fetching professionals:", err);
      setError("Failed to load professionals. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

  // Pagination handlers
  const handlePrevPage = useCallback(() => {
    if (filters.page > 1) {
      setFilter("page", filters.page - 1);
    }
  }, [filters.page, setFilter]);

  const handleNextPage = useCallback(() => {
    if (filters.page < totalPages) {
      setFilter("page", filters.page + 1);
    }
  }, [filters.page, totalPages, setFilter]);

  return {
    // Data
    professionals,
    totalResults,
    totalPages,

    // Loading & error states
    isLoading,
    error,

    // Filter state
    filters,
    setFilter,
    setFilters,
    clearFilters,
    activeFilterCount,
    hasActiveFilters,
    getActiveFilterChips,
    removeFilter,

    // Pagination
    handlePrevPage,
    handleNextPage,

    // Manual refetch
    refetch: fetchProfessionals,
  };
}

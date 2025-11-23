"use client";

/**
 * ProfessionalsDirectory - Main client component for the professionals directory page
 *
 * Features:
 * - URL-synced filters via nuqs
 * - Grid/List/Map view toggle
 * - Responsive design with sidebar on desktop, sheet on mobile
 * - Real-time search and filtering
 */

import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { ActiveFilters } from "@/components/directory/controls/ActiveFilters";
import { CategoryChips } from "@/components/directory/controls/CategoryChips";
import { DirectorySearch } from "@/components/directory/controls/DirectorySearch";
import { QuickFilters } from "@/components/directory/controls/QuickFilters";
import { SortDropdown } from "@/components/directory/controls/SortDropdown";
import { ViewToggle } from "@/components/directory/controls/ViewToggle";
import { EmptyState } from "@/components/directory/EmptyState";
import { FilterSheet } from "@/components/directory/filters/FilterSheet";
import { FilterSidebar } from "@/components/directory/filters/FilterSidebar";
import type { DirectoryProfessional, DirectoryResponse } from "@/components/directory/types";
import { DirectoryGrid } from "@/components/directory/views/DirectoryGrid";
import { DirectoryList } from "@/components/directory/views/DirectoryList";
import { Button } from "@/components/ui/button";
import { buildApiQueryParams, useDirectoryFilters } from "@/hooks/use-directory-filters";

// Lazy load DirectoryMap since Mapbox requires browser APIs
const DirectoryMap = lazy(() =>
  import("@/components/directory/views/DirectoryMap").then((mod) => ({
    default: mod.DirectoryMap,
  }))
);

export function ProfessionalsDirectory() {
  const {
    filters,
    setFilter,
    clearFilters,
    activeFilterCount,
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
  const handlePrevPage = () => {
    if (filters.page > 1) {
      setFilter("page", filters.page - 1);
    }
  };

  const handleNextPage = () => {
    if (filters.page < totalPages) {
      setFilter("page", filters.page + 1);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Airbnb-style sticky category navigation */}
      <div className="sticky top-0 z-20 border-neutral-200 border-b bg-neutral-50">
        <div className="container mx-auto px-4">
          <CategoryChips filters={filters} setFilter={setFilter} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="mb-2 font-bold text-2xl text-neutral-900">
            {filters.service
              ? `${filters.service.charAt(0).toUpperCase() + filters.service.slice(1).replace("-", " ")} Professionals`
              : "Browse All Professionals"}
          </h1>
          <p className="text-neutral-600 text-sm">
            Verified home service professionals in your area
          </p>
        </div>

        {/* Search + Quick filters row */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <DirectorySearch
            className="max-w-md flex-1"
            onChange={(value) => setFilter("query", value)}
            value={filters.query}
          />
          <QuickFilters className="sm:flex-shrink-0" filters={filters} setFilter={setFilter} />
        </div>

        {/* Active filters chips */}
        {activeFilterCount > 0 && (
          <div className="mb-6">
            <ActiveFilters
              chips={getActiveFilterChips}
              onClearAll={clearFilters}
              onRemove={removeFilter}
            />
          </div>
        )}

        {/* Controls row */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          {/* Results count + Mobile filter button */}
          <div className="flex items-center gap-4">
            {/* Mobile filter sheet trigger */}
            <div className="lg:hidden">
              <FilterSheet
                activeFilterCount={activeFilterCount}
                clearFilters={clearFilters}
                filters={filters}
                setFilter={setFilter}
              />
            </div>

            {/* Results count */}
            <p className="text-neutral-600 text-sm">
              {isLoading ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                <>
                  <span className="font-semibold text-neutral-900">{totalResults}</span>{" "}
                  professionals found
                </>
              )}
            </p>
          </div>

          {/* View toggle + Sort */}
          <div className="flex items-center gap-2">
            <ViewToggle
              onChange={(value) => setFilter("view", value)}
              showMapOption={true}
              value={filters.view}
            />
            <SortDropdown onChange={(value) => setFilter("sort", value)} value={filters.sort} />
          </div>
        </div>

        {/* Main content area */}
        <div className="flex gap-8">
          {/* Sidebar - desktop only */}
          <aside className="hidden w-[280px] shrink-0 lg:block">
            <FilterSidebar
              activeFilterCount={activeFilterCount}
              clearFilters={clearFilters}
              filters={filters}
              setFilter={setFilter}
            />
          </aside>

          {/* Main content */}
          <div className="flex-1">
            {/* Error state */}
            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
                {error}
                <Button
                  className="ml-2 text-red-700 hover:text-red-800"
                  onClick={fetchProfessionals}
                  size="sm"
                  variant="ghost"
                >
                  Retry
                </Button>
              </div>
            )}

            {/* Empty state */}
            {!(isLoading || error) && professionals.length === 0 && (
              <EmptyState
                description="Try adjusting your filters or search criteria to find more results."
                onClearFilters={clearFilters}
                title="No professionals found"
              />
            )}

            {/* Results grid/list/map */}
            {(isLoading || professionals.length > 0) && (
              <>
                {filters.view === "grid" && (
                  <DirectoryGrid isLoading={isLoading} professionals={professionals} />
                )}
                {filters.view === "list" && (
                  <DirectoryList isLoading={isLoading} professionals={professionals} />
                )}
                {filters.view === "map" && (
                  <Suspense
                    fallback={
                      <div className="flex h-[500px] items-center justify-center rounded-lg border border-neutral-200 bg-white">
                        <div className="flex items-center gap-3">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                          <span className="text-neutral-600 text-sm">Loading map...</span>
                        </div>
                      </div>
                    }
                  >
                    <DirectoryMap
                      className="h-[500px] lg:h-[600px]"
                      isLoading={isLoading}
                      professionals={professionals}
                    />
                  </Suspense>
                )}
              </>
            )}

            {/* Pagination - hide for map view */}
            {!isLoading && totalPages > 1 && filters.view !== "map" && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <Button disabled={filters.page <= 1} onClick={handlePrevPage} variant="outline">
                  Previous
                </Button>
                <span className="text-neutral-600 text-sm">
                  Page {filters.page} of {totalPages}
                </span>
                <Button
                  disabled={filters.page >= totalPages}
                  onClick={handleNextPage}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

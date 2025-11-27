"use client";

/**
 * ProfessionalsDirectory - Airbnb-Style Professionals Directory
 *
 * Redesigned with Clean Architecture:
 * - Split-view layout: Cards (60%) + Map (40%) on desktop
 * - Filter modal: Centered popup on desktop, bottom sheet on mobile
 * - Price markers: Airbnb-style price bubbles on map
 * - Mobile: Cards only, no map
 */

import { useState } from "react";
import { DirectoryHeader } from "@/components/directory/DirectoryHeader";
import { DirectoryPagination } from "@/components/directory/DirectoryPagination";
import { FilterModal } from "@/components/directory/filters/FilterModal";
import { FilterSheet } from "@/components/directory/filters/FilterSheet";
import {
  DirectoryCardsPanel,
  DirectoryMapPanel,
  DirectorySplitView,
} from "@/components/directory/layouts";
import type { DirectoryProfessional } from "@/components/directory/types";
import { useProfessionals } from "@/hooks/use-professionals";

export function ProfessionalsDirectory() {
  const {
    professionals,
    isLoading,
    error,
    totalResults,
    totalPages,
    filters,
    setFilter,
    clearFilters,
    activeFilterCount,
    getActiveFilterChips,
    removeFilter,
    handlePrevPage,
    handleNextPage,
    refetch,
  } = useProfessionals();

  // Hover state for card-map sync
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Filter modal state (desktop)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Handle card hover for map marker highlight
  const handleCardHover = (id: string | null) => {
    setHoveredId(id);
  };

  // Handle card click
  const handleCardClick = (professional: DirectoryProfessional) => {
    setSelectedId(professional.id);
  };

  // Handle map marker hover
  const handleMarkerHover = (id: string | null) => {
    setHoveredId(id);
  };

  // Handle map marker click
  const handleMarkerClick = (professional: DirectoryProfessional) => {
    setSelectedId(professional.id);
  };

  // Combined selected/hovered ID for both cards and map
  const highlightedId = selectedId ?? hoveredId;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-background">
      {/* Header Section - Fixed at top */}
      <div className="sticky top-0 z-20 border-neutral-200 border-b bg-white dark:border-border dark:bg-background">
        <div className="container mx-auto px-4 py-4">
          <DirectoryHeader
            activeFilterCount={activeFilterCount}
            getActiveFilterChips={getActiveFilterChips}
            isLoading={isLoading}
            onClearAll={clearFilters}
            onFilterPress={() => setIsFilterModalOpen(true)}
            onRemoveFilter={removeFilter}
            onSortChange={(value) => setFilter("sort", value)}
            sortValue={filters.sort}
            totalResults={totalResults}
          />

          {/* Mobile Filter Button (visible only on mobile) */}
          <div className="mt-4 lg:hidden">
            <FilterSheet
              activeFilterCount={activeFilterCount}
              clearFilters={clearFilters}
              filters={filters}
              setFilter={setFilter}
            />
          </div>
        </div>
      </div>

      {/* Main Split View */}
      <DirectorySplitView
        cardsPanel={
          <div className="flex flex-col">
            <DirectoryCardsPanel
              error={error}
              isLoading={isLoading}
              onClick={handleCardClick}
              onHover={handleCardHover}
              onRetry={refetch}
              professionals={professionals}
              selectedId={highlightedId}
            />
            <DirectoryPagination
              currentPage={filters.page}
              onNextPage={handleNextPage}
              onPrevPage={handlePrevPage}
              totalPages={totalPages}
            />
          </div>
        }
        mapPanel={
          <DirectoryMapPanel
            onMarkerClick={handleMarkerClick}
            onMarkerHover={handleMarkerHover}
            professionals={professionals}
            selectedId={highlightedId}
          />
        }
      />

      {/* Filter Modal (Desktop) - Hidden trigger, controlled open state */}
      <FilterModal
        filters={filters}
        isOpen={isFilterModalOpen}
        onClearAll={clearFilters}
        onOpenChange={setIsFilterModalOpen}
        setFilter={setFilter}
        totalResults={totalResults}
        trigger={<span className="hidden" />}
      />
    </div>
  );
}

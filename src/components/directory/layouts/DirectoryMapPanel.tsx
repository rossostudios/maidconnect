"use client";

/**
 * DirectoryMapPanel - Lia Design System
 *
 * Sticky map panel for professionals directory (desktop only).
 * Lazy-loads DirectoryMapGoogle for performance.
 *
 * Features:
 * - Sticky positioning (top-0)
 * - Full height (h-screen)
 * - Hidden on mobile (lg:block)
 * - Lazy-loaded map component with Suspense
 */

import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { DirectoryProfessional } from "../types";

// Lazy load the heavy map component
const DirectoryMapGoogle = lazy(() =>
  import("../views/DirectoryMapGoogle").then((mod) => ({
    default: mod.DirectoryMapGoogle,
  }))
);

export type DirectoryMapPanelProps = {
  /** List of professionals to show on map */
  professionals: DirectoryProfessional[];
  /** Currently selected professional ID */
  selectedId?: string | null;
  /** Callback when a marker is hovered */
  onMarkerHover?: (id: string | null) => void;
  /** Callback when a marker is clicked */
  onMarkerClick?: (professional: DirectoryProfessional) => void;
  className?: string;
};

/**
 * Loading skeleton for map
 */
function MapSkeleton() {
  return (
    <div className="relative h-full w-full bg-neutral-100">
      <Skeleton className="absolute inset-0" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-300 border-t-rausch-500" />
          <span className="text-neutral-500 text-sm">Loading map...</span>
        </div>
      </div>
    </div>
  );
}

export function DirectoryMapPanel({
  professionals,
  selectedId,
  onMarkerHover,
  onMarkerClick,
  className,
}: DirectoryMapPanelProps) {
  return (
    <div className={cn("h-full w-full", className)}>
      <Suspense fallback={<MapSkeleton />}>
        <DirectoryMapGoogle
          onMarkerClick={onMarkerClick}
          onMarkerHover={onMarkerHover}
          professionals={professionals}
          selectedId={selectedId}
        />
      </Suspense>
    </div>
  );
}

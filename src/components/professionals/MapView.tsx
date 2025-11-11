"use client";

import { Location01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { memo } from "react";
import type { DirectoryProfessional } from "./ProfessionalsDirectory";

/**
 * Map View Component - Placeholder
 *
 * TODO: Implement lightweight map solution
 * Previous implementation used Leaflet (~150 KB bundle impact)
 * Consider alternatives: pigeon-maps, Google Maps Embed API, or Mapbox GL
 */

type MapViewProps = {
  professionals: DirectoryProfessional[];
  center?: [number, number];
  zoom?: number;
  className?: string;
};

const MapViewComponent = memo(function MapViewInner({
  professionals,
  className = "",
}: MapViewProps) {
  const professionalCount = professionals.filter((p) => p.location?.includes(",")).length;

  return (
    <div
      className={`flex h-full min-h-[400px] items-center justify-center bg-stone-50 ${className}`}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <HugeiconsIcon className="h-16 w-16 text-stone-400" icon={Location01Icon} />
        <div>
          <p className="font-semibold text-lg text-stone-900">Map View</p>
          <p className="text-sm text-stone-600">
            {professionalCount > 0
              ? `${professionalCount} professional${professionalCount === 1 ? "" : "s"} with location data`
              : "No professionals with location data"}
          </p>
          <p className="mt-2 text-stone-500 text-xs">Map functionality temporarily disabled</p>
        </div>
      </div>
    </div>
  );
});

export const MapView = MapViewComponent;

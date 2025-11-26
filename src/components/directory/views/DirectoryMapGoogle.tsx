"use client";

/**
 * DirectoryMap - Google Maps Version (Lia Design System)
 *
 * Google Maps powered map view for professional directory.
 * Shows professional locations with custom markers and info windows.
 *
 * @see https://visgl.github.io/react-google-maps/
 */

import {
  AdvancedMarker,
  APIProvider,
  type ColorScheme,
  InfoWindow,
  Map,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import { useTheme } from "next-themes";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { ProfessionalCard } from "../cards/ProfessionalCard";
import type { DirectoryProfessional } from "../types";

// Google Maps API key from environment variable
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

// Default center (Bogotá, Colombia)
const DEFAULT_CENTER = { lat: 4.711, lng: -74.0721 };
const DEFAULT_ZOOM = 11;

// Map ID for Advanced Markers (can be created in Google Cloud Console)
// Using a demo map ID - replace with your own for production
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

/**
 * Lia Design System Map Styles
 * Airbnb-inspired styling with brand colors:
 * - Water: Light babu teal (#B8E3E0)
 * - Land: Neutral page background (#F7F7F7)
 * - Roads: Clean white with neutral borders
 * - Parks: Subtle green (#E8EDE3)
 * - Labels: Neutral text (#484848)
 */
const LIA_MAP_STYLES: google.maps.MapTypeStyle[] = [
  // Water - Light babu teal
  {
    featureType: "water",
    elementType: "geometry.fill",
    stylers: [{ color: "#B8E3E0" }],
  },
  // Land - Neutral page background
  {
    featureType: "landscape",
    elementType: "geometry.fill",
    stylers: [{ color: "#F7F7F7" }],
  },
  // Roads - Clean white with neutral borders
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [{ color: "#FFFFFF" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#DDDDDD" }],
  },
  // Labels - Neutral text
  {
    featureType: "all",
    elementType: "labels.text.fill",
    stylers: [{ color: "#484848" }],
  },
  // POI - Subtle green parks
  {
    featureType: "poi.park",
    elementType: "geometry.fill",
    stylers: [{ color: "#E8EDE3" }],
  },
  // Transit - Hidden for cleaner look
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
  // Administrative - Soften boundaries
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#DDDDDD" }],
  },
];

type DirectoryMapProps = {
  professionals: DirectoryProfessional[];
  isLoading?: boolean;
  className?: string;
  /** Currently selected professional ID (for highlight sync with cards) */
  selectedId?: string | null;
  /** Callback when a marker is hovered */
  onMarkerHover?: (id: string | null) => void;
  /** Callback when a marker is clicked */
  onMarkerClick?: (professional: DirectoryProfessional) => void;
  /** @deprecated Use onMarkerClick instead */
  onProfessionalSelect?: (professional: DirectoryProfessional) => void;
};

/**
 * Individual marker component with Airbnb-style price bubble
 */
function ProfessionalMarker({
  professional,
  isSelected,
  isHovered,
  onSelect,
  onHover,
}: {
  professional: DirectoryProfessional;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (professional: DirectoryProfessional) => void;
  onHover: (id: string | null) => void;
}) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [showInfo, setShowInfo] = useState(false);

  const handleClick = useCallback(() => {
    setShowInfo(true);
    onSelect(professional);
  }, [professional, onSelect]);

  const handleClose = useCallback(() => {
    setShowInfo(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    onHover(professional.id);
  }, [professional.id, onHover]);

  const handleMouseLeave = useCallback(() => {
    onHover(null);
  }, [onHover]);

  if (!(professional.latitude && professional.longitude)) {
    return null;
  }

  // Format hourly rate for display
  const hourlyRate = professional.hourlyRate ?? professional.baseRate ?? 0;
  const formattedRate =
    hourlyRate >= 1000 ? `$${(hourlyRate / 1000).toFixed(0)}k` : `$${hourlyRate}`;

  const isHighlighted = isSelected || isHovered;

  return (
    <>
      <AdvancedMarker
        onClick={handleClick}
        position={{ lat: professional.latitude, lng: professional.longitude }}
        ref={markerRef}
        title={professional.name}
      >
        {/* Airbnb-style price bubble marker */}
        <div
          className={cn(
            "cursor-pointer transition-all duration-150",
            "hover:z-10 hover:scale-105",
            isHighlighted && "z-10 scale-105"
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className={cn(
              "rounded-full px-3 py-1.5 shadow-lg",
              "whitespace-nowrap font-semibold text-sm",
              "transition-all duration-150",
              isHighlighted
                ? "border border-neutral-900 bg-neutral-900 text-white"
                : "border border-neutral-200 bg-white text-neutral-900 hover:border-neutral-400"
            )}
          >
            {formattedRate}/hr
          </div>
        </div>
      </AdvancedMarker>

      {/* Info Window */}
      {showInfo && marker && (
        <InfoWindow anchor={marker} onCloseClick={handleClose}>
          <div className="w-64 overflow-hidden">
            <ProfessionalCard professional={professional} size="sm" variant="compact" />
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export function DirectoryMapGoogle({
  professionals,
  isLoading = false,
  className,
  selectedId: externalSelectedId,
  onMarkerHover,
  onMarkerClick,
  onProfessionalSelect,
}: DirectoryMapProps) {
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();

  // Use external selectedId if provided, otherwise use internal state
  const selectedId = externalSelectedId ?? internalSelectedId;

  // Determine color scheme based on theme
  const colorScheme: ColorScheme = resolvedTheme === "dark" ? "DARK" : "LIGHT";

  const handleSelect = useCallback(
    (professional: DirectoryProfessional) => {
      setInternalSelectedId(professional.id);
      onMarkerClick?.(professional);
      onProfessionalSelect?.(professional);
    },
    [onMarkerClick, onProfessionalSelect]
  );

  const handleHover = useCallback(
    (id: string | null) => {
      setHoveredId(id);
      onMarkerHover?.(id);
    },
    [onMarkerHover]
  );

  // Filter professionals with valid coordinates
  const professionalsWithCoords = professionals.filter((p) => p.latitude && p.longitude);

  // Calculate bounds if we have professionals
  const bounds =
    professionalsWithCoords.length > 0
      ? {
          north: Math.max(...professionalsWithCoords.map((p) => p.latitude!)),
          south: Math.min(...professionalsWithCoords.map((p) => p.latitude!)),
          east: Math.max(...professionalsWithCoords.map((p) => p.longitude!)),
          west: Math.min(...professionalsWithCoords.map((p) => p.longitude!)),
        }
      : undefined;

  // Check if API key is configured
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div
        className={cn(
          "relative h-full min-h-[400px] w-full overflow-hidden rounded-lg bg-neutral-100",
          className
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-md p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-200">
              <svg
                className="h-8 w-8 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                />
              </svg>
            </div>
            <p className="font-semibold text-lg text-neutral-900">Google Maps API Key Required</p>
            <p className="mt-2 text-neutral-600 text-sm">
              Add{" "}
              <code className="rounded bg-neutral-200 px-1.5 py-0.5 text-xs">
                NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
              </code>{" "}
              to your{" "}
              <code className="rounded bg-neutral-200 px-1.5 py-0.5 text-xs">.env.local</code> file.
            </p>
            <a
              className="mt-4 inline-flex items-center gap-2 font-medium text-rausch-600 text-sm hover:text-rausch-700"
              href="https://console.cloud.google.com/google/maps-apis/credentials"
              rel="noopener noreferrer"
              target="_blank"
            >
              Get API Key from Google Cloud Console
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("relative h-full min-h-[400px] w-full overflow-hidden rounded-lg", className)}
    >
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          colorScheme={colorScheme}
          defaultBounds={bounds}
          defaultCenter={DEFAULT_CENTER}
          defaultZoom={DEFAULT_ZOOM}
          disableDefaultUI={false}
          fullscreenControl={false}
          gestureHandling="greedy"
          mapId={MAP_ID}
          mapTypeControl={false}
          streetViewControl={false}
          style={{ width: "100%", height: "100%" }}
          styles={LIA_MAP_STYLES}
          zoomControl={true}
        >
          {/* Render markers */}
          {professionalsWithCoords.map((professional) => (
            <ProfessionalMarker
              isHovered={hoveredId === professional.id}
              isSelected={selectedId === professional.id}
              key={professional.id}
              onHover={handleHover}
              onSelect={handleSelect}
              professional={professional}
            />
          ))}
        </Map>
      </APIProvider>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90">
          <div className="flex items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-lg">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-rausch-500 border-t-transparent" />
            <span className="font-medium text-neutral-700 text-sm">Loading professionals...</span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && professionals.length === 0 && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-50/80">
          <div className="p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
              <svg
                className="h-6 w-6 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                />
                <path
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                />
              </svg>
            </div>
            <p className="font-medium text-neutral-900 text-sm">No professionals found</p>
            <p className="mt-1 text-neutral-500 text-xs">Try adjusting your filters</p>
          </div>
        </div>
      )}

      {/* Map legend */}
      <div className="absolute bottom-4 left-4 z-10 rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-md">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-rausch-500" />
          <span className="text-neutral-600 text-xs">{professionals.length} professionals</span>
        </div>
      </div>
    </div>
  );
}

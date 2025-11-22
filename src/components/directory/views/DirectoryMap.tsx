"use client";

/**
 * DirectoryMap - Lia Design System
 *
 * Mapbox GL JS powered map view for professional directory.
 * Shows professional locations with custom markers and popups.
 */

import mapboxgl from "mapbox-gl";
import { useCallback, useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { cn } from "@/lib/utils";
import { ProfessionalCard } from "../cards/ProfessionalCard";
import type { DirectoryProfessional } from "../types";

// Mapbox access token
const MAPBOX_TOKEN =
  "pk.eyJ1IjoiY2hyaXNyb3Nzb3BtcCIsImEiOiJjbWlhbGR4bmgweW14MmtxNnlsNWIxcnh4In0.IfE2Izst8hGUjwCBcqKMfA";

// Default center (Colombia)
const DEFAULT_CENTER: [number, number] = [-74.0721, 4.711];
const DEFAULT_ZOOM = 10;

interface DirectoryMapProps {
  professionals: DirectoryProfessional[];
  isLoading?: boolean;
  className?: string;
  onProfessionalSelect?: (professional: DirectoryProfessional) => void;
}

export function DirectoryMap({
  professionals,
  isLoading = false,
  className,
  onProfessionalSelect,
}: DirectoryMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<DirectoryProfessional | null>(
    null
  );
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    // Add attribution
    map.current.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Create custom marker element using safe DOM methods
  const createMarkerElement = useCallback(
    (professional: DirectoryProfessional, isSelected: boolean) => {
      const el = document.createElement("div");
      el.className =
        "relative flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 hover:z-10";

      // Create marker circle
      const markerCircle = document.createElement("div");
      markerCircle.className = cn(
        "h-10 w-10 rounded-full shadow-lg transition-all duration-200",
        "flex items-center justify-center",
        "border-2",
        isSelected
          ? "scale-110 border-white bg-orange-600"
          : "border-white bg-orange-500 hover:bg-orange-600"
      );

      // Add avatar or initial
      if (professional.avatarUrl) {
        const img = document.createElement("img");
        img.src = professional.avatarUrl;
        img.alt = professional.name;
        img.className = "w-8 h-8 rounded-full object-cover";
        markerCircle.appendChild(img);
      } else {
        const initial = document.createElement("span");
        initial.className = "text-white text-sm font-semibold";
        initial.textContent = professional.name.charAt(0).toUpperCase();
        markerCircle.appendChild(initial);
      }

      el.appendChild(markerCircle);

      // Add rating badge if available
      if (professional.averageRating) {
        const ratingBadge = document.createElement("div");
        ratingBadge.className =
          "absolute -bottom-1 -right-1 bg-white rounded-full px-1.5 py-0.5 shadow-md border border-neutral-100";

        const ratingText = document.createElement("span");
        ratingText.className = "text-xs font-semibold text-neutral-900";
        ratingText.textContent = professional.averageRating.toFixed(1);
        ratingBadge.appendChild(ratingText);

        el.appendChild(ratingBadge);
      }

      return el;
    },
    []
  );

  // Update markers when professionals change
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Filter professionals with valid coordinates
    const professionalsWithCoords = professionals.filter((p) => p.latitude && p.longitude);

    if (professionalsWithCoords.length === 0) return;

    // Create new markers
    professionalsWithCoords.forEach((professional) => {
      if (!(professional.longitude && professional.latitude)) return;

      const el = createMarkerElement(professional, selectedProfessional?.id === professional.id);

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        setSelectedProfessional(professional);
        onProfessionalSelect?.(professional);

        // Calculate popup position
        if (map.current) {
          const point = map.current.project([professional.longitude!, professional.latitude!]);
          setPopupPosition({ x: point.x, y: point.y });
        }
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([professional.longitude, professional.latitude])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (professionalsWithCoords.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      professionalsWithCoords.forEach((p) => {
        if (p.longitude && p.latitude) {
          bounds.extend([p.longitude, p.latitude]);
        }
      });

      map.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 14,
      });
    }
  }, [professionals, selectedProfessional, createMarkerElement, onProfessionalSelect]);

  // Close popup on map click
  useEffect(() => {
    if (!map.current) return;

    const handleClick = () => {
      setSelectedProfessional(null);
      setPopupPosition(null);
    };

    map.current.on("click", handleClick);

    return () => {
      map.current?.off("click", handleClick);
    };
  }, []);

  // Update popup position on map move
  useEffect(() => {
    if (!(map.current && selectedProfessional)) return;

    const updatePosition = () => {
      if (selectedProfessional.longitude && selectedProfessional.latitude) {
        const point = map.current!.project([
          selectedProfessional.longitude,
          selectedProfessional.latitude,
        ]);
        setPopupPosition({ x: point.x, y: point.y });
      }
    };

    map.current.on("move", updatePosition);

    return () => {
      map.current?.off("move", updatePosition);
    };
  }, [selectedProfessional]);

  return (
    <div
      className={cn("relative h-full min-h-[400px] w-full overflow-hidden rounded-lg", className)}
    >
      {/* Map container */}
      <div className="absolute inset-0" ref={mapContainer} />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-lg">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
            <span className="font-medium text-neutral-700 text-sm">Loading professionals...</span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && professionals.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-50/80">
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

      {/* Selected professional popup */}
      {selectedProfessional && popupPosition && (
        <div
          className="-translate-x-1/2 -translate-y-full absolute z-20 w-72 transform"
          style={{
            left: popupPosition.x,
            top: popupPosition.y - 20,
          }}
        >
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl">
            <ProfessionalCard professional={selectedProfessional} size="sm" variant="compact" />
          </div>
          {/* Arrow pointing down */}
          <div className="-translate-x-1/2 -bottom-2 absolute left-1/2 h-4 w-4 rotate-45 transform border-neutral-200 border-r border-b bg-white" />
        </div>
      )}

      {/* Map legend */}
      <div className="absolute bottom-4 left-4 z-10 rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-md">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-orange-500" />
          <span className="text-neutral-600 text-xs">{professionals.length} professionals</span>
        </div>
      </div>
    </div>
  );
}

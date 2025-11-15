"use client";

import { Location01Icon, StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import "leaflet/dist/leaflet.css";
import { Icon, type LatLngExpression } from "leaflet";
import Image from "next/image";
import { memo, useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Link } from "@/i18n/routing";
import { formatCOP } from "@/lib/format";
import { type DirectoryProfessional } from "./professionals-directory";
import { VerificationBadge } from "./verification-badge";

/**
 * Map View Component for Professionals Directory
 *
 * Research insights applied:
 * - Leaflet: Open-source, free, 5x more popular than Mapbox
 * - Marketplace UX: Show price, rating, distance on map markers
 * - Mobile: Keep map simple, prioritize essential info
 * - OpenStreetMap tiles: Free alternative to Google Maps
 *
 * Performance optimizations:
 * - React.memo: Prevents re-renders when professionals array unchanged
 * - useMemo: Memoizes expensive coordinate filtering and center calculation
 *
 * Note: Marker clustering removed temporarily due to react-leaflet v5 compatibility.
 * Will be re-added when a compatible clustering library is available.
 */

type MapViewProps = {
  professionals: DirectoryProfessional[];
  center?: LatLngExpression;
  zoom?: number;
  className?: string;
};

// Colombia default center (Bogotá)
const DEFAULT_CENTER: LatLngExpression = [4.711, -74.0721];
const DEFAULT_ZOOM = 6;

// Moved outside component - no dependencies on component state (React 19 best practice)
// Custom marker icon with price overlay
function createCustomIcon(price: number | null, verified: boolean) {
  const priceText = price ? `$${Math.round(price / 100)}k` : "N/A";
  const bgColor = verified ? "neutral-500" : "neutral-500";

  return new Icon({
    iconUrl: `data:image/svg+xml,${encodeURIComponent(`
      <svg width="40" height="50" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 0C8.954 0 0 8.954 0 20c0 15 20 30 20 30s20-15 20-30c0-11.046-8.954-20-20-20z"
              fill="${bgColor}" stroke="white" stroke-width="2"/>
        <circle cx="20" cy="20" r="12" fill="white"/>
        <text x="20" y="25" text-anchor="middle" font-size="10" font-weight="bold" fill="${bgColor}">
          ${priceText}
        </text>
      </svg>
    `)}`,
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -50],
  });
}

// Moved outside component - no dependencies on component state (React 19 best practice)

// React.memo optimization for heavy map component with Leaflet library
const MapViewComponent = memo(
  function MapViewInner({
    professionals,
    center = DEFAULT_CENTER,
    zoom = DEFAULT_ZOOM,
    className = "",
  }: MapViewProps) {
    const [isMounted, setIsMounted] = useState(false);

    // Only render map on client side (Leaflet doesn't work with SSR)
    useEffect(() => {
      setIsMounted(true);
    }, []);

    // useMemo: Expensive computation - filter professionals with valid coordinates
    const professionalsWithCoords = useMemo(
      () =>
        professionals.filter((pro) => {
          if (!pro.location?.includes(",")) {
            return false;
          }
          const parts = pro.location.split(",");
          return (
            parts.length >= 2 &&
            !Number.isNaN(Number.parseFloat(parts[0] || "")) &&
            !Number.isNaN(Number.parseFloat(parts[1] || ""))
          );
        }),
      [professionals]
    );

    // useMemo: Expensive computation - calculate map center based on professionals
    const mapCenter = useMemo(() => {
      if (professionalsWithCoords.length > 0 && center === DEFAULT_CENTER) {
        const avgLat =
          professionalsWithCoords.reduce((sum, pro) => {
            const parts = pro.location.split(",").map(Number);
            return sum + (parts[0] || 0);
          }, 0) / professionalsWithCoords.length;
        const avgLng =
          professionalsWithCoords.reduce((sum, pro) => {
            const parts = pro.location.split(",").map(Number);
            return sum + (parts[1] || 0);
          }, 0) / professionalsWithCoords.length;
        return [avgLat, avgLng] as LatLngExpression;
      }
      return center;
    }, [professionalsWithCoords, center]);

    if (!isMounted) {
      return (
        <div className={`flex h-full items-center justify-center bg-[neutral-200]/30 ${className}`}>
          <div className="flex flex-col items-center gap-2 text-[neutral-400]">
            <HugeiconsIcon className="h-8 w-8 animate-pulse" icon={Location01Icon} />
            <p className="text-sm">Loading map...</p>
          </div>
        </div>
      );
    }

    return (
      <div className={className}>
        <MapContainer
          center={mapCenter}
          className="h-full w-full"
          scrollWheelZoom
          style={{ minHeight: "400px" }}
          zoom={zoom}
        >
          {/* OpenStreetMap tiles (free) */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Individual markers - clustering removed for react-leaflet v5 compatibility */}
          {professionalsWithCoords.map((professional) => {
            const parts = professional.location.split(",").map(Number);
            const position: LatLngExpression = [parts[0] || 0, parts[1] || 0];

            return (
              <Marker
                icon={createCustomIcon(
                  professional.hourlyRateCop,
                  !!(
                    professional.verificationLevel &&
                    (professional.verificationLevel === "enhanced" ||
                      professional.verificationLevel === "background-check")
                  )
                )}
                key={professional.id}
                position={position}
              >
                <Popup maxWidth={300} minWidth={250}>
                  <Link
                    className="block hover:opacity-80"
                    href={`/professionals/${professional.id}`}
                  >
                    <div className="flex gap-3">
                      {/* Professional photo */}
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden">
                        <Image
                          alt={professional.name}
                          className="object-cover"
                          fill
                          src={professional.photoUrl || "/placeholder-avatar.jpg"}
                        />
                        {professional.availableToday && (
                          <div className="absolute top-1 right-1 h-3 w-3 border-2 border-[neutral-50] bg-[neutral-500]/100" />
                        )}
                      </div>

                      {/* Professional info */}
                      <div className="flex-1">
                        <div className="mb-1 flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-[neutral-900] text-sm leading-tight">
                            {professional.name}
                          </h3>
                          {professional.verificationLevel && (
                            <VerificationBadge level={professional.verificationLevel} size="sm" />
                          )}
                        </div>

                        <p className="mb-1 line-clamp-1 text-[neutral-400] text-xs">
                          {professional.service}
                        </p>

                        {/* Rating */}
                        {professional.rating && professional.reviewCount ? (
                          <div className="mb-1 flex items-center gap-1 text-xs">
                            <HugeiconsIcon
                              className="h-3 w-3 fill-[neutral-500] text-[neutral-500]"
                              icon={StarIcon}
                            />
                            <span className="font-semibold text-[neutral-900]">
                              {professional.rating.toFixed(1)}
                            </span>
                            <span className="text-[neutral-400]">({professional.reviewCount})</span>
                          </div>
                        ) : null}

                        {/* Price */}
                        {professional.hourlyRateCop ? (
                          <p className="font-semibold text-[neutral-500] text-sm">
                            {formatCOP(professional.hourlyRateCop)}/hr
                          </p>
                        ) : null}

                        {/* Location */}
                        <p className="mt-1 text-[neutral-400] text-xs">
                          {professional.city}, {professional.country}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 border-[neutral-200] border-t pt-2 text-center text-[neutral-500] text-xs">
                      View Profile →
                    </div>
                  </Link>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* No results message */}
        {professionalsWithCoords.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-[neutral-50]/80">
            <div className="text-center">
              <HugeiconsIcon
                className="mx-auto mb-2 h-12 w-12 text-[neutral-400]/70"
                icon={Location01Icon}
              />
              <p className="font-medium text-[neutral-900]">No professionals found on map</p>
              <p className="text-[neutral-400] text-sm">
                Try adjusting your filters or search criteria
              </p>
            </div>
          </div>
        )}
      </div>
    );
  },
  // Custom comparison: only re-render if professionals array or other props change
  (prevProps, nextProps) =>
    prevProps.professionals === nextProps.professionals &&
    prevProps.professionals.length === nextProps.professionals.length &&
    prevProps.center === nextProps.center &&
    prevProps.zoom === nextProps.zoom &&
    prevProps.className === nextProps.className
);

// Export the memoized component
export const MapView = MapViewComponent;

"use client";

import "leaflet/dist/leaflet.css";
import { Icon, type LatLngExpression } from "leaflet";
import { MapPin, Star } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { Link } from "@/i18n/routing";
import { type DirectoryProfessional } from "./professionals-directory";
import { VerificationBadge } from "./verification-badge";

/**
 * Map View Component for Professionals Directory
 *
 * Research insights applied:
 * - Leaflet: Open-source, free, 5x more popular than Mapbox
 * - react-leaflet-cluster: Efficient clustering for performance
 * - Marketplace UX: Show price, rating, distance on map markers
 * - Mobile: Keep map simple, prioritize essential info
 * - OpenStreetMap tiles: Free alternative to Google Maps
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

// Custom marker icon with price overlay
function createCustomIcon(price: number | null, verified: boolean) {
  const priceText = price ? `$${Math.round(price / 100)}k` : "N/A";
  const bgColor = verified ? "#10b981" : "#ff5d46";

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

function formatCurrencyCOP(value: number | null | undefined) {
  if (!value || Number.isNaN(value)) {
    return null;
  }
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value / 100);
}

export function MapView({
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

  if (!isMounted) {
    return (
      <div className={`flex h-full items-center justify-center bg-gray-100 ${className}`}>
        <div className="flex flex-col items-center gap-2 text-gray-600">
          <MapPin className="h-8 w-8 animate-pulse" />
          <p className="text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  // Filter professionals with valid coordinates
  const professionalsWithCoords = professionals.filter(
    (pro) =>
      pro.location &&
      pro.location.includes(",") &&
      !Number.isNaN(Number.parseFloat(pro.location.split(",")[0])) &&
      !Number.isNaN(Number.parseFloat(pro.location.split(",")[1]))
  );

  // Calculate map center based on professionals if no center provided
  let mapCenter = center;
  if (professionalsWithCoords.length > 0 && center === DEFAULT_CENTER) {
    const avgLat =
      professionalsWithCoords.reduce((sum, pro) => {
        const [lat] = pro.location.split(",").map(Number);
        return sum + lat;
      }, 0) / professionalsWithCoords.length;
    const avgLng =
      professionalsWithCoords.reduce((sum, pro) => {
        const [, lng] = pro.location.split(",").map(Number);
        return sum + lng;
      }, 0) / professionalsWithCoords.length;
    mapCenter = [avgLat, avgLng];
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

        {/* Marker clustering for performance */}
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={60}
          showCoverageOnHover={false}
          spiderfyOnMaxZoom
          zoomToBoundsOnClick
        >
          {professionalsWithCoords.map((professional) => {
            const [lat, lng] = professional.location.split(",").map(Number);
            const position: LatLngExpression = [lat, lng];

            return (
              <Marker
                icon={createCustomIcon(
                  professional.hourlyRateCop,
                  professional.verificationLevel === "verified" ||
                    professional.verificationLevel === "elite"
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
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                        <Image
                          alt={professional.name}
                          className="object-cover"
                          fill
                          src={professional.photoUrl || "/placeholder-avatar.jpg"}
                        />
                        {professional.availableToday && (
                          <div className="absolute top-1 right-1 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                        )}
                      </div>

                      {/* Professional info */}
                      <div className="flex-1">
                        <div className="mb-1 flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                            {professional.name}
                          </h3>
                          {professional.verificationLevel && (
                            <VerificationBadge level={professional.verificationLevel} size="xs" />
                          )}
                        </div>

                        <p className="mb-1 line-clamp-1 text-gray-600 text-xs">
                          {professional.service}
                        </p>

                        {/* Rating */}
                        {professional.rating && professional.reviewCount ? (
                          <div className="mb-1 flex items-center gap-1 text-xs">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold text-gray-900">
                              {professional.rating.toFixed(1)}
                            </span>
                            <span className="text-gray-600">({professional.reviewCount})</span>
                          </div>
                        ) : null}

                        {/* Price */}
                        {professional.hourlyRateCop ? (
                          <p className="font-semibold text-[#ff5d46] text-sm">
                            {formatCurrencyCOP(professional.hourlyRateCop)}/hr
                          </p>
                        ) : null}

                        {/* Location */}
                        <p className="mt-1 text-gray-500 text-xs">
                          {professional.city}, {professional.country}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 border-gray-200 border-t pt-2 text-center text-[#ff5d46] text-xs">
                      View Profile →
                    </div>
                  </Link>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>

      {/* No results message */}
      {professionalsWithCoords.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
          <div className="text-center">
            <MapPin className="mx-auto mb-2 h-12 w-12 text-gray-400" />
            <p className="font-medium text-gray-900">No professionals found on map</p>
            <p className="text-gray-600 text-sm">Try adjusting your filters or search criteria</p>
          </div>
        </div>
      )}
    </div>
  );
}

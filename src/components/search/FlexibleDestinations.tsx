/**
 * FlexibleDestinations - Airbnb-Inspired "I'm Flexible" City Explorer
 *
 * Browse services by city/region with:
 * - City cards with background images
 * - Professional count per city
 * - Region grouping
 *
 * Inspired by Airbnb's 2025 "I'm Flexible" destination picker.
 *
 * Following Lia Design System.
 */

"use client";

import { Location01Icon, UserMultipleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { geistSans } from "@/app/fonts";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils/core";
import { CarouselItem, FlexibleCarousel } from "./FlexibleCarousel";

export type CityDestination = {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  image?: string;
  professionalCount: number;
  featured?: boolean;
  region?: string;
};

const REGIONS = [
  { id: "all", label: "All Cities" },
  { id: "colombia", label: "Colombia" },
  { id: "paraguay", label: "Paraguay" },
  { id: "uruguay", label: "Uruguay" },
  { id: "argentina", label: "Argentina" },
] as const;

const DEFAULT_CITIES: CityDestination[] = [
  {
    id: "bogota",
    name: "Bogotá",
    country: "Colombia",
    countryCode: "CO",
    professionalCount: 1247,
    featured: true,
    region: "colombia",
  },
  {
    id: "medellin",
    name: "Medellín",
    country: "Colombia",
    countryCode: "CO",
    professionalCount: 856,
    region: "colombia",
  },
  {
    id: "cali",
    name: "Cali",
    country: "Colombia",
    countryCode: "CO",
    professionalCount: 432,
    region: "colombia",
  },
  {
    id: "barranquilla",
    name: "Barranquilla",
    country: "Colombia",
    countryCode: "CO",
    professionalCount: 298,
    region: "colombia",
  },
  {
    id: "cartagena",
    name: "Cartagena",
    country: "Colombia",
    countryCode: "CO",
    professionalCount: 521,
    featured: true,
    region: "colombia",
  },
  {
    id: "asuncion",
    name: "Asunción",
    country: "Paraguay",
    countryCode: "PY",
    professionalCount: 387,
    featured: true,
    region: "paraguay",
  },
  {
    id: "ciudad-del-este",
    name: "Ciudad del Este",
    country: "Paraguay",
    countryCode: "PY",
    professionalCount: 156,
    region: "paraguay",
  },
  {
    id: "montevideo",
    name: "Montevideo",
    country: "Uruguay",
    countryCode: "UY",
    professionalCount: 623,
    featured: true,
    region: "uruguay",
  },
  {
    id: "punta-del-este",
    name: "Punta del Este",
    country: "Uruguay",
    countryCode: "UY",
    professionalCount: 189,
    region: "uruguay",
  },
  {
    id: "buenos-aires",
    name: "Buenos Aires",
    country: "Argentina",
    countryCode: "AR",
    professionalCount: 1832,
    featured: true,
    region: "argentina",
  },
  {
    id: "cordoba",
    name: "Córdoba",
    country: "Argentina",
    countryCode: "AR",
    professionalCount: 567,
    region: "argentina",
  },
  {
    id: "rosario",
    name: "Rosario",
    country: "Argentina",
    countryCode: "AR",
    professionalCount: 342,
    region: "argentina",
  },
];

type FlexibleDestinationsProps = {
  cities?: CityDestination[];
  title?: string;
  subtitle?: string;
  showRegionFilter?: boolean;
  className?: string;
};

export function FlexibleDestinations({
  cities = DEFAULT_CITIES,
  title = "Explore by City",
  subtitle = "Find professionals in your area",
  showRegionFilter = true,
  className,
}: FlexibleDestinationsProps) {
  const [activeRegion, setActiveRegion] = useState<string>("all");

  const filteredCities =
    activeRegion === "all" ? cities : cities.filter((city) => city.region === activeRegion);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={cn("font-semibold text-neutral-900 text-xl", geistSans.className)}>
            {title}
          </h2>
          {subtitle && (
            <p className={cn("mt-1 text-neutral-500 text-sm", geistSans.className)}>{subtitle}</p>
          )}
        </div>
      </div>

      {/* Region Filter Tabs */}
      {showRegionFilter && (
        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
          {REGIONS.map((region) => (
            <button
              className={cn(
                "flex-shrink-0 rounded-full px-4 py-2 font-medium text-sm transition-all",
                activeRegion === region.id
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
                geistSans.className
              )}
              key={region.id}
              onClick={() => setActiveRegion(region.id)}
              type="button"
            >
              {region.label}
            </button>
          ))}
        </div>
      )}

      {/* Cities Carousel */}
      <FlexibleCarousel>
        {filteredCities.map((city, index) => (
          <CarouselItem key={city.id} minWidth="200px">
            <CityCard city={city} index={index} />
          </CarouselItem>
        ))}
      </FlexibleCarousel>
    </div>
  );
}

type CityCardProps = {
  city: CityDestination;
  index?: number;
};

function CityCard({ city, index = 0 }: CityCardProps) {
  // Generate gradient colors based on country
  const gradientColors: Record<string, string> = {
    CO: "from-yellow-400 via-babu-500 to-red-500",
    PY: "from-red-500 via-white to-babu-500",
    UY: "from-babu-400 via-white to-babu-400",
    AR: "from-babu-300 via-white to-babu-300",
  };

  const gradient = gradientColors[city.countryCode] || "from-rausch-400 to-rausch-600";

  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      initial={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link
        className="group block overflow-hidden rounded-lg border border-neutral-200 transition-all hover:border-neutral-300 hover:shadow-md"
        href={`/professionals?city=${city.id}`}
      >
        {/* Image/Gradient Background */}
        <div className="relative h-32 overflow-hidden">
          {city.image ? (
            <Image
              alt={city.name}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              fill
              sizes="200px"
              src={city.image}
            />
          ) : (
            <div
              className={cn(
                "flex h-full w-full items-center justify-center bg-gradient-to-br",
                gradient
              )}
            >
              <HugeiconsIcon className="h-10 w-10 text-white/80" icon={Location01Icon} />
            </div>
          )}

          {/* Featured Badge */}
          {city.featured && (
            <Badge
              className="absolute top-2 right-2 border-white/30 bg-white/90 text-neutral-900"
              size="sm"
            >
              Popular
            </Badge>
          )}

          {/* Country Flag Overlay */}
          <div className="absolute bottom-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-sm shadow-sm">
            {city.countryCode === "CO" && "🇨🇴"}
            {city.countryCode === "PY" && "🇵🇾"}
            {city.countryCode === "UY" && "🇺🇾"}
            {city.countryCode === "AR" && "🇦🇷"}
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          <h3
            className={cn(
              "font-semibold text-neutral-900 group-hover:text-rausch-600",
              geistSans.className
            )}
          >
            {city.name}
          </h3>
          <p className={cn("mt-0.5 text-neutral-500 text-xs", geistSans.className)}>
            {city.country}
          </p>
          <div className="mt-2 flex items-center gap-1 text-neutral-400 text-xs">
            <HugeiconsIcon className="h-3.5 w-3.5" icon={UserMultipleIcon} />
            <span>{city.professionalCount.toLocaleString()} professionals</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

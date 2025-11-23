"use client";

/**
 * LocationFilter - Minimal Lia Design System
 *
 * Clean cascading location filter for boutique marketplace.
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  COUNTRY_OPTIONS,
  type CountryCode,
  getCityOptions,
  getNeighborhoodOptions,
} from "@/lib/shared/config/territories";
import { cn } from "@/lib/utils";

type LocationFilterProps = {
  country: string | null;
  city: string | null;
  neighborhood: string | null;
  onCountryChange: (value: string | null) => void;
  onCityChange: (value: string | null) => void;
  onNeighborhoodChange: (value: string | null) => void;
  className?: string;
  compact?: boolean;
};

export function LocationFilter({
  country,
  city,
  neighborhood,
  onCountryChange,
  onCityChange,
  onNeighborhoodChange,
  className,
  compact = false,
}: LocationFilterProps) {
  // Get available cities based on selected country
  const cityOptions = country ? getCityOptions(country as CountryCode) : [];

  // Get available neighborhoods based on selected city
  const neighborhoodOptions = city ? getNeighborhoodOptions(city) : [];

  // Handle country change - reset city and neighborhood
  const handleCountryChange = (value: string) => {
    const newValue = value === "all" ? null : value;
    onCountryChange(newValue);
    onCityChange(null);
    onNeighborhoodChange(null);
  };

  // Handle city change - reset neighborhood
  const handleCityChange = (value: string) => {
    const newValue = value === "all" ? null : value;
    onCityChange(newValue);
    onNeighborhoodChange(null);
  };

  // Handle neighborhood change
  const handleNeighborhoodChange = (value: string) => {
    const newValue = value === "all" ? null : value;
    onNeighborhoodChange(newValue);
  };

  if (compact) {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        <Select onValueChange={handleCountryChange} value={country || "all"}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {COUNTRY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {country && cityOptions.length > 0 && (
          <Select onValueChange={handleCityChange} value={city || "all"}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cityOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Country select */}
      <div className="space-y-1.5">
        <label className="font-medium text-neutral-700 text-sm">Country</label>
        <Select onValueChange={handleCountryChange} value={country || "all"}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Countries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {COUNTRY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* City select - only show if country is selected */}
      {country && cityOptions.length > 0 && (
        <div className="space-y-1.5">
          <label className="font-medium text-neutral-700 text-sm">City</label>
          <Select onValueChange={handleCityChange} value={city || "all"}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cityOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Neighborhood select - only show if city is selected and has neighborhoods */}
      {city && neighborhoodOptions.length > 0 && (
        <div className="space-y-1.5">
          <label className="font-medium text-neutral-700 text-sm">Neighborhood</label>
          <Select onValueChange={handleNeighborhoodChange} value={neighborhood || "all"}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Neighborhoods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Neighborhoods</SelectItem>
              {neighborhoodOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

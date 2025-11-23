"use client";

import { Location01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export type CityOption = {
  id: string;
  label: string;
  country: string;
  countryName: string;
};

const CITIES: CityOption[] = [
  // Colombia
  { id: "bogota", label: "Bogotá", country: "CO", countryName: "Colombia" },
  { id: "medellin", label: "Medellín", country: "CO", countryName: "Colombia" },
  { id: "cartagena", label: "Cartagena", country: "CO", countryName: "Colombia" },
  { id: "cali", label: "Cali", country: "CO", countryName: "Colombia" },
  { id: "barranquilla", label: "Barranquilla", country: "CO", countryName: "Colombia" },
  // Paraguay
  { id: "asuncion", label: "Asunción", country: "PY", countryName: "Paraguay" },
  { id: "ciudad-del-este", label: "Ciudad del Este", country: "PY", countryName: "Paraguay" },
  { id: "encarnacion", label: "Encarnación", country: "PY", countryName: "Paraguay" },
  // Uruguay
  { id: "montevideo", label: "Montevideo", country: "UY", countryName: "Uruguay" },
  { id: "punta-del-este", label: "Punta del Este", country: "UY", countryName: "Uruguay" },
  { id: "maldonado", label: "Maldonado", country: "UY", countryName: "Uruguay" },
  // Argentina
  { id: "buenos-aires", label: "Buenos Aires", country: "AR", countryName: "Argentina" },
  { id: "cordoba", label: "Córdoba", country: "AR", countryName: "Argentina" },
  { id: "rosario", label: "Rosario", country: "AR", countryName: "Argentina" },
  { id: "mendoza", label: "Mendoza", country: "AR", countryName: "Argentina" },
];

export type WherePanelProps = {
  /** Currently selected city ID */
  selectedCity: string | null;
  /** Callback when a city is selected */
  onCitySelect: (cityId: string, cityLabel: string) => void;
  /** Current search query */
  searchQuery: string;
  /** Callback when search query changes */
  onSearchChange: (query: string) => void;
  /** Callback when panel should close */
  onClose?: () => void;
  /** Additional class names */
  className?: string;
};

/**
 * Airbnb-style location selection panel with search and city list.
 */
export function WherePanel({
  selectedCity,
  onCitySelect,
  searchQuery,
  onSearchChange,
  onClose,
  className,
}: WherePanelProps) {
  const [isFocused, setIsFocused] = useState(false);

  // Filter cities based on search query
  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) {
      return CITIES;
    }
    const query = searchQuery.toLowerCase();
    return CITIES.filter(
      (city) =>
        city.label.toLowerCase().includes(query) || city.countryName.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Group cities by country
  const groupedCities = useMemo(() => {
    const groups: Record<string, CityOption[]> = {};
    for (const city of filteredCities) {
      if (!groups[city.countryName]) {
        groups[city.countryName] = [];
      }
      groups[city.countryName].push(city);
    }
    return groups;
  }, [filteredCities]);

  const handleCityClick = (city: CityOption) => {
    onCitySelect(city.id, city.label);
    onClose?.();
  };

  return (
    <div
      className={cn(
        "w-[380px] rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200/50",
        className
      )}
    >
      {/* Search input */}
      <div className="p-4 pb-2">
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl px-4 py-3 transition-all",
            isFocused ? "bg-neutral-100" : "bg-neutral-50"
          )}
        >
          <HugeiconsIcon
            className={cn("h-5 w-5", isFocused ? "text-orange-500" : "text-neutral-400")}
            icon={Search01Icon}
          />
          <input
            autoFocus
            className="flex-1 bg-transparent text-neutral-900 placeholder:text-neutral-500 focus:outline-none"
            onBlur={() => setIsFocused(false)}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Search destinations"
            type="text"
            value={searchQuery}
          />
        </div>
      </div>

      {/* City list */}
      <div className="max-h-[320px] overflow-y-auto p-2">
        {Object.entries(groupedCities).length > 0 ? (
          Object.entries(groupedCities).map(([countryName, cities]) => (
            <div className="mb-2 last:mb-0" key={countryName}>
              {/* Country header - only show if there's a search query or multiple countries */}
              {(searchQuery.trim() || Object.keys(groupedCities).length > 1) && (
                <div className="px-3 py-2 font-semibold text-neutral-500 text-xs uppercase tracking-wide">
                  {countryName}
                </div>
              )}

              {/* Cities */}
              {cities.map((city) => (
                <button
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all",
                    "hover:bg-neutral-100",
                    selectedCity === city.id && "bg-orange-50"
                  )}
                  key={city.id}
                  onClick={() => handleCityClick(city)}
                  type="button"
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg",
                      selectedCity === city.id ? "bg-orange-100" : "bg-neutral-100"
                    )}
                  >
                    <HugeiconsIcon
                      className={cn(
                        "h-5 w-5",
                        selectedCity === city.id ? "text-orange-600" : "text-neutral-600"
                      )}
                      icon={Location01Icon}
                    />
                  </div>
                  <div className="flex-1">
                    <div
                      className={cn(
                        "font-medium",
                        selectedCity === city.id ? "text-orange-600" : "text-neutral-900"
                      )}
                    >
                      {city.label}
                    </div>
                    <div className="text-neutral-500 text-sm">{city.countryName}</div>
                  </div>
                </button>
              ))}
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-neutral-500">
            No cities found for "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}

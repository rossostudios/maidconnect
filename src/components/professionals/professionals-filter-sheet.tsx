"use client";

import {
  Cancel01Icon,
  FilterIcon,
  Location01Icon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  serviceOptions: string[];
  cityOptions: string[];
  currentFilters: FilterState;
};

export type FilterState = {
  serviceFilter: string;
  cityFilter: string;
  ratingFilter: string;
  availableToday: boolean;
};

export function ProfessionalsFilterSheet({
  isOpen,
  onClose,
  onApply,
  serviceOptions,
  cityOptions,
  currentFilters,
}: Props) {
  const t = useTranslations("professionalsDirectory");

  // Local filter state
  const [serviceFilter, setServiceFilter] = useState(currentFilters.serviceFilter);
  const [cityFilter, setCityFilter] = useState(currentFilters.cityFilter);
  const [ratingFilter, setRatingFilter] = useState(currentFilters.ratingFilter);
  const [availableToday, setAvailableToday] = useState(currentFilters.availableToday);

  const ratingOptions = [
    { value: "all", label: t("filters.allRatings") },
    { value: "4.5", label: t("filters.rating45") },
    { value: "4.8", label: t("filters.rating48") },
  ];

  // Sync local state when currentFilters change
  useEffect(() => {
    setServiceFilter(currentFilters.serviceFilter);
    setCityFilter(currentFilters.cityFilter);
    setRatingFilter(currentFilters.ratingFilter);
    setAvailableToday(currentFilters.availableToday);
  }, [currentFilters]);

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleApply = () => {
    onApply({
      serviceFilter,
      cityFilter,
      ratingFilter,
      availableToday,
    });
    onClose();
  };

  const handleReset = () => {
    setServiceFilter("all");
    setCityFilter("all");
    setRatingFilter("all");
    setAvailableToday(false);
  };

  const activeFilterCount = [
    serviceFilter !== "all",
    cityFilter !== "all",
    ratingFilter !== "all",
    availableToday,
  ].filter(Boolean).length;

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-neutral-900/40 transition-opacity"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClose();
          }
        }}
        role="button"
        tabIndex={0}
      />

      {/* Bottom Sheet - Optimized for landscape */}
      <div
        className={`landscape:-translate-x-1/2 landscape: fixed right-0 bottom-0 left-0 z-50 max-h-[90vh] overflow-y-auto bg-neutral-50 shadow-2xl transition-transform duration-300 ease-out landscape:right-auto landscape:left-1/2 landscape:max-w-xl ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-neutral-200 border-b bg-neutral-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <HugeiconsIcon className="h-5 w-5 text-neutral-900" icon={FilterIcon} />
            <h2 className="font-semibold text-lg text-neutral-900">Filters</h2>
            {activeFilterCount > 0 && (
              <span className="flex h-6 min-w-[24px] items-center justify-center bg-orange-500 px-2 font-semibold text-white text-xs">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            aria-label="Close filters"
            className="flex h-10 w-10 items-center justify-center text-neutral-900 transition hover:bg-neutral-200 active:scale-95"
            onClick={onClose}
            type="button"
          >
            <HugeiconsIcon className="h-6 w-6" icon={Cancel01Icon} />
          </button>
        </div>

        {/* Filter Content */}
        <div className="space-y-6 p-6">
          {/* Service Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-semibold text-neutral-900 text-sm">
              <HugeiconsIcon className="h-5 w-5" icon={FilterIcon} />
              {t("filters.service")}
            </div>
            <select
              className="w-full border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-base text-neutral-900 transition focus:border-orange-500 focus:outline-none"
              onChange={(e) => setServiceFilter(e.target.value)}
              value={serviceFilter}
            >
              {serviceOptions.map((service) => (
                <option key={service} value={service}>
                  {service === "all" ? t("filters.allServices") : service}
                </option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-semibold text-neutral-900 text-sm">
              <HugeiconsIcon className="h-5 w-5" icon={Location01Icon} />
              {t("filters.city")}
            </div>
            <select
              className="w-full border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-base text-neutral-900 transition focus:border-orange-500 focus:outline-none"
              onChange={(e) => setCityFilter(e.target.value)}
              value={cityFilter}
            >
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city === "all" ? t("filters.allCities") : city}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-semibold text-neutral-900 text-sm">
              <HugeiconsIcon className="h-5 w-5" icon={Settings02Icon} />
              {t("filters.rating")}
            </div>
            <select
              className="w-full border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-base text-neutral-900 transition focus:border-orange-500 focus:outline-none"
              onChange={(e) => setRatingFilter(e.target.value)}
              value={ratingFilter}
            >
              {ratingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Available Today */}
          <div className="border border-neutral-200 bg-neutral-50 p-4">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                checked={availableToday}
                className="h-6 w-6 cursor-pointer rounded border-neutral-200 text-orange-500 focus:ring-orange-500"
                onChange={(e) => setAvailableToday(e.target.checked)}
                type="checkbox"
              />
              <span className="font-semibold text-base text-neutral-900">
                {t("filters.availableToday")}
              </span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 border-neutral-200 border-t bg-neutral-50 p-6">
          <div className="flex gap-3">
            <button
              className="flex-1 border-2 border-neutral-200 bg-neutral-50 px-6 py-3.5 font-semibold text-base text-neutral-900 transition hover:border-orange-500 active:scale-95"
              onClick={handleReset}
              type="button"
            >
              {t("filters.reset")}
            </button>
            <button
              className="flex-1 bg-orange-500 px-6 py-3.5 font-semibold text-base text-white shadow-[0_10px_40px_rgba(22,22,22,0.04)] transition hover:bg-orange-500 active:scale-95"
              onClick={handleApply}
              type="button"
            >
              Apply Filters
              {activeFilterCount > 0 && ` (${activeFilterCount})`}
            </button>
          </div>
        </div>

        {/* Bottom safe area padding */}
        <div className="h-2" />
      </div>
    </>
  );
}

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
        className="fixed inset-0 z-50 bg-[#0f172a]/40 backdrop-blur-sm transition-opacity"
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
        className={`landscape:-translate-x-1/2 fixed right-0 bottom-0 left-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-3xl bg-[#f8fafc] shadow-2xl transition-transform duration-300 ease-out landscape:right-auto landscape:left-1/2 landscape:max-w-xl landscape:rounded-2xl ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-[#e2e8f0] border-b bg-[#f8fafc] px-6 py-4">
          <div className="flex items-center gap-3">
            <HugeiconsIcon className="h-5 w-5 text-[#0f172a]" icon={FilterIcon} />
            <h2 className="font-semibold text-[#0f172a] text-lg">Filters</h2>
            {activeFilterCount > 0 && (
              <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-[#64748b] px-2 font-semibold text-[#f8fafc] text-xs">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            aria-label="Close filters"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#0f172a] transition hover:bg-[#e2e8f0] active:scale-95"
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
            <div className="flex items-center gap-2 font-semibold text-[#0f172a] text-sm">
              <HugeiconsIcon className="h-5 w-5" icon={FilterIcon} />
              {t("filters.service")}
            </div>
            <select
              className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3.5 text-[#0f172a] text-base transition focus:border-[#0f172a] focus:outline-none"
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
            <div className="flex items-center gap-2 font-semibold text-[#0f172a] text-sm">
              <HugeiconsIcon className="h-5 w-5" icon={Location01Icon} />
              {t("filters.city")}
            </div>
            <select
              className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3.5 text-[#0f172a] text-base transition focus:border-[#0f172a] focus:outline-none"
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
            <div className="flex items-center gap-2 font-semibold text-[#0f172a] text-sm">
              <HugeiconsIcon className="h-5 w-5" icon={Settings02Icon} />
              {t("filters.rating")}
            </div>
            <select
              className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3.5 text-[#0f172a] text-base transition focus:border-[#0f172a] focus:outline-none"
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
          <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                checked={availableToday}
                className="h-6 w-6 cursor-pointer rounded border-[#e2e8f0] text-[#64748b] focus:ring-[#64748b]"
                onChange={(e) => setAvailableToday(e.target.checked)}
                type="checkbox"
              />
              <span className="font-semibold text-[#0f172a] text-base">
                {t("filters.availableToday")}
              </span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 border-[#e2e8f0] border-t bg-[#f8fafc] p-6">
          <div className="flex gap-3">
            <button
              className="flex-1 rounded-full border-2 border-[#e2e8f0] bg-[#f8fafc] px-6 py-3.5 font-semibold text-[#0f172a] text-base transition hover:border-[#64748b] active:scale-95"
              onClick={handleReset}
              type="button"
            >
              {t("filters.reset")}
            </button>
            <button
              className="flex-1 rounded-full bg-[#64748b] px-6 py-3.5 font-semibold text-[#f8fafc] text-base shadow-[0_10px_40px_rgba(22,22,22,0.04)] transition hover:bg-[#64748b] active:scale-95"
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

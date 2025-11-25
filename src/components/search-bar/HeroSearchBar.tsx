"use client";

import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { SearchSegment } from "./SearchSegment";
import { SERVICES, ServicePanel } from "./ServicePanel";
import { WhenPanel } from "./WhenPanel";
import { WherePanel } from "./WherePanel";

type ActivePanel = "where" | "when" | "service" | null;

type DropdownPosition = {
  top: number;
  left: number;
  width: number;
};

export type HeroSearchBarProps = {
  /** Additional class names for the container */
  className?: string;
  /** Callback when search is submitted */
  onSearch?: (params: { service?: string; location?: string; date?: string }) => void;
};

/**
 * Airbnb-style search bar for the hero section.
 * Features three segments: Where, When, and Service type with rich dropdown panels.
 */
export function HeroSearchBar({ className, onSearch }: HeroSearchBarProps) {
  const t = useTranslations("home.hero");
  const router = useRouter();

  // State
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedServiceLabel, setSelectedServiceLabel] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedCityLabel, setSelectedCityLabel] = useState<string | null>(null);
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Portal state
  const [isMounted, setIsMounted] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition | null>(null);

  // Refs for click outside handling
  const containerRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Mount check for SSR safety with portals
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculate dropdown position when panel opens
  // Using fixed positioning relative to viewport (no scroll offset needed)
  useLayoutEffect(() => {
    if (activePanel && searchBarRef.current) {
      const rect = searchBarRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 12, // 12px gap below search bar
        left: rect.left,
        width: rect.width,
      });
    }
  }, [activePanel]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setActivePanel(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close panel on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActivePanel(null);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Close panel on scroll (prevents sticky dropdown issue)
  useEffect(() => {
    if (!activePanel) return;

    const handleScroll = () => {
      setActivePanel(null);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activePanel]);

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();

    if (selectedService) {
      params.set("service", selectedService);
    }
    if (selectedCity) {
      params.set("location", selectedCity);
    }
    if (selectedDate) {
      params.set("date", format(selectedDate, "yyyy-MM-dd"));
    }

    if (onSearch) {
      onSearch({
        service: selectedService || undefined,
        location: selectedCity || undefined,
        date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined,
      });
    } else {
      router.push(`/professionals${params.toString() ? `?${params.toString()}` : ""}`);
    }
  }, [selectedService, selectedCity, selectedDate, onSearch, router]);

  const handleServiceSelect = (serviceId: string, serviceLabel: string) => {
    setSelectedService(serviceId);
    setSelectedServiceLabel(serviceLabel);
    setActivePanel(null);
  };

  const handleCitySelect = (cityId: string, cityLabel: string) => {
    setSelectedCity(cityId);
    setSelectedCityLabel(cityLabel);
    setLocationQuery(cityLabel);
    setActivePanel(null);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setActivePanel(null);
  };

  // Format display values
  const whereDisplay = selectedCityLabel || t("searchBar.wherePlaceholder");
  const whenDisplay = selectedDate ? format(selectedDate, "MMM d") : t("searchBar.whenPlaceholder");
  const serviceDisplay = selectedServiceLabel || t("searchBar.servicePlaceholder");

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {/* Desktop Search Bar */}
      <div className="hidden lg:block">
        <div
          className="flex items-center rounded-full bg-white p-2 shadow-2xl ring-1 ring-black/5"
          ref={searchBarRef}
        >
          {/* Where Segment */}
          <SearchSegment
            isActive={activePanel === "where"}
            label={t("searchBar.where")}
            onClick={() => setActivePanel(activePanel === "where" ? null : "where")}
          >
            <span
              className={cn(
                "block truncate text-sm",
                selectedCityLabel ? "text-neutral-900" : "text-neutral-500"
              )}
            >
              {whereDisplay}
            </span>
          </SearchSegment>

          {/* When Segment */}
          <SearchSegment
            isActive={activePanel === "when"}
            label={t("searchBar.when")}
            onClick={() => setActivePanel(activePanel === "when" ? null : "when")}
          >
            <span
              className={cn(
                "block truncate text-sm",
                selectedDate ? "text-neutral-900" : "text-neutral-500"
              )}
            >
              {whenDisplay}
            </span>
          </SearchSegment>

          {/* Service Segment */}
          <SearchSegment
            isActive={activePanel === "service"}
            label={t("searchBar.service")}
            onClick={() => setActivePanel(activePanel === "service" ? null : "service")}
            showDivider={false}
          >
            <span
              className={cn(
                "block truncate text-sm",
                selectedServiceLabel ? "text-neutral-900" : "text-neutral-500"
              )}
            >
              {serviceDisplay}
            </span>
          </SearchSegment>

          {/* Search Button */}
          <button
            className={cn(
              "ml-2 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full transition-all",
              "bg-orange-500 hover:bg-orange-600 active:scale-95",
              "shadow-lg shadow-orange-500/25"
            )}
            onClick={handleSearch}
            type="button"
          >
            <HugeiconsIcon className="h-5 w-5 text-white" icon={Search01Icon} />
            <span className="sr-only">{t("searchBar.search")}</span>
          </button>
        </div>
      </div>

      {/* Desktop Dropdown Panels - Rendered via Portal to escape overflow:hidden */}
      {isMounted &&
        activePanel &&
        dropdownPosition &&
        createPortal(
          <div
            className="fixed z-[9999]"
            ref={panelRef}
            style={{
              top: dropdownPosition.top,
              left:
                activePanel === "where"
                  ? dropdownPosition.left
                  : activePanel === "when"
                    ? dropdownPosition.left + dropdownPosition.width / 2
                    : dropdownPosition.left + dropdownPosition.width,
              transform:
                activePanel === "when"
                  ? "translateX(-50%)"
                  : activePanel === "service"
                    ? "translateX(-100%)"
                    : undefined,
            }}
          >
            <div className="fade-in-0 zoom-in-95 hidden animate-in duration-200 lg:block">
              {activePanel === "where" && (
                <WherePanel
                  onCitySelect={handleCitySelect}
                  onClose={() => setActivePanel(null)}
                  onSearchChange={setLocationQuery}
                  searchQuery={locationQuery}
                  selectedCity={selectedCity}
                />
              )}
              {activePanel === "when" && (
                <WhenPanel
                  onClose={() => setActivePanel(null)}
                  onDateSelect={handleDateSelect}
                  selectedDate={selectedDate}
                />
              )}
              {activePanel === "service" && (
                <ServicePanel
                  onClose={() => setActivePanel(null)}
                  onServiceSelect={handleServiceSelect}
                  selectedService={selectedService}
                />
              )}
            </div>
          </div>,
          document.body
        )}

      {/* Mobile Search Bar */}
      <div className="lg:hidden">
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
          {/* Service */}
          <button
            className="flex w-full items-center justify-between border-neutral-100 border-b px-4 py-4 text-left transition-all hover:bg-neutral-50"
            onClick={() => setActivePanel(activePanel === "service" ? null : "service")}
            type="button"
          >
            <div>
              <span className="block font-semibold text-neutral-900 text-xs">
                {t("searchBar.service")}
              </span>
              <span
                className={cn(
                  "mt-0.5 block text-sm",
                  selectedServiceLabel ? "text-neutral-900" : "text-neutral-500"
                )}
              >
                {serviceDisplay}
              </span>
            </div>
          </button>

          {/* Where */}
          <button
            className="flex w-full items-center justify-between border-neutral-100 border-b px-4 py-4 text-left transition-all hover:bg-neutral-50"
            onClick={() => setActivePanel(activePanel === "where" ? null : "where")}
            type="button"
          >
            <div>
              <span className="block font-semibold text-neutral-900 text-xs">
                {t("searchBar.where")}
              </span>
              <span
                className={cn(
                  "mt-0.5 block text-sm",
                  selectedCityLabel ? "text-neutral-900" : "text-neutral-500"
                )}
              >
                {whereDisplay}
              </span>
            </div>
          </button>

          {/* When */}
          <button
            className="flex w-full items-center justify-between px-4 py-4 text-left transition-all hover:bg-neutral-50"
            onClick={() => setActivePanel(activePanel === "when" ? null : "when")}
            type="button"
          >
            <div>
              <span className="block font-semibold text-neutral-900 text-xs">
                {t("searchBar.when")}
              </span>
              <span
                className={cn(
                  "mt-0.5 block text-sm",
                  selectedDate ? "text-neutral-900" : "text-neutral-500"
                )}
              >
                {whenDisplay}
              </span>
            </div>
          </button>
        </div>

        {/* Mobile Search Button */}
        <button
          className={cn(
            "mt-3 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 font-semibold text-white transition-all",
            "bg-orange-500 hover:bg-orange-600 active:scale-[0.98]",
            "shadow-lg shadow-orange-500/25"
          )}
          onClick={handleSearch}
          type="button"
        >
          <HugeiconsIcon className="h-5 w-5" icon={Search01Icon} />
          <span>{t("searchBar.search")}</span>
        </button>

        {/* Mobile Panels (modal-style) */}
        {activePanel && (
          <div className="fixed inset-0 z-50 flex items-end bg-neutral-900/80">
            <div className="slide-in-from-bottom w-full animate-in duration-300">
              <div className="rounded-t-3xl bg-white p-4 pb-8">
                {/* Close button */}
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-lg">
                    {activePanel === "where" && t("searchBar.where")}
                    {activePanel === "when" && t("searchBar.when")}
                    {activePanel === "service" && t("searchBar.service")}
                  </h3>
                  <button
                    className="rounded-full p-2 hover:bg-neutral-100"
                    onClick={() => setActivePanel(null)}
                    type="button"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M6 18L18 6M6 6l12 12"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </button>
                </div>

                {activePanel === "where" && (
                  <WherePanel
                    className="w-full shadow-none ring-0"
                    onCitySelect={handleCitySelect}
                    onClose={() => setActivePanel(null)}
                    onSearchChange={setLocationQuery}
                    searchQuery={locationQuery}
                    selectedCity={selectedCity}
                  />
                )}
                {activePanel === "when" && (
                  <WhenPanel
                    className="w-full shadow-none ring-0"
                    onClose={() => setActivePanel(null)}
                    onDateSelect={handleDateSelect}
                    selectedDate={selectedDate}
                  />
                )}
                {activePanel === "service" && (
                  <ServicePanel
                    className="w-full shadow-none ring-0"
                    onClose={() => setActivePanel(null)}
                    onServiceSelect={handleServiceSelect}
                    selectedService={selectedService}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Re-export SERVICES for convenience
export { SERVICES };

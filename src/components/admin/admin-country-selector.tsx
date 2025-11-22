"use client";

import { Location03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Select as AriaSelect,
  Button,
  ListBox,
  ListBoxItem,
  Popover,
  SelectValue,
} from "react-aria-components";
import { geistSans } from "@/app/fonts";
import {
  ALL_COUNTRIES,
  type CountryFilterValue,
  getCountryFilterLabel,
  getCountryFlag,
  useAdminCountryFilter,
} from "@/lib/contexts/AdminCountryFilterContext";
import type { CountryCode } from "@/lib/shared/config/territories";
import { cn } from "@/lib/utils/core";

/**
 * Admin Country Selector
 *
 * Dropdown to filter admin panel data by country.
 * Persists selection in localStorage via AdminCountryFilterContext.
 *
 * Features:
 * - "All Countries" option for viewing aggregated data
 * - Flag emoji + country name for each option
 * - Anthropic-style rounded corners
 * - Orange accent for active state
 *
 * Usage:
 * ```tsx
 * <AdminCountryFilterProvider>
 *   <AdminCountrySelector />
 *   {/\* Rest of admin UI *\/}
 * </AdminCountryFilterProvider>
 * ```
 */
export function AdminCountrySelector() {
  const { selectedCountry, setSelectedCountry } = useAdminCountryFilter();

  const countries: CountryFilterValue[] = [
    ALL_COUNTRIES,
    "CO" as CountryCode,
    "PY" as CountryCode,
    "UY" as CountryCode,
    "AR" as CountryCode,
  ];

  return (
    <AriaSelect
      aria-label="Filter by country"
      onSelectionChange={(key) => setSelectedCountry(key as CountryFilterValue)}
      selectedKey={selectedCountry}
    >
      <Button
        className={cn(
          // Anthropic rounded corners + refined borders
          "group flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm transition-all hover:border-orange-500 hover:bg-orange-50",
          // Geist Sans for text
          geistSans.className,
          // Focus ring
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
        )}
      >
        <HugeiconsIcon
          className="h-4 w-4 text-neutral-500 group-hover:text-orange-500"
          icon={Location03Icon}
        />
        <SelectValue className="font-medium text-neutral-900">
          {({ selectedText }) => (
            <span className="flex items-center gap-1.5">
              {selectedCountry !== ALL_COUNTRIES && (
                <span>{getCountryFlag(selectedCountry as CountryCode)}</span>
              )}
              <span>{selectedText}</span>
            </span>
          )}
        </SelectValue>
      </Button>

      <Popover
        className={cn(
          // Anthropic rounded corners
          "rounded-lg border border-neutral-200 bg-white shadow-neutral-900/10 shadow-xl",
          // Animations
          "data-[entering]:fade-in-0 data-[entering]:zoom-in-95 data-[entering]:animate-in",
          "data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95 data-[exiting]:animate-out"
        )}
        offset={8}
      >
        <ListBox
          className="max-h-80 overflow-y-auto p-1"
          items={countries.map((country) => ({
            id: country,
            label: getCountryFilterLabel(country),
            flag: country !== ALL_COUNTRIES ? getCountryFlag(country as CountryCode) : "🌍",
          }))}
        >
          {(item) => (
            <ListBoxItem
              className={cn(
                // Anthropic rounded corners
                "flex cursor-pointer items-center gap-2.5 rounded px-3 py-2 text-sm outline-none transition-colors",
                geistSans.className,
                // Hover state (orange accent)
                "hover:bg-orange-50 hover:text-orange-600",
                // Selected state
                "data-[selected]:bg-orange-100 data-[selected]:font-semibold data-[selected]:text-orange-700",
                // Focus state
                "data-[focused]:bg-orange-50 data-[focused]:text-orange-600"
              )}
              id={item.id}
              textValue={item.label}
            >
              <span className="text-base">{item.flag}</span>
              <span className="flex-1">{item.label}</span>
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </AriaSelect>
  );
}

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { CountryCode } from "@/lib/shared/config/territories";

/**
 * Admin Country Filter Context
 *
 * Provides country filtering state for admin panel pages.
 * Allows admins to filter data by specific country or view all countries.
 *
 * Features:
 * - Persists selected country in localStorage
 * - "All Countries" option for viewing aggregated data
 * - Typed country selection with CountryCode union
 *
 * Usage:
 * ```tsx
 * const { selectedCountry, setSelectedCountry, isAllCountries } = useAdminCountryFilter();
 *
 * // Filter professionals by country
 * const query = supabase
 *   .from('professional_profiles')
 *   .select('*');
 *
 * if (!isAllCountries) {
 *   query = query.eq('country_code', selectedCountry);
 * }
 * ```
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Special value representing "all countries" filter option
 */
export const ALL_COUNTRIES = "ALL" as const;

/**
 * Country filter value - specific country or "all countries"
 */
export type CountryFilterValue = CountryCode | typeof ALL_COUNTRIES;

/**
 * Admin country filter context value
 */
export interface AdminCountryFilterContextValue {
  /** Currently selected country filter */
  selectedCountry: CountryFilterValue;
  /** Update the selected country filter */
  setSelectedCountry: (country: CountryFilterValue) => void;
  /** Whether "All Countries" is selected */
  isAllCountries: boolean;
}

// ============================================================================
// Context
// ============================================================================

const AdminCountryFilterContext = createContext<AdminCountryFilterContextValue | undefined>(
  undefined
);

// ============================================================================
// Provider
// ============================================================================

const STORAGE_KEY = "casaora_admin_country_filter";

export interface AdminCountryFilterProviderProps {
  children: React.ReactNode;
}

export function AdminCountryFilterProvider({ children }: AdminCountryFilterProviderProps) {
  // Initialize from localStorage, default to "ALL"
  const [selectedCountry, setSelectedCountryState] = useState<CountryFilterValue>(() => {
    if (typeof window === "undefined") {
      return ALL_COUNTRIES;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CountryFilterValue;
        // Validate stored value
        if (parsed === ALL_COUNTRIES || ["CO", "PY", "UY", "AR"].includes(parsed)) {
          return parsed;
        }
      }
    } catch (error) {
      console.error("[AdminCountryFilter] Failed to load from localStorage:", error);
    }

    return ALL_COUNTRIES;
  });

  // Persist to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedCountry));
    } catch (error) {
      console.error("[AdminCountryFilter] Failed to save to localStorage:", error);
    }
  }, [selectedCountry]);

  const setSelectedCountry = (country: CountryFilterValue) => {
    setSelectedCountryState(country);
  };

  const isAllCountries = selectedCountry === ALL_COUNTRIES;

  const value: AdminCountryFilterContextValue = {
    selectedCountry,
    setSelectedCountry,
    isAllCountries,
  };

  return (
    <AdminCountryFilterContext.Provider value={value}>
      {children}
    </AdminCountryFilterContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Access admin country filter state
 *
 * @throws Error if used outside AdminCountryFilterProvider
 *
 * @example
 * ```tsx
 * function ProfessionalsListPage() {
 *   const { selectedCountry, isAllCountries } = useAdminCountryFilter();
 *
 *   const query = supabase
 *     .from('professional_profiles')
 *     .select('*');
 *
 *   if (!isAllCountries) {
 *     query.eq('country_code', selectedCountry);
 *   }
 *
 *   // ... rest of query logic
 * }
 * ```
 */
export function useAdminCountryFilter() {
  const context = useContext(AdminCountryFilterContext);

  if (context === undefined) {
    throw new Error("useAdminCountryFilter must be used within AdminCountryFilterProvider");
  }

  return context;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get display label for country filter value
 */
export function getCountryFilterLabel(country: CountryFilterValue): string {
  if (country === ALL_COUNTRIES) {
    return "All Countries";
  }

  const labels: Record<CountryCode, string> = {
    CO: "Colombia",
    PY: "Paraguay",
    UY: "Uruguay",
    AR: "Argentina",
  };

  return labels[country] || country;
}

/**
 * Get flag emoji for country (for UI display)
 */
export function getCountryFlag(country: CountryCode): string {
  const flags: Record<CountryCode, string> = {
    CO: "🇨🇴",
    PY: "🇵🇾",
    UY: "🇺🇾",
    AR: "🇦🇷",
  };

  return flags[country] || "🌍";
}

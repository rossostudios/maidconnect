"use client";

/**
 * MarketContext - Global Market Selection State
 *
 * Manages selected country and city for multi-market operations.
 * Persists selection to localStorage for seamless user experience.
 *
 * Usage:
 * ```tsx
 * const { country, city, setCountry, setCity, marketInfo } = useMarket();
 * ```
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  COUNTRIES,
  type CountryCode,
  DEFAULT_MARKET,
  getCitiesByCountry,
  getCurrencyByCountry,
} from "@/lib/shared/config/territories";

/**
 * Market context value
 */
interface MarketContextValue {
  /**
   * Selected country code (e.g., "CO", "PY", "UY", "AR")
   */
  country: CountryCode;
  /**
   * Selected city slug (e.g., "medellin", "asuncion")
   */
  city: string | null;
  /**
   * Update selected country
   */
  setCountry: (country: CountryCode) => void;
  /**
   * Update selected city
   */
  setCity: (city: string) => void;
  /**
   * Computed market information
   */
  marketInfo: {
    countryName: string;
    cityName: string | null;
    currencyCode: string;
    currencySymbol: string;
    paymentProcessor: "stripe" | "paypal";
  };
}

const MarketContext = createContext<MarketContextValue | undefined>(undefined);

const STORAGE_KEY = "casaora_market_selection";

/**
 * MarketProvider - Provides market selection state to the app
 */
export function MarketProvider({ children }: { children: React.ReactNode }) {
  const [country, setCountryState] = useState<CountryCode>(DEFAULT_MARKET);
  const [city, setCityState] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.country && parsed.country in COUNTRIES) {
          setCountryState(parsed.country);
          if (parsed.city) {
            setCityState(parsed.city);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load market selection:", error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Persist to localStorage when changed
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ country, city }));
      } catch (error) {
        console.error("Failed to save market selection:", error);
      }
    }
  }, [country, city, isHydrated]);

  const setCountry = (newCountry: CountryCode) => {
    setCountryState(newCountry);
    // Reset city when country changes
    setCityState(null);
  };

  const setCity = (newCity: string) => {
    setCityState(newCity);
  };

  // Compute market info
  const countryConfig = COUNTRIES[country];
  const cityConfig = city ? getCitiesByCountry(country).find((c) => c.value === city) : null;
  const currency = getCurrencyByCountry(country);

  const marketInfo = {
    countryName: countryConfig.nameEs,
    cityName: cityConfig?.label || null,
    currencyCode: currency.code,
    currencySymbol: currency.symbol,
    paymentProcessor: countryConfig.paymentProcessor,
  };

  return (
    <MarketContext.Provider
      value={{
        country,
        city,
        setCountry,
        setCity,
        marketInfo,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
}

/**
 * useMarket Hook - Access market selection state
 *
 * @throws {Error} If used outside MarketProvider
 */
export function useMarket() {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error("useMarket must be used within MarketProvider");
  }
  return context;
}

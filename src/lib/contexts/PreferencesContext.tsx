"use client";

/**
 * PreferencesContext - User Display Preferences
 *
 * Manages display preferences that are separate from the user's operational market:
 * - Display currency: Which currency to show prices in (may differ from market currency)
 * - Auto-translate: Whether to auto-translate user-generated content
 *
 * Note: Language is handled by next-intl, Region/Market is handled by MarketContext.
 *
 * Usage:
 * ```tsx
 * const { displayCurrency, setDisplayCurrency, autoTranslate, toggleAutoTranslate } = usePreferences();
 * ```
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { CURRENCIES, type CurrencyCode } from "@/lib/shared/config/territories";

// Cookie names for persistence (1 year expiry, like NEXT_LOCALE)
const CURRENCY_COOKIE = "CASAORA_CURRENCY";
const TRANSLATE_COOKIE = "CASAORA_TRANSLATE";

/**
 * Preferences context value
 */
type PreferencesContextValue = {
  /**
   * Display currency for showing prices (may differ from market currency)
   * Default: User's market currency, or USD for new visitors
   */
  displayCurrency: CurrencyCode;
  /**
   * Update display currency
   */
  setDisplayCurrency: (currency: CurrencyCode) => void;
  /**
   * Whether to auto-translate user-generated content (reviews, descriptions)
   */
  autoTranslate: boolean;
  /**
   * Toggle auto-translate on/off
   */
  toggleAutoTranslate: () => void;
  /**
   * Set auto-translate explicitly
   */
  setAutoTranslate: (value: boolean) => void;
  /**
   * Whether preferences have been hydrated from cookies
   */
  isHydrated: boolean;
};

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

/**
 * Get cookie value by name
 */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
}

/**
 * Set cookie with 1 year expiry
 */
function setCookie(name: string, value: string) {
  if (typeof document === "undefined") {
    return;
  }
  const maxAge = 60 * 60 * 24 * 365; // 1 year in seconds
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/**
 * PreferencesProvider - Provides display preferences state to the app
 */
export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  // Default to USD for new visitors (Airbnb-style)
  const [displayCurrency, setDisplayCurrencyState] = useState<CurrencyCode>("USD");
  const [autoTranslate, setAutoTranslateState] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from cookies on mount
  useEffect(() => {
    try {
      // Read display currency
      const storedCurrency = getCookie(CURRENCY_COOKIE);
      if (storedCurrency && storedCurrency in CURRENCIES) {
        setDisplayCurrencyState(storedCurrency as CurrencyCode);
      }

      // Read auto-translate setting
      const storedTranslate = getCookie(TRANSLATE_COOKIE);
      if (storedTranslate !== null) {
        setAutoTranslateState(storedTranslate === "true");
      }
    } catch (error) {
      console.error("Failed to load preferences:", error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const setDisplayCurrency = useCallback((currency: CurrencyCode) => {
    setDisplayCurrencyState(currency);
    setCookie(CURRENCY_COOKIE, currency);
  }, []);

  const setAutoTranslate = useCallback((value: boolean) => {
    setAutoTranslateState(value);
    setCookie(TRANSLATE_COOKIE, String(value));
  }, []);

  const toggleAutoTranslate = useCallback(() => {
    setAutoTranslate(!autoTranslate);
  }, [autoTranslate, setAutoTranslate]);

  return (
    <PreferencesContext.Provider
      value={{
        displayCurrency,
        setDisplayCurrency,
        autoTranslate,
        toggleAutoTranslate,
        setAutoTranslate,
        isHydrated,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

/**
 * usePreferences Hook - Access display preferences state
 *
 * @throws {Error} If used outside PreferencesProvider
 */
export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }
  return context;
}

/**
 * Get currency display info
 */
export function getCurrencyDisplayInfo(code: CurrencyCode) {
  const currency = CURRENCIES[code];
  return {
    code: currency.code,
    symbol: currency.symbol,
    name: getCurrencyName(code),
  };
}

/**
 * Get human-readable currency name
 */
function getCurrencyName(code: CurrencyCode): string {
  const names: Record<CurrencyCode, string> = {
    COP: "Colombian Peso",
    PYG: "Paraguayan Guaraní",
    UYU: "Uruguayan Peso",
    ARS: "Argentine Peso",
    USD: "United States Dollar",
  };
  return names[code];
}

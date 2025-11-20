/**
 * Centralized Territories Configuration
 *
 * This file contains all country, city, and currency data for Casaora's
 * multi-country expansion. Use this instead of hardcoding values throughout
 * the codebase.
 *
 * Supported Countries:
 * - Colombia (CO)
 * - Paraguay (PY)
 * - Uruguay (UY)
 * - Argentina (AR)
 */

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * ISO 3166-1 alpha-2 country codes
 */
export type CountryCode = "CO" | "PY" | "UY" | "AR";

/**
 * Supported Markets (Operational Countries)
 *
 * These are the countries where Casaora actively operates. This is distinct
 * from language support - all markets are Spanish-speaking, but users can
 * select English UI in any market.
 *
 * - CO (Colombia): Stripe payments, 7 cities, established market
 * - PY (Paraguay): PayPal payments, 3 cities, expanding
 * - UY (Uruguay): PayPal payments, 3 cities, expanding
 * - AR (Argentina): PayPal payments, 4 cities, expanding
 */
export const SUPPORTED_MARKETS = ["CO", "PY", "UY", "AR"] as const;
export type SupportedMarket = (typeof SUPPORTED_MARKETS)[number];

/**
 * Default operational market (Colombia)
 */
export const DEFAULT_MARKET: SupportedMarket = "CO";

/**
 * ISO 4217 currency codes
 */
export type CurrencyCode = "COP" | "PYG" | "UYU" | "ARS" | "USD";

/**
 * Supported payment processors
 */
export type PaymentProcessor = "stripe" | "paypal";

/**
 * Country configuration
 */
export interface CountryConfig {
  code: CountryCode;
  nameEn: string;
  nameEs: string;
  currencyCode: CurrencyCode;
  paymentProcessor: PaymentProcessor;
  isActive: boolean;
}

/**
 * City configuration
 */
export interface CityConfig {
  value: string;  // Slug for forms
  label: string;  // Display name
  countryCode: CountryCode;
}

/**
 * Neighborhood configuration
 */
export interface NeighborhoodConfig {
  value: string;  // Slug for forms
  label: string;  // Display name
  citySlug: string;
}

// ============================================================================
// Country Configurations
// ============================================================================

export const COUNTRIES: Record<CountryCode, CountryConfig> = {
  CO: {
    code: "CO",
    nameEn: "Colombia",
    nameEs: "Colombia",
    currencyCode: "COP",
    paymentProcessor: "stripe",
    isActive: true,
  },
  PY: {
    code: "PY",
    nameEn: "Paraguay",
    nameEs: "Paraguay",
    currencyCode: "PYG",
    paymentProcessor: "paypal",
    isActive: true,
  },
  UY: {
    code: "UY",
    nameEn: "Uruguay",
    nameEs: "Uruguay",
    currencyCode: "UYU",
    paymentProcessor: "paypal",
    isActive: true,
  },
  AR: {
    code: "AR",
    nameEn: "Argentina",
    nameEs: "Argentina",
    currencyCode: "ARS",
    paymentProcessor: "paypal",
    isActive: true,
  },
} as const;

/**
 * Get all active countries
 */
export const ACTIVE_COUNTRIES = Object.values(COUNTRIES).filter(
  (country) => country.isActive
);

/**
 * Country options for dropdowns (sorted alphabetically by Spanish name)
 */
export const COUNTRY_OPTIONS = ACTIVE_COUNTRIES.map((country) => ({
  value: country.code,
  label: country.nameEs,
})).sort((a, b) => a.label.localeCompare(b.label, "es"));

// ============================================================================
// City Configurations
// ============================================================================

/**
 * All cities grouped by country
 */
export const CITIES_BY_COUNTRY: Record<CountryCode, CityConfig[]> = {
  CO: [
    { value: "bogota", label: "Bogotá", countryCode: "CO" },
    { value: "medellin", label: "Medellín", countryCode: "CO" },
    { value: "cali", label: "Cali", countryCode: "CO" },
    { value: "barranquilla", label: "Barranquilla", countryCode: "CO" },
    { value: "cartagena", label: "Cartagena", countryCode: "CO" },
    { value: "bucaramanga", label: "Bucaramanga", countryCode: "CO" },
    { value: "pereira", label: "Pereira", countryCode: "CO" },
  ],
  PY: [
    { value: "asuncion", label: "Asunción", countryCode: "PY" },
    { value: "ciudad-del-este", label: "Ciudad del Este", countryCode: "PY" },
    { value: "encarnacion", label: "Encarnación", countryCode: "PY" },
  ],
  UY: [
    { value: "montevideo", label: "Montevideo", countryCode: "UY" },
    { value: "punta-del-este", label: "Punta del Este", countryCode: "UY" },
    { value: "maldonado", label: "Maldonado", countryCode: "UY" },
  ],
  AR: [
    { value: "buenos-aires", label: "Buenos Aires", countryCode: "AR" },
    { value: "cordoba", label: "Córdoba", countryCode: "AR" },
    { value: "rosario", label: "Rosario", countryCode: "AR" },
    { value: "mendoza", label: "Mendoza", countryCode: "AR" },
  ],
} as const;

/**
 * All cities (flattened array)
 */
export const ALL_CITIES = Object.values(CITIES_BY_COUNTRY).flat();

/**
 * Legacy: Colombia cities only (for backward compatibility)
 * @deprecated Use CITIES_BY_COUNTRY.CO instead
 */
export const CITIES = CITIES_BY_COUNTRY.CO.map((city) => city.label);

/**
 * Get cities for a specific country
 */
export function getCitiesByCountry(countryCode: CountryCode): CityConfig[] {
  return CITIES_BY_COUNTRY[countryCode] || [];
}

/**
 * Get city options for dropdowns (sorted alphabetically)
 */
export function getCityOptions(countryCode: CountryCode) {
  return getCitiesByCountry(countryCode)
    .map((city) => ({
      value: city.value,
      label: city.label,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "es"));
}

// ============================================================================
// Neighborhood Configurations
// ============================================================================

/**
 * Neighborhoods grouped by city slug
 */
export const NEIGHBORHOODS_BY_CITY: Record<string, NeighborhoodConfig[]> = {
  // Colombia - Bogotá
  bogota: [
    { value: "chapinero", label: "Chapinero", citySlug: "bogota" },
    { value: "usaquen", label: "Usaquén", citySlug: "bogota" },
    { value: "suba", label: "Suba", citySlug: "bogota" },
    { value: "engativa", label: "Engativá", citySlug: "bogota" },
    { value: "kennedy", label: "Kennedy", citySlug: "bogota" },
    { value: "fontibon", label: "Fontibón", citySlug: "bogota" },
    { value: "teusaquillo", label: "Teusaquillo", citySlug: "bogota" },
  ],

  // Colombia - Medellín
  medellin: [
    { value: "el-poblado", label: "El Poblado", citySlug: "medellin" },
    { value: "laureles", label: "Laureles", citySlug: "medellin" },
    { value: "envigado", label: "Envigado", citySlug: "medellin" },
    { value: "sabaneta", label: "Sabaneta", citySlug: "medellin" },
    { value: "belen", label: "Belén", citySlug: "medellin" },
  ],

  // Colombia - Cali
  cali: [
    { value: "granada", label: "Granada", citySlug: "cali" },
    { value: "san-fernando", label: "San Fernando", citySlug: "cali" },
    { value: "ciudad-jardin", label: "Ciudad Jardín", citySlug: "cali" },
    { value: "el-penon", label: "El Peñón", citySlug: "cali" },
  ],

  // Colombia - Cartagena
  cartagena: [
    { value: "bocagrande", label: "Bocagrande", citySlug: "cartagena" },
    { value: "castillogrande", label: "Castillogrande", citySlug: "cartagena" },
    { value: "manga", label: "Manga", citySlug: "cartagena" },
    { value: "getsemani", label: "Getsemaní", citySlug: "cartagena" },
  ],

  // Colombia - Barranquilla
  barranquilla: [
    { value: "el-prado", label: "El Prado", citySlug: "barranquilla" },
    { value: "riomar", label: "Riomar", citySlug: "barranquilla" },
    { value: "alto-prado", label: "Alto Prado", citySlug: "barranquilla" },
    { value: "villa-country", label: "Villa Country", citySlug: "barranquilla" },
  ],

  // Note: Neighborhoods for new countries (PY, UY, AR) can be added here
  // in future iterations as we gather local market data
} as const;

/**
 * Get neighborhoods for a specific city
 */
export function getNeighborhoodsByCity(
  citySlug: string
): NeighborhoodConfig[] {
  return NEIGHBORHOODS_BY_CITY[citySlug] || [];
}

/**
 * Get neighborhood options for dropdowns (sorted alphabetically)
 */
export function getNeighborhoodOptions(citySlug: string) {
  return getNeighborhoodsByCity(citySlug)
    .map((neighborhood) => ({
      value: neighborhood.value,
      label: neighborhood.label,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "es"));
}

// ============================================================================
// Currency Configurations
// ============================================================================

/**
 * Currency metadata
 */
export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  decimals: number;
  thousandsSeparator: string;
  decimalSeparator: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  COP: {
    code: "COP",
    symbol: "$",
    decimals: 0,
    thousandsSeparator: ".",
    decimalSeparator: ",",
  },
  PYG: {
    code: "PYG",
    symbol: "₲",
    decimals: 0,
    thousandsSeparator: ".",
    decimalSeparator: ",",
  },
  UYU: {
    code: "UYU",
    symbol: "$U",
    decimals: 2,
    thousandsSeparator: ".",
    decimalSeparator: ",",
  },
  ARS: {
    code: "ARS",
    symbol: "$",
    decimals: 2,
    thousandsSeparator: ".",
    decimalSeparator: ",",
  },
  USD: {
    code: "USD",
    symbol: "$",
    decimals: 2,
    thousandsSeparator: ",",
    decimalSeparator: ".",
  },
} as const;

/**
 * Get currency configuration by code
 */
export function getCurrencyConfig(code: CurrencyCode): CurrencyConfig {
  return CURRENCIES[code];
}

/**
 * Get currency by country
 */
export function getCurrencyByCountry(countryCode: CountryCode): CurrencyConfig {
  const country = COUNTRIES[countryCode];
  return CURRENCIES[country.currencyCode];
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a country uses Stripe
 */
export function usesStripe(countryCode: CountryCode): boolean {
  return COUNTRIES[countryCode].paymentProcessor === "stripe";
}

/**
 * Check if a country uses PayPal
 */
export function usesPayPal(countryCode: CountryCode): boolean {
  return COUNTRIES[countryCode].paymentProcessor === "paypal";
}

/**
 * Get country by code (with validation)
 */
export function getCountry(code: string): CountryConfig | null {
  if (code in COUNTRIES) {
    return COUNTRIES[code as CountryCode];
  }
  return null;
}

/**
 * Validate country code
 */
export function isValidCountryCode(code: string): code is CountryCode {
  return code in COUNTRIES;
}

/**
 * Check if country is an operational market
 *
 * Use this to validate that a country is where Casaora actively operates.
 * This is separate from language support - users can select English UI
 * in any operational market.
 *
 * @param countryCode - Country code to check (e.g., "CO", "PY", "UY", "AR")
 * @returns true if the country is in SUPPORTED_MARKETS and isActive
 *
 * @example
 * isOperationalMarket("CO") // true (Colombia is operational)
 * isOperationalMarket("BR") // false (Brazil not supported)
 */
export function isOperationalMarket(countryCode: string): countryCode is SupportedMarket {
  return SUPPORTED_MARKETS.includes(countryCode as SupportedMarket) &&
         (countryCode in COUNTRIES ? COUNTRIES[countryCode as CountryCode].isActive : false);
}

/**
 * Get country name in locale
 */
export function getCountryName(
  countryCode: CountryCode,
  locale: "en" | "es" = "es"
): string {
  const country = COUNTRIES[countryCode];
  return locale === "en" ? country.nameEn : country.nameEs;
}

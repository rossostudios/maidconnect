/**
 * Multi-Country Pricing Configuration
 * Sprint: Multi-Country Expansion (Phase 2.3)
 *
 * Defines country-specific pricing rules, fees, and constraints.
 * All monetary values in minor currency units (cents/centavos).
 */

import type { CountryCode } from "./territories";

// ============================================================================
// Types
// ============================================================================

export type CurrencyCode = "COP" | "PYG" | "UYU" | "ARS" | "USD";

export type PaymentProcessor = "stripe" | "paypal";

export type CountryPricingConfig = {
  /** ISO 4217 currency code */
  currency: CurrencyCode;

  /** Platform commission rates (percentage-based, no fixed fees) */
  commission: {
    /** Commission rate for marketplace bookings (decimal, e.g., 0.15 = 15%) */
    marketplaceRate: number;
  };

  /** Service pricing constraints */
  constraints: {
    /** Minimum service price in minor units */
    minPrice: number;
    /** Maximum service price in minor units */
    maxPrice: number;
    /** Background check fee in minor units */
    backgroundCheckFee: number;
  };

  /** Payment processor configuration */
  paymentProcessors: {
    /** Primary processor for this market */
    primary: PaymentProcessor;
    /** Fallback processor if primary fails */
    fallback?: PaymentProcessor;
    /** Supported processors for this currency */
    supported: PaymentProcessor[];
  };

  /** Currency formatting rules */
  formatting: {
    /** Number of decimal places (0 for COP/PYG, 2 for others) */
    decimalPlaces: number;
    /** Symbol position: "before" ($100) or "after" (100$) */
    symbolPosition: "before" | "after";
    /** Thousands separator (e.g., ",") */
    thousandsSeparator: string;
    /** Decimal separator (e.g., ".") */
    decimalSeparator: string;
  };
};

// ============================================================================
// Country Pricing Configurations
// ============================================================================

/**
 * Pricing configuration for all supported countries
 *
 * Key decisions:
 * - Customer pays in local currency
 * - Professional receives in local currency
 * - Platform acts as marketplace (not employer-of-record)
 * - Commission rates vary by market maturity
 */
export const COUNTRY_PRICING: Record<CountryCode, CountryPricingConfig> = {
  /** Colombia - Launch market */
  CO: {
    currency: "COP",
    commission: {
      marketplaceRate: 0.15, // Customer service fee (15%)
    },
    constraints: {
      minPrice: 2_000_000, // ~$5 USD minimum
      maxPrice: 200_000_000, // ~$500 USD maximum
      backgroundCheckFee: 10_000_000, // ~$25 USD
    },
    paymentProcessors: {
      primary: "stripe", // Stripe supports COP
      fallback: "paypal",
      supported: ["stripe", "paypal"],
    },
    formatting: {
      decimalPlaces: 0, // No decimals for COP
      symbolPosition: "before",
      thousandsSeparator: ".",
      decimalSeparator: ",",
    },
  },

  /** Paraguay */
  PY: {
    currency: "PYG",
    commission: {
      marketplaceRate: 0.15, // Customer service fee (15%)
    },
    constraints: {
      minPrice: 3_650_000, // ~$5 USD minimum
      maxPrice: 365_000_000, // ~$500 USD maximum
      backgroundCheckFee: 18_250_000, // ~$25 USD
    },
    paymentProcessors: {
      primary: "paypal", // Stripe doesn't support PYG
      supported: ["paypal"],
    },
    formatting: {
      decimalPlaces: 0, // No decimals for PYG in practice
      symbolPosition: "before",
      thousandsSeparator: ",",
      decimalSeparator: ".",
    },
  },

  /** Uruguay */
  UY: {
    currency: "UYU",
    commission: {
      marketplaceRate: 0.15, // Customer service fee (15%)
    },
    constraints: {
      minPrice: 19_750, // ~$5 USD minimum
      maxPrice: 1_975_000, // ~$500 USD maximum
      backgroundCheckFee: 98_750, // ~$25 USD
    },
    paymentProcessors: {
      primary: "paypal", // Stripe doesn't support UYU
      supported: ["paypal"],
    },
    formatting: {
      decimalPlaces: 2,
      symbolPosition: "before",
      thousandsSeparator: ",",
      decimalSeparator: ".",
    },
  },

  /** Argentina */
  AR: {
    currency: "ARS",
    commission: {
      marketplaceRate: 0.15, // Customer service fee (15%)
    },
    constraints: {
      minPrice: 475_000, // ~$5 USD minimum
      maxPrice: 47_500_000, // ~$500 USD maximum
      backgroundCheckFee: 2_375_000, // ~$25 USD
    },
    paymentProcessors: {
      primary: "paypal", // Stripe doesn't support ARS
      supported: ["paypal"],
    },
    formatting: {
      decimalPlaces: 2,
      symbolPosition: "before",
      thousandsSeparator: ",",
      decimalSeparator: ".",
    },
  },
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get pricing configuration for a country
 */
export function getPricingConfig(countryCode: CountryCode): CountryPricingConfig {
  const config = COUNTRY_PRICING[countryCode];
  if (!config) {
    throw new Error(`No pricing configuration found for country: ${countryCode}`);
  }
  return config;
}

/**
 * Get currency code for a country
 */
export function getCurrencyForCountry(countryCode: CountryCode): CurrencyCode {
  return getPricingConfig(countryCode).currency;
}

/**
 * Check if a price is within valid range for a country
 */
function isValidPrice(price: number, countryCode: CountryCode): boolean {
  const { minPrice, maxPrice } = getPricingConfig(countryCode).constraints;
  return price >= minPrice && price <= maxPrice;
}

/**
 * Calculate platform commission for a booking
 * Uses the standard 15% marketplace rate for all bookings
 */
function calculateCommission(price: number, countryCode: CountryCode): number {
  const { commission } = getPricingConfig(countryCode);
  return Math.round(price * commission.marketplaceRate);
}

/**
 * Get primary payment processor for a country
 */
function getPrimaryPaymentProcessor(countryCode: CountryCode): PaymentProcessor {
  return getPricingConfig(countryCode).paymentProcessors.primary;
}

/**
 * Check if a payment processor is supported for a country
 */
function isPaymentProcessorSupported(
  processor: PaymentProcessor,
  countryCode: CountryCode
): boolean {
  return getPricingConfig(countryCode).paymentProcessors.supported.includes(processor);
}

// ============================================================================
// Constants for backward compatibility
// ============================================================================

/**
 * @deprecated Use getPricingConfig(countryCode).commission.marketplaceRate instead
 */
const MARKETPLACE_COMMISSION_RATE = COUNTRY_PRICING.CO.commission.marketplaceRate;

// ============================================================================
// Exchange Rate Helpers (for display/info only)
// ============================================================================

/**
 * Approximate USD equivalent (for display purposes only)
 * DO NOT use for actual currency conversion - always use pricing_controls table
 */
export const APPROXIMATE_USD_RATES: Record<CurrencyCode, number> = {
  COP: 4200.0,
  PYG: 7300.0,
  UYU: 39.5,
  ARS: 950.0, // HIGHLY VOLATILE - update frequently
  USD: 1.0,
};

/**
 * Get approximate USD equivalent for display
 * @warning DO NOT use for actual pricing - this is for display only
 */
function getApproximateUSD(amountInMinorUnits: number, currency: CurrencyCode): number {
  const rate = APPROXIMATE_USD_RATES[currency];
  return amountInMinorUnits / (rate * 100); // Convert from minor units to major, then to USD
}

/**
 * Centralized Formatting Utilities
 *
 * This module provides unified formatting functions for currency, dates, times, and durations.
 * These utilities replace duplicated formatting logic found throughout the codebase.
 *
 * @module lib/format
 */

// ============================================================================
// TYPES
// ============================================================================

export type Currency = "COP" | "PYG" | "UYU" | "ARS" | "USD";
export type Locale = "es-CO" | "es-PY" | "es-UY" | "es-AR" | "en-US";

export type CurrencyFormatOptions = {
  locale?: Locale;
  currency?: Currency;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  compact?: boolean;
};

export type DateFormatOptions = {
  locale?: Locale;
  weekday?: "short" | "long" | "narrow";
  year?: "numeric" | "2-digit";
  month?: "short" | "long" | "narrow" | "numeric" | "2-digit";
  day?: "numeric" | "2-digit";
};

export type TimeFormatOptions = {
  locale?: Locale;
  hour?: "numeric" | "2-digit";
  minute?: "numeric" | "2-digit";
  second?: "numeric" | "2-digit";
  hour12?: boolean;
};

export interface DateTimeFormatOptions extends DateFormatOptions, TimeFormatOptions {}

// ============================================================================
// CURRENCY FORMATTING
// ============================================================================

/**
 * Format a number as currency with proper locale and currency symbols
 *
 * @example
 * ```ts
 * formatCurrency(50000) // "$50,000" (COP, es-CO)
 * formatCurrency(50000, { currency: "USD" }) // "$50,000.00" (USD)
 * formatCurrency(50000, { minimumFractionDigits: 2 }) // "$50,000.00"
 * formatCurrency(null) // "$0"
 * ```
 *
 * @param amount - The amount to format (in major units, not cents)
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number | null | undefined,
  options: CurrencyFormatOptions = {}
): string {
  const {
    locale = "es-CO",
    currency = "COP",
    minimumFractionDigits = 0,
    // COP and PYG have 0 decimals, others have 2
    maximumFractionDigits = currency === "COP" || currency === "PYG" ? 0 : 2,
    compact = false,
  } = options;

  // Handle null/undefined/NaN
  const safeAmount = amount ?? 0;
  if (!Number.isFinite(safeAmount)) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
      notation: compact ? "compact" : "standard",
    }).format(0);
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
    notation: compact ? "compact" : "standard",
  }).format(safeAmount);
}

/**
 * Format a number as Colombian Pesos (COP)
 *
 * This is a convenience function for the most common use case in the app.
 *
 * @example
 * ```ts
 * formatCOP(50000) // "$50,000"
 * formatCOP(1500) // "$1,500"
 * formatCOP(null) // "$0"
 * ```
 *
 * @param amount - The amount to format in COP
 * @returns Formatted COP currency string
 */
export function formatCOP(amount: number | null | undefined): string {
  return formatCurrency(amount, {
    locale: "es-CO",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Format a number as US Dollars (USD)
 *
 * @example
 * ```ts
 * formatUSD(50.5) // "$50.50"
 * formatUSD(1000) // "$1,000.00"
 * formatUSD(null) // "$0.00"
 * ```
 *
 * @param amount - The amount to format in USD
 * @returns Formatted USD currency string
 */
export function formatUSD(amount: number | null | undefined): string {
  return formatCurrency(amount, {
    locale: "en-US",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format a number as Paraguayan Guaraníes (PYG)
 *
 * @example
 * ```ts
 * formatPYG(7300000) // "₲7,300,000"
 * formatPYG(1500000) // "₲1,500,000"
 * formatPYG(null) // "₲0"
 * ```
 *
 * @param amount - The amount to format in PYG
 * @returns Formatted PYG currency string
 */
export function formatPYG(amount: number | null | undefined): string {
  return formatCurrency(amount, {
    locale: "es-PY",
    currency: "PYG",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Format a number as Uruguayan Pesos (UYU)
 *
 * @example
 * ```ts
 * formatUYU(1185.50) // "$U 1,185.50"
 * formatUYU(39500) // "$U 39,500.00"
 * formatUYU(null) // "$U 0.00"
 * ```
 *
 * @param amount - The amount to format in UYU
 * @returns Formatted UYU currency string
 */
export function formatUYU(amount: number | null | undefined): string {
  return formatCurrency(amount, {
    locale: "es-UY",
    currency: "UYU",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format a number as Argentine Pesos (ARS)
 *
 * @example
 * ```ts
 * formatARS(28500.50) // "$28,500.50"
 * formatARS(950000) // "$950,000.00"
 * formatARS(null) // "$0.00"
 * ```
 *
 * @param amount - The amount to format in ARS
 * @returns Formatted ARS currency string
 */
export function formatARS(amount: number | null | undefined): string {
  return formatCurrency(amount, {
    locale: "es-AR",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format an amount from minor currency units (cents/centavos) to major units
 *
 * This is the PRIMARY function for displaying prices stored in the database.
 * All monetary values in the database are stored as integers in minor units:
 * - Colombia (COP): 50,000 COP = 5,000,000 centavos (multiply by 100)
 * - Paraguay (PYG): 100,000 PYG = 10,000,000 céntimos (multiply by 100)
 * - Uruguay (UYU): 2,000 UYU = 200,000 centésimos (multiply by 100)
 * - Argentina (ARS): 5,000 ARS = 500,000 centavos (multiply by 100)
 *
 * @example
 * ```ts
 * // Colombian Peso (no decimals in practice)
 * formatFromMinorUnits(5000000, "COP") // "$50,000"
 *
 * // Paraguayan Guaraní (no decimals in practice)
 * formatFromMinorUnits(10000000, "PYG") // "₲100,000"
 *
 * // Uruguayan Peso (2 decimals)
 * formatFromMinorUnits(200000, "UYU") // "$U 2,000.00"
 *
 * // Argentine Peso (2 decimals)
 * formatFromMinorUnits(500000, "ARS") // "$5,000.00"
 *
 * // US Dollar (2 decimals)
 * formatFromMinorUnits(5000, "USD") // "$50.00"
 * ```
 *
 * @param amountInMinorUnits - Amount in minor currency units (cents/centavos)
 * @param currency - ISO 4217 currency code
 * @returns Formatted currency string in major units
 */
export function formatFromMinorUnits(
  amountInMinorUnits: number | null | undefined,
  currency: Currency
): string {
  // Convert minor units to major units (divide by 100)
  const amountInMajorUnits = (amountInMinorUnits ?? 0) / 100;

  // Format based on currency
  switch (currency) {
    case "COP":
      return formatCOP(amountInMajorUnits);
    case "PYG":
      return formatPYG(amountInMajorUnits);
    case "UYU":
      return formatUYU(amountInMajorUnits);
    case "ARS":
      return formatARS(amountInMajorUnits);
    case "USD":
      return formatUSD(amountInMajorUnits);
    default:
      // Fallback to generic formatter
      return formatCurrency(amountInMajorUnits, { currency });
  }
}

// ============================================================================
// DATE FORMATTING
// ============================================================================

/**
 * Format a date with customizable options
 *
 * @example
 * ```ts
 * const date = new Date("2024-12-25");
 * formatDate(date) // "Dec 25, 2024"
 * formatDate(date, { weekday: "long" }) // "Wednesday, Dec 25, 2024"
 * formatDate(date, { locale: "es-CO", month: "long" }) // "25 de diciembre de 2024"
 * formatDate(null) // ""
 * ```
 *
 * @param date - The date to format
 * @param options - Formatting options
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | null | undefined,
  options: DateFormatOptions = {}
): string {
  if (!date) {
    return "";
  }

  const { locale = "en-US", weekday, year = "numeric", month = "short", day = "numeric" } = options;

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Check for invalid date
    if (!dateObj || Number.isNaN(dateObj.getTime())) {
      return "";
    }

    return dateObj.toLocaleDateString(locale, {
      weekday,
      year,
      month,
      day,
    });
  } catch {
    return "";
  }
}

/**
 * Format a date in short format (e.g., "Dec 25")
 *
 * @example
 * ```ts
 * formatDateShort(new Date("2024-12-25")) // "Dec 25"
 * ```
 */
export function formatDateShort(date: Date | string | null | undefined): string {
  return formatDate(date, {
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a date in long format (e.g., "Wednesday, December 25, 2024")
 *
 * @example
 * ```ts
 * formatDateLong(new Date("2024-12-25")) // "Wednesday, December 25, 2024"
 * ```
 */
export function formatDateLong(date: Date | string | null | undefined): string {
  return formatDate(date, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ============================================================================
// TIME FORMATTING
// ============================================================================

/**
 * Format a time with customizable options
 *
 * @example
 * ```ts
 * const date = new Date("2024-12-25T14:30:00");
 * formatTime(date) // "2:30 PM"
 * formatTime(date, { hour12: false }) // "14:30"
 * formatTime(date, { second: "2-digit" }) // "2:30:00 PM"
 * formatTime(null) // ""
 * ```
 *
 * @param date - The date/time to format
 * @param options - Formatting options
 * @returns Formatted time string
 */
export function formatTime(
  date: Date | string | null | undefined,
  options: TimeFormatOptions = {}
): string {
  if (!date) {
    return "";
  }

  const { locale = "en-US", hour = "2-digit", minute = "2-digit", second, hour12 = true } = options;

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Check for invalid date
    if (!dateObj || Number.isNaN(dateObj.getTime())) {
      return "";
    }

    return dateObj.toLocaleTimeString(locale, {
      hour,
      minute,
      second,
      hour12,
    });
  } catch {
    return "";
  }
}

/**
 * Format a time in 24-hour format (e.g., "14:30")
 *
 * @example
 * ```ts
 * formatTime24(new Date("2024-12-25T14:30:00")) // "14:30"
 * ```
 */
export function formatTime24(date: Date | string | null | undefined): string {
  return formatTime(date, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Format a time in 12-hour format with AM/PM (e.g., "2:30 PM")
 *
 * @example
 * ```ts
 * formatTime12(new Date("2024-12-25T14:30:00")) // "2:30 PM"
 * ```
 */
export function formatTime12(date: Date | string | null | undefined): string {
  return formatTime(date, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// ============================================================================
// DATE + TIME FORMATTING
// ============================================================================

/**
 * Format a date and time together
 *
 * @example
 * ```ts
 * const date = new Date("2024-12-25T14:30:00");
 * formatDateTime(date) // "Dec 25, 2024, 2:30 PM"
 * formatDateTime(date, { weekday: "short", hour12: false }) // "Wed, Dec 25, 2024, 14:30"
 * ```
 *
 * @param date - The date/time to format
 * @param options - Formatting options
 * @returns Formatted date and time string
 */
export function formatDateTime(
  date: Date | string | null | undefined,
  options: DateTimeFormatOptions = {}
): string {
  if (!date) {
    return "";
  }

  const {
    locale = "en-US",
    weekday,
    year = "numeric",
    month = "short",
    day = "numeric",
    hour = "2-digit",
    minute = "2-digit",
    second,
    hour12 = true,
  } = options;

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Check for invalid date
    if (!dateObj || Number.isNaN(dateObj.getTime())) {
      return "";
    }

    return dateObj.toLocaleString(locale, {
      weekday,
      year,
      month,
      day,
      hour,
      minute,
      second,
      hour12,
    });
  } catch {
    return "";
  }
}

// ============================================================================
// DURATION FORMATTING
// ============================================================================

/**
 * Format a duration in minutes to a human-readable string
 *
 * @example
 * ```ts
 * formatDuration(90) // "1h 30m"
 * formatDuration(60) // "1h"
 * formatDuration(45) // "45m"
 * formatDuration(0) // "0m"
 * formatDuration(null) // "0m"
 * formatDuration(150) // "2h 30m"
 * ```
 *
 * @param minutes - Duration in minutes
 * @returns Formatted duration string
 */
export function formatDuration(minutes: number | null | undefined): string {
  const safeMinutes = minutes ?? 0;

  if (!Number.isFinite(safeMinutes) || safeMinutes < 0) {
    return "0m";
  }

  const hours = Math.floor(safeMinutes / 60);
  const mins = Math.round(safeMinutes % 60);

  if (hours === 0) {
    return `${mins}m`;
  }

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
}

/**
 * Format a duration in hours to a human-readable string
 *
 * @example
 * ```ts
 * formatDurationHours(1.5) // "1h 30m"
 * formatDurationHours(2) // "2h"
 * formatDurationHours(0.25) // "15m"
 * ```
 *
 * @param hours - Duration in hours (can be decimal)
 * @returns Formatted duration string
 */
export function formatDurationHours(hours: number | null | undefined): string {
  const minutes = (hours ?? 0) * 60;
  return formatDuration(minutes);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format a number with thousand separators
 *
 * @example
 * ```ts
 * formatNumber(1000) // "1,000"
 * formatNumber(1234567) // "1,234,567"
 * formatNumber(1234.56) // "1,234.56"
 * formatNumber(1234.56, { minimumFractionDigits: 2 }) // "1,234.56"
 * ```
 *
 * @param value - The number to format
 * @param options - Formatting options
 * @returns Formatted number string
 */
export function formatNumber(
  value: number | null | undefined,
  options: {
    locale?: Locale;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string {
  const { locale = "en-US", minimumFractionDigits = 0, maximumFractionDigits = 2 } = options;

  const safeValue = value ?? 0;
  if (!Number.isFinite(safeValue)) {
    return "0";
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(safeValue);
}

/**
 * Format a percentage
 *
 * @example
 * ```ts
 * formatPercentage(0.19) // "19%"
 * formatPercentage(0.195) // "19.5%"
 * formatPercentage(0.195, { minimumFractionDigits: 0 }) // "20%"
 * ```
 *
 * @param value - The decimal value (0.19 = 19%)
 * @param options - Formatting options
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number | null | undefined,
  options: {
    locale?: Locale;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string {
  const { locale = "en-US", minimumFractionDigits = 0, maximumFractionDigits = 1 } = options;

  const safeValue = value ?? 0;
  if (!Number.isFinite(safeValue)) {
    return "0%";
  }

  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(safeValue);
}

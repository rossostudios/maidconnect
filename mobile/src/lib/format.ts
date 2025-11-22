import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { CurrencyCode } from "@/types/territories";

/**
 * Format currency based on currency code
 */
export function formatCurrency(
  amount: number,
  currencyCode: CurrencyCode,
  locale: "en" | "es" = "es"
): string {
  const currencyMap: Record<CurrencyCode, { symbol: string; decimals: number }> = {
    COP: { symbol: "$", decimals: 0 },
    PYG: { symbol: "₲", decimals: 0 },
    UYU: { symbol: "$U", decimals: 2 },
    ARS: { symbol: "$", decimals: 2 },
    USD: { symbol: "$", decimals: 2 },
  };

  const config = currencyMap[currencyCode];
  const formatted = amount.toLocaleString(locale === "es" ? "es-ES" : "en-US", {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  });

  return `${config.symbol} ${formatted}`;
}

/**
 * Format date based on locale
 */
export function formatDate(
  date: Date | string,
  formatStr = "PPP",
  locale: "en" | "es" = "es"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, formatStr, {
    locale: locale === "es" ? es : undefined,
  });
}

/**
 * Format date and time based on locale
 */
export function formatDateTime(
  date: Date | string,
  formatStr = "PPp",
  locale: "en" | "es" = "es"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, formatStr, {
    locale: locale === "es" ? es : undefined,
  });
}

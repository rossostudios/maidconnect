/**
 * Payout and Commission Calculation Utilities
 *
 * Platform commission rates are defined per-country in pricing.ts
 * Default: 15% commission from completed bookings (all markets)
 * Payouts are processed twice weekly (per operations manual)
 *
 * Multi-Currency Support:
 * - Commission rates vary by country (currently 15% for all markets)
 * - All calculations use country-specific pricing configuration
 * - Supports COP, PYG, UYU, ARS currencies
 */

import { createSupabaseBrowserClient } from "@/lib/integrations/supabase/browserClient";
import { type CountryCode, getPricingConfig } from "@/lib/shared/config/pricing";
import { type Currency, formatCurrency } from "@/lib/utils/format";

// Default commission rate (fallback if country not specified)
// @deprecated Use getPricingConfig(countryCode).commission.marketplaceRate instead
export const DEFAULT_COMMISSION_RATE = 0.15; // 15%

export type BookingForPayout = {
  id: string;
  final_amount_captured: number;
  currency: Currency;
  completed_at?: string | null;
  checked_out_at?: string | null;
  service_category?: string | null;
  city?: string | null;
  country?: CountryCode | null; // Country for commission calculation
};

export type PayoutCalculation = {
  grossAmount: number; // Total from bookings before commission
  commissionAmount: number; // Platform commission (configurable)
  netAmount: number; // Amount paid to professional
  currency: Currency;
  bookingIds: string[];
  bookingCount: number;
  appliedCommissionRate?: number; // The actual commission rate used
};

/**
 * Map Currency to CountryCode for commission calculation
 */
function getCurrencyCountry(currency: Currency): CountryCode {
  const currencyCountryMap: Record<Currency, CountryCode> = {
    COP: "CO",
    PYG: "PY",
    UYU: "UY",
    ARS: "AR",
    USD: "CO", // Default to Colombia for USD (legacy)
    EUR: "CO", // Default to Colombia for EUR (legacy)
  };
  return currencyCountryMap[currency] || "CO";
}

/**
 * Fetch applicable pricing rule for a booking
 * Returns the commission rate based on service category and city
 */
export async function getPricingRule(
  serviceCategory?: string | null,
  city?: string | null,
  effectiveDate?: Date
): Promise<{ commission_rate: number } | null> {
  try {
    const supabase = createSupabaseBrowserClient();

    const { data, error } = await supabase.rpc("get_pricing_rule", {
      p_service_category: serviceCategory || null,
      p_city: city || null,
      p_effective_date: effectiveDate ? effectiveDate.toISOString().split("T")[0] : undefined,
    });

    if (error || !data || data.length === 0) {
      console.warn("No pricing rule found, using default commission rate");
      return null;
    }

    return data[0];
  } catch (error) {
    console.error("Failed to fetch pricing rule:", error);
    return null;
  }
}

/**
 * Calculate commission and net payout from gross amount
 * @param grossAmount - Total booking amount before commission
 * @param countryCode - Optional country code for country-specific rates (uses pricing.ts)
 * @param commissionRate - Optional commission rate override (uses DEFAULT_COMMISSION_RATE if not provided)
 */
export function calculateCommission(
  grossAmount: number,
  countryCode?: CountryCode,
  commissionRate?: number
): {
  commissionAmount: number;
  netAmount: number;
} {
  // Use country-specific rate from pricing.ts if country provided
  let rate = commissionRate;
  if (countryCode && !commissionRate) {
    rate = getPricingConfig(countryCode).commission.marketplaceRate;
  } else if (!rate) {
    rate = DEFAULT_COMMISSION_RATE;
  }

  const commissionAmount = Math.round(grossAmount * rate);
  const netAmount = grossAmount - commissionAmount;

  return {
    commissionAmount,
    netAmount,
  };
}

/**
 * Calculate payout totals from a list of completed bookings
 * Uses country-specific commission rates from pricing.ts
 * For dynamic rates per booking, use calculatePayoutFromBookingsWithDynamicRates
 */
export function calculatePayoutFromBookings(bookings: BookingForPayout[]): PayoutCalculation {
  if (bookings.length === 0) {
    return {
      grossAmount: 0,
      commissionAmount: 0,
      netAmount: 0,
      currency: "COP",
      bookingIds: [],
      bookingCount: 0,
      appliedCommissionRate: DEFAULT_COMMISSION_RATE,
    };
  }

  // Derive country from first booking's currency or country field
  const firstBooking = bookings[0];
  const currency = firstBooking?.currency || "COP";
  const countryCode = firstBooking?.country || getCurrencyCountry(currency);

  // Sum up all captured amounts
  const grossAmount = bookings.reduce(
    (sum, booking) => sum + (booking.final_amount_captured || 0),
    0
  );

  // Use country-specific commission rate
  const { commissionAmount, netAmount } = calculateCommission(grossAmount, countryCode);
  const appliedRate = getPricingConfig(countryCode).commission.marketplaceRate;

  return {
    grossAmount,
    commissionAmount,
    netAmount,
    currency,
    bookingIds: bookings.map((b) => b.id),
    bookingCount: bookings.length,
    appliedCommissionRate: appliedRate,
  };
}

/**
 * Calculate payout totals with dynamic commission rates per booking
 * This function fetches pricing rules for each unique category/city combination
 * and applies the appropriate commission rate to each booking.
 * Falls back to pricing.ts country-specific rates if no pricing rule is found.
 */
export async function calculatePayoutFromBookingsWithDynamicRates(
  bookings: BookingForPayout[]
): Promise<PayoutCalculation> {
  if (bookings.length === 0) {
    return {
      grossAmount: 0,
      commissionAmount: 0,
      netAmount: 0,
      currency: "COP",
      bookingIds: [],
      bookingCount: 0,
    };
  }

  // Derive country from first booking
  const firstBooking = bookings[0];
  const currency = firstBooking?.currency || "COP";
  const countryCode = firstBooking?.country || getCurrencyCountry(currency);
  const baselineRate = getPricingConfig(countryCode).commission.marketplaceRate;

  // Calculate gross amount
  const grossAmount = bookings.reduce(
    (sum, booking) => sum + (booking.final_amount_captured || 0),
    0
  );

  // Calculate commission per booking with dynamic rates
  let totalCommission = 0;

  for (const booking of bookings) {
    const pricingRule = await getPricingRule(
      booking.service_category,
      booking.city,
      booking.completed_at ? new Date(booking.completed_at) : new Date()
    );

    // Use pricing rule if found, otherwise use country-specific baseline rate from pricing.ts
    const rate = pricingRule?.commission_rate || baselineRate;
    const { commissionAmount } = calculateCommission(
      booking.final_amount_captured || 0,
      undefined,
      rate
    );
    totalCommission += commissionAmount;
  }

  const netAmount = grossAmount - totalCommission;

  return {
    grossAmount,
    commissionAmount: totalCommission,
    netAmount,
    currency,
    bookingIds: bookings.map((b) => b.id),
    bookingCount: bookings.length,
  };
}

/**
 * Format amount in currency (COP by default)
 * @deprecated Use formatCurrency from @/lib/format instead
 */
export function formatPayoutAmount(amountInCents: number, currency: Currency = "COP"): string {
  return formatCurrency(amountInCents / 100, {
    locale: "es-CO",
    currency,
    maximumFractionDigits: 0,
  });
}

/**
 * Get payout period dates for twice-weekly schedule
 * Payouts occur every Tuesday and Friday (per operations manual)
 *
 * Returns the start and end dates for the current pending payout period
 */
export function getCurrentPayoutPeriod(): {
  periodStart: Date;
  periodEnd: Date;
  nextPayoutDate: Date;
} {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 2 = Tuesday, 5 = Friday

  let periodStart: Date;
  let periodEnd: Date;
  let nextPayoutDate: Date;

  // Tuesday payout covers Friday-Monday
  // Friday payout covers Tuesday-Thursday

  if (dayOfWeek === 0 || dayOfWeek === 1 || dayOfWeek === 2) {
    // Sunday, Monday, Tuesday -> next payout is Tuesday
    periodStart = getLastFriday(now);
    periodEnd = getNextTuesday(now);
    periodEnd.setHours(0, 0, 0, 0); // Start of Tuesday
    nextPayoutDate = getNextTuesday(now);
    nextPayoutDate.setHours(10, 0, 0, 0); // 10 AM Tuesday
  } else {
    // Wednesday, Thursday, Friday, Saturday -> next payout is Friday
    periodStart = getLastTuesday(now);
    periodEnd = getNextFriday(now);
    periodEnd.setHours(0, 0, 0, 0); // Start of Friday
    nextPayoutDate = getNextFriday(now);
    nextPayoutDate.setHours(10, 0, 0, 0); // 10 AM Friday
  }

  return { periodStart, periodEnd, nextPayoutDate };
}

/**
 * Check if a booking should be included in current payout period
 */
export function isBookingInPayoutPeriod(
  booking: BookingForPayout,
  periodStart: Date,
  periodEnd: Date
): boolean {
  const completedAt = booking.checked_out_at || booking.completed_at;
  if (!completedAt) {
    return false;
  }

  const completedDate = new Date(completedAt);
  return completedDate >= periodStart && completedDate < periodEnd;
}

// Helper functions for date calculations
function getLastFriday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day >= 5 ? day - 5 : day + 2; // Days since last Friday
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getLastTuesday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day >= 2 ? day - 2 : day + 5; // Days since last Tuesday
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getNextTuesday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const daysUntil = day <= 2 ? 2 - day : 9 - day; // Days until next Tuesday
  d.setDate(d.getDate() + daysUntil);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getNextFriday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const daysUntil = day <= 5 ? 5 - day : 12 - day; // Days until next Friday
  d.setDate(d.getDate() + daysUntil);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get description of payout schedule
 */
export function getPayoutScheduleDescription(commissionRate?: number): string {
  const rateDisplay = commissionRate
    ? `${(commissionRate * 100).toFixed(1)}%`
    : "15-20% (varies by service and location)";

  return `Payouts are processed twice weekly:
• Tuesday at 10 AM - covers bookings completed Friday through Monday
• Friday at 10 AM - covers bookings completed Tuesday through Thursday

The platform commission is ${rateDisplay}.
Funds typically arrive in your bank account within 2-3 business days.`;
}

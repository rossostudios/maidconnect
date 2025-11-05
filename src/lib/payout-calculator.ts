/**
 * Payout and Commission Calculation Utilities
 *
 * Platform commission is configurable via pricing_controls table
 * Default: 18% commission from completed bookings
 * Payouts are processed twice weekly (per operations manual)
 */

import { type Currency, formatCurrency } from "@/lib/format";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

// Default platform commission rate (fallback if no pricing rule found)
export const DEFAULT_COMMISSION_RATE = 0.18; // 18%

export type BookingForPayout = {
  id: string;
  amount_captured: number;
  currency: Currency;
  completed_at?: string | null;
  checked_out_at?: string | null;
  service_category?: string | null;
  city?: string | null;
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
 * @param commissionRate - Optional commission rate (defaults to DEFAULT_COMMISSION_RATE if not provided)
 */
export function calculateCommission(
  grossAmount: number,
  commissionRate: number = DEFAULT_COMMISSION_RATE
): {
  commissionAmount: number;
  netAmount: number;
} {
  const commissionAmount = Math.round(grossAmount * commissionRate);
  const netAmount = grossAmount - commissionAmount;

  return {
    commissionAmount,
    netAmount,
  };
}

/**
 * Calculate payout totals from a list of completed bookings
 * Uses default commission rate for all bookings (for backward compatibility)
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

  // Sum up all captured amounts
  const grossAmount = bookings.reduce((sum, booking) => sum + (booking.amount_captured || 0), 0);

  const { commissionAmount, netAmount } = calculateCommission(grossAmount);

  return {
    grossAmount,
    commissionAmount,
    netAmount,
    currency: bookings[0]?.currency || "COP",
    bookingIds: bookings.map((b) => b.id),
    bookingCount: bookings.length,
    appliedCommissionRate: DEFAULT_COMMISSION_RATE,
  };
}

/**
 * Calculate payout totals with dynamic commission rates per booking
 * This function fetches pricing rules for each unique category/city combination
 * and applies the appropriate commission rate to each booking
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

  // Calculate gross amount
  const grossAmount = bookings.reduce((sum, booking) => sum + (booking.amount_captured || 0), 0);

  // Calculate commission per booking with dynamic rates
  let totalCommission = 0;

  for (const booking of bookings) {
    const pricingRule = await getPricingRule(
      booking.service_category,
      booking.city,
      booking.completed_at ? new Date(booking.completed_at) : new Date()
    );

    const rate = pricingRule?.commission_rate || DEFAULT_COMMISSION_RATE;
    const { commissionAmount } = calculateCommission(booking.amount_captured || 0, rate);
    totalCommission += commissionAmount;
  }

  const netAmount = grossAmount - totalCommission;

  return {
    grossAmount,
    commissionAmount: totalCommission,
    netAmount,
    currency: bookings[0]?.currency || "COP",
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

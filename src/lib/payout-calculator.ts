/**
 * Payout and Commission Calculation Utilities
 *
 * Platform takes 18% commission from completed bookings
 * Payouts are processed twice weekly (per operations manual)
 */

// Platform commission rate
export const COMMISSION_RATE = 0.18; // 18%

export type BookingForPayout = {
  id: string;
  amount_captured: number;
  currency: string;
  completed_at?: string | null;
  checked_out_at?: string | null;
};

export type PayoutCalculation = {
  grossAmount: number; // Total from bookings before commission
  commissionAmount: number; // 18% platform fee
  netAmount: number; // Amount paid to professional
  currency: string;
  bookingIds: string[];
  bookingCount: number;
};

/**
 * Calculate commission and net payout from gross amount
 */
export function calculateCommission(grossAmount: number): {
  commissionAmount: number;
  netAmount: number;
} {
  const commissionAmount = Math.round(grossAmount * COMMISSION_RATE);
  const netAmount = grossAmount - commissionAmount;

  return {
    commissionAmount,
    netAmount,
  };
}

/**
 * Calculate payout totals from a list of completed bookings
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
  };
}

/**
 * Format amount in currency (COP by default)
 */
export function formatPayoutAmount(amountInCents: number, currency = "COP"): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amountInCents / 100);
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
export function getPayoutScheduleDescription(): string {
  return `Payouts are processed twice weekly:
• Tuesday at 10 AM - covers bookings completed Friday through Monday
• Friday at 10 AM - covers bookings completed Tuesday through Thursday

The platform takes an 18% commission from each completed booking.
Funds typically arrive in your bank account within 2-3 business days.`;
}

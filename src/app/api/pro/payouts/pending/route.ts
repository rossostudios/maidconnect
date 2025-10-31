import { NextResponse } from "next/server";
import {
  type BookingForPayout,
  calculatePayoutFromBookings,
  getCurrentPayoutPeriod,
} from "@/lib/payout-calculator";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

/**
 * Get pending payout information for professional
 * GET /api/pro/payouts/pending
 *
 * Returns:
 * - Bookings completed but not yet paid out
 * - Total pending earnings (gross, commission, net)
 * - Next payout date
 * - Current payout period
 */
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "professional") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    // Get current payout period
    const { periodStart, periodEnd, nextPayoutDate } = getCurrentPayoutPeriod();

    // Fetch completed bookings that haven't been included in a payout yet
    const { data: pendingBookings, error: bookingsError } = await supabase
      .from("bookings")
      .select(
        `
        id,
        amount_captured,
        currency,
        checked_out_at,
        created_at,
        service_name,
        scheduled_start
      `
      )
      .eq("professional_id", user.id)
      .eq("status", "completed")
      .not("amount_captured", "is", null)
      .is("included_in_payout_id", null) // Not yet included in a payout
      .order("checked_out_at", { ascending: false });

    if (bookingsError) {
      return NextResponse.json({ error: "Failed to fetch pending earnings" }, { status: 500 });
    }

    // Filter bookings by current payout period
    const currentPeriodBookings = (pendingBookings || []).filter((booking) => {
      const completedAt = booking.checked_out_at || booking.created_at;
      if (!completedAt) {
        return false;
      }
      const completedDate = new Date(completedAt);
      return completedDate >= periodStart && completedDate < periodEnd;
    });

    // Calculate totals for current period
    const currentPeriodPayout = calculatePayoutFromBookings(
      currentPeriodBookings as BookingForPayout[]
    );

    // Calculate totals for all pending (including future periods)
    const allPendingPayout = calculatePayoutFromBookings(
      (pendingBookings || []) as BookingForPayout[]
    );

    // Fetch recent payout history
    const { data: recentPayouts, error: payoutsError } = await supabase
      .from("payouts")
      .select(
        `
        id,
        gross_amount,
        commission_amount,
        net_amount,
        currency,
        status,
        payout_date,
        arrival_date,
        booking_ids,
        created_at
      `
      )
      .eq("professional_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (payoutsError) {
      // Don't fail the request, just return empty history
    }

    return NextResponse.json({
      currentPeriod: {
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
        nextPayoutDate: nextPayoutDate.toISOString(),
        grossAmount: currentPeriodPayout.grossAmount,
        commissionAmount: currentPeriodPayout.commissionAmount,
        netAmount: currentPeriodPayout.netAmount,
        currency: currentPeriodPayout.currency,
        bookingCount: currentPeriodPayout.bookingCount,
        bookings: currentPeriodBookings.map((b) => ({
          id: b.id,
          service_name: b.service_name,
          scheduled_start: b.scheduled_start,
          checked_out_at: b.checked_out_at,
          amount_captured: b.amount_captured,
        })),
      },
      allPending: {
        grossAmount: allPendingPayout.grossAmount,
        commissionAmount: allPendingPayout.commissionAmount,
        netAmount: allPendingPayout.netAmount,
        currency: allPendingPayout.currency,
        bookingCount: allPendingPayout.bookingCount,
      },
      recentPayouts: recentPayouts || [],
    });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to calculate pending payouts" }, { status: 500 });
  }
}

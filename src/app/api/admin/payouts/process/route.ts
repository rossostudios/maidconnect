import { NextResponse } from "next/server";
import { createAuditLog, requireAdmin } from "@/lib/admin-helpers";
import {
  type BookingForPayout,
  calculatePayoutFromBookings,
  getCurrentPayoutPeriod,
} from "@/lib/payout-calculator";
import { stripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

// Helper: Verify authentication (admin or cron)
async function verifyPayoutAuth(
  request: Request
): Promise<{ adminId: string; isCronJob: boolean }> {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const isCronJob = cronSecret && authHeader === `Bearer ${cronSecret}`;

  if (isCronJob) {
    return { adminId: "system", isCronJob: true };
  }

  const admin = await requireAdmin();
  return { adminId: admin.id, isCronJob: false };
}

// Helper: Fetch professionals eligible for payout
async function fetchEligibleProfessionals(supabase: any, professionalId?: string) {
  let query = supabase
    .from("professional_profiles")
    .select("profile_id, stripe_connect_account_id, stripe_connect_onboarding_status")
    .eq("stripe_connect_onboarding_status", "complete")
    .not("stripe_connect_account_id", "is", null);

  if (professionalId) {
    query = query.eq("profile_id", professionalId);
  }

  return query;
}

// Helper: Fetch pending bookings for professional
async function fetchPendingBookings(
  supabase: any,
  professionalId: string,
  periodStart: Date,
  periodEnd: Date
) {
  const { data: pendingBookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("id, amount_captured, currency, checked_out_at, created_at")
    .eq("professional_id", professionalId)
    .eq("status", "completed")
    .not("amount_captured", "is", null)
    .is("included_in_payout_id", null);

  if (bookingsError) {
    return { error: bookingsError };
  }

  // Filter by current period
  const periodBookings = (pendingBookings || []).filter((booking) => {
    const completedAt = booking.checked_out_at || booking.created_at;
    if (!completedAt) {
      return false;
    }
    const completedDate = new Date(completedAt);
    return completedDate >= periodStart && completedDate < periodEnd;
  });

  return { data: periodBookings };
}

// Helper: Create payout record in database
async function createPayoutRecord(
  supabase: any,
  professionalId: string,
  connectAccountId: string,
  payout: any,
  periodStart: Date,
  periodEnd: Date
) {
  return supabase
    .from("payouts")
    .insert({
      professional_id: professionalId,
      stripe_connect_account_id: connectAccountId,
      gross_amount: payout.grossAmount,
      commission_amount: payout.commissionAmount,
      net_amount: payout.netAmount,
      currency: payout.currency,
      status: "processing",
      booking_ids: payout.bookingIds,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      payout_date: new Date().toISOString(),
    })
    .select()
    .single();
}

// Helper: Create Stripe transfer and update payout
async function processStripeTransfer(
  supabase: any,
  payoutRecord: any,
  professional: any,
  payout: any,
  periodStart: Date,
  periodEnd: Date
) {
  const transfer = await stripe.transfers.create({
    amount: payout.netAmount,
    currency: payout.currency.toLowerCase(),
    destination: professional.stripe_connect_account_id,
    description: `Payout for ${payout.bookingCount} bookings (${periodStart.toDateString()} - ${periodEnd.toDateString()})`,
    metadata: {
      payout_id: payoutRecord.id,
      professional_id: professional.profile_id,
      booking_count: payout.bookingCount.toString(),
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
    },
  });

  // Update payout record with Stripe transfer ID and status
  await supabase
    .from("payouts")
    .update({
      stripe_payout_id: transfer.id,
      status: "paid",
      arrival_date: transfer.destination_payment
        ? new Date((transfer.destination_payment as any).arrival_date * 1000).toISOString()
        : null,
    })
    .eq("id", payoutRecord.id);

  // Mark bookings as included in this payout
  await supabase
    .from("bookings")
    .update({ included_in_payout_id: payoutRecord.id })
    .in("id", payout.bookingIds);

  return transfer;
}

// Helper: Process single professional payout
async function processProfessionalPayout(
  supabase: any,
  professional: any,
  periodStart: Date,
  periodEnd: Date,
  dryRun: boolean
) {
  // Fetch pending bookings
  const bookingsResult = await fetchPendingBookings(
    supabase,
    professional.profile_id,
    periodStart,
    periodEnd
  );

  if (bookingsResult.error) {
    return {
      professionalId: professional.profile_id,
      success: false,
      error: "Failed to fetch bookings",
    };
  }

  const periodBookings = bookingsResult.data || [];

  // Skip if no bookings in current period
  if (periodBookings.length === 0) {
    return {
      professionalId: professional.profile_id,
      success: true,
      skipped: true,
      reason: "No bookings in current period",
    };
  }

  // Calculate payout
  const payout = calculatePayoutFromBookings(periodBookings as BookingForPayout[]);

  // Skip if net amount is 0
  if (payout.netAmount <= 0) {
    return {
      professionalId: professional.profile_id,
      success: true,
      skipped: true,
      reason: "Net amount is zero",
    };
  }

  // If dry run, just return calculation
  if (dryRun) {
    return {
      professionalId: professional.profile_id,
      success: true,
      dryRun: true,
      calculation: {
        grossAmount: payout.grossAmount,
        commissionAmount: payout.commissionAmount,
        netAmount: payout.netAmount,
        currency: payout.currency,
        bookingCount: payout.bookingCount,
      },
    };
  }

  // Create payout record
  const { data: payoutRecord, error: payoutError } = await createPayoutRecord(
    supabase,
    professional.profile_id,
    professional.stripe_connect_account_id,
    payout,
    periodStart,
    periodEnd
  );

  if (payoutError || !payoutRecord) {
    return {
      professionalId: professional.profile_id,
      success: false,
      error: "Failed to create payout record",
    };
  }

  // Create Stripe transfer
  try {
    const transfer = await processStripeTransfer(
      supabase,
      payoutRecord,
      professional,
      payout,
      periodStart,
      periodEnd
    );

    return {
      professionalId: professional.profile_id,
      success: true,
      payoutId: payoutRecord.id,
      stripeTransferId: transfer.id,
      netAmount: payout.netAmount,
      bookingCount: payout.bookingCount,
    };
  } catch (stripeError: any) {
    // Update payout status to failed
    await supabase
      .from("payouts")
      .update({
        status: "failed",
        failure_reason: stripeError.message || "Stripe transfer failed",
      })
      .eq("id", payoutRecord.id);

    return {
      professionalId: professional.profile_id,
      success: false,
      payoutId: payoutRecord.id,
      error: stripeError.message || "Stripe transfer failed",
    };
  }
}

/**
 * Process payouts for professionals
 * POST /api/admin/payouts/process
 *
 * This endpoint:
 * - Calculates pending payouts for the current period
 * - Creates Stripe transfers to professional Connect accounts
 * - Records payouts in database
 * - Marks bookings as included in payout
 *
 * Body:
 * - professionalId (optional) - Process for specific professional, or all if omitted
 * - dryRun (optional) - If true, calculate but don't process
 *
 * Authentication:
 * - Admin user authentication (manual trigger)
 * - OR cron secret via Bearer token (automated trigger)
 */
export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    // Verify authentication
    const { adminId, isCronJob } = await verifyPayoutAuth(request);

    const body = (await request.json()) as {
      professionalId?: string;
      dryRun?: boolean;
    };

    const { professionalId, dryRun = false } = body;

    // Get current payout period
    const { periodStart, periodEnd } = getCurrentPayoutPeriod();

    // Fetch eligible professionals
    const { data: professionals, error: profError } = await fetchEligibleProfessionals(
      supabase,
      professionalId
    );

    if (profError) {
      return NextResponse.json({ error: "Failed to fetch professionals" }, { status: 500 });
    }

    if (!professionals || professionals.length === 0) {
      return NextResponse.json({
        message: "No professionals with completed onboarding found",
        processed: 0,
      });
    }

    // Process each professional
    const results = [];
    for (const professional of professionals) {
      try {
        const result = await processProfessionalPayout(
          supabase,
          professional,
          periodStart,
          periodEnd,
          dryRun
        );
        results.push(result);
      } catch (error: any) {
        results.push({
          professionalId: professional.profile_id,
          success: false,
          error: error.message || "Unknown error",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    // Create audit log for payout processing
    if (!dryRun && successCount > 0 && adminId) {
      await createAuditLog({
        adminId,
        actionType: "manual_payout",
        details: {
          successCount,
          failureCount,
          periodStart: periodStart.toISOString(),
          periodEnd: periodEnd.toISOString(),
          professionalId: professionalId || "all",
          totalProcessed: results.length,
          triggeredBy: isCronJob ? "cron" : "admin",
        },
        notes: `Processed ${successCount} payouts successfully, ${failureCount} failed`,
      });
    }

    return NextResponse.json({
      message: `Processed ${successCount} payouts successfully, ${failureCount} failed`,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      dryRun,
      results,
    });
  } catch (error: any) {
    const getErrorStatus = () => {
      if (error.message === "Not authenticated") {
        return 401;
      }
      if (error.message === "Unauthorized - admin access required") {
        return 403;
      }
      return 500;
    };

    return NextResponse.json(
      { error: error.message || "Failed to process payouts" },
      { status: getErrorStatus() }
    );
  }
}

import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createAuditLog, requireAdmin } from "@/lib/admin-helpers";
import {
  type BookingForPayout,
  calculatePayoutFromBookings,
  getCurrentPayoutPeriod,
  type PayoutCalculation,
} from "@/lib/payout-calculator";
import { stripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/types/supabase";

type ProfessionalProfile = {
  profile_id: string;
  stripe_connect_account_id: string;
  stripe_connect_onboarding_status: string;
};

type PayoutRecord = Database["public"]["Tables"]["payouts"]["Row"];

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
function fetchEligibleProfessionals(supabase: SupabaseClient<Database>, professionalId?: string) {
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
  supabase: SupabaseClient<Database>,
  professionalId: string,
  periodStart: Date,
  periodEnd: Date
) {
  const { data: pendingBookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("id, final_amount_captured, currency, checked_out_at, created_at")
    .eq("professional_id", professionalId)
    .eq("status", "completed")
    .not("final_amount_captured", "is", null)
    .is("included_in_payout_id", null);

  if (bookingsError) {
    return { error: bookingsError };
  }

  // Filter by current period
  const periodBookings = (pendingBookings || []).filter((booking: any) => {
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
function createPayoutRecord(options: {
  supabase: SupabaseClient<Database>;
  professionalId: string;
  connectAccountId: string;
  payout: PayoutCalculation;
  periodStart: Date;
  periodEnd: Date;
}) {
  return options.supabase
    .from("payouts")
    .insert({
      professional_id: options.professionalId,
      stripe_connect_account_id: options.connectAccountId,
      gross_amount: options.payout.grossAmount,
      commission_amount: options.payout.commissionAmount,
      net_amount: options.payout.netAmount,
      currency: options.payout.currency,
      status: "processing",
      booking_ids: options.payout.bookingIds,
      period_start: options.periodStart.toISOString(),
      period_end: options.periodEnd.toISOString(),
      payout_date: new Date().toISOString(),
    })
    .select()
    .single();
}

// Helper: Create Stripe transfer and update payout
async function processStripeTransfer(options: {
  supabase: SupabaseClient<Database>;
  payoutRecord: PayoutRecord;
  professional: ProfessionalProfile;
  payout: PayoutCalculation;
  periodStart: Date;
  periodEnd: Date;
}) {
  const transfer = await stripe.transfers.create({
    amount: options.payout.netAmount,
    currency: options.payout.currency.toLowerCase(),
    destination: options.professional.stripe_connect_account_id,
    description: `Payout for ${options.payout.bookingCount} bookings (${options.periodStart.toDateString()} - ${options.periodEnd.toDateString()})`,
    metadata: {
      payout_id: options.payoutRecord.id,
      professional_id: options.professional.profile_id,
      booking_count: options.payout.bookingCount.toString(),
      period_start: options.periodStart.toISOString(),
      period_end: options.periodEnd.toISOString(),
    },
  });

  // Calculate arrival date if destination_payment is expanded
  let arrivalDate: string | null = null;
  if (
    transfer.destination_payment &&
    typeof transfer.destination_payment === "object" &&
    "arrival_date" in transfer.destination_payment &&
    typeof transfer.destination_payment.arrival_date === "number"
  ) {
    arrivalDate = new Date(transfer.destination_payment.arrival_date * 1000).toISOString();
  }

  // Update payout record with Stripe transfer ID and status
  await options.supabase
    .from("payouts")
    .update({
      stripe_payout_id: transfer.id,
      status: "paid",
      arrival_date: arrivalDate,
    })
    .eq("id", options.payoutRecord.id);

  // Mark bookings as included in this payout
  await options.supabase
    .from("bookings")
    .update({ included_in_payout_id: options.payoutRecord.id })
    .in("id", options.payout.bookingIds);

  return transfer;
}

// Helper: Process single professional payout
async function processProfessionalPayout(options: {
  supabase: any;
  professional: any;
  periodStart: Date;
  periodEnd: Date;
  dryRun: boolean;
}) {
  // Fetch pending bookings
  const bookingsResult = await fetchPendingBookings(
    options.supabase,
    options.professional.profile_id,
    options.periodStart,
    options.periodEnd
  );

  if (bookingsResult.error) {
    return {
      professionalId: options.professional.profile_id,
      success: false,
      error: "Failed to fetch bookings",
    };
  }

  const periodBookings = bookingsResult.data || [];

  // Skip if no bookings in current period
  if (periodBookings.length === 0) {
    return {
      professionalId: options.professional.profile_id,
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
      professionalId: options.professional.profile_id,
      success: true,
      skipped: true,
      reason: "Net amount is zero",
    };
  }

  // If dry run, just return calculation
  if (options.dryRun) {
    return {
      professionalId: options.professional.profile_id,
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
  const { data: payoutRecord, error: payoutError } = await createPayoutRecord({
    supabase: options.supabase,
    professionalId: options.professional.profile_id,
    connectAccountId: options.professional.stripe_connect_account_id,
    payout,
    periodStart: options.periodStart,
    periodEnd: options.periodEnd,
  });

  if (payoutError || !payoutRecord) {
    return {
      professionalId: options.professional.profile_id,
      success: false,
      error: "Failed to create payout record",
    };
  }

  // Create Stripe transfer
  try {
    const transfer = await processStripeTransfer({
      supabase: options.supabase,
      payoutRecord,
      professional: options.professional,
      payout,
      periodStart: options.periodStart,
      periodEnd: options.periodEnd,
    });

    return {
      professionalId: options.professional.profile_id,
      success: true,
      payoutId: payoutRecord.id,
      stripeTransferId: transfer.id,
      netAmount: payout.netAmount,
      bookingCount: payout.bookingCount,
    };
  } catch (stripeError: any) {
    // Update payout status to failed
    await options.supabase
      .from("payouts")
      .update({
        status: "failed",
        failure_reason: stripeError.message || "Stripe transfer failed",
      })
      .eq("id", payoutRecord.id);

    return {
      professionalId: options.professional.profile_id,
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
    const results: Array<{
      professionalId: string;
      success: boolean;
      error?: string;
      skipped?: boolean;
      reason?: string;
      dryRun?: boolean;
      calculation?: {
        grossAmount: number;
        commissionAmount: number;
        netAmount: number;
        currency: string;
        bookingCount: number;
      };
      payoutId?: string;
      stripeTransferId?: string;
      netAmount?: number;
      bookingCount?: number;
    }> = [];
    for (const professional of professionals) {
      try {
        const result = await processProfessionalPayout({
          supabase,
          professional,
          periodStart,
          periodEnd,
          dryRun,
        });
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

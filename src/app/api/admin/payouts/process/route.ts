import { NextResponse } from "next/server";
import { createAuditLog, requireAdmin } from "@/lib/admin-helpers";
import {
  type BookingForPayout,
  calculatePayoutFromBookings,
  getCurrentPayoutPeriod,
} from "@/lib/payout-calculator";
import { stripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const dynamic = "force-dynamic";

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

    // Verify access: either admin user OR cron secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    let adminId: string | null = null;
    const isCronJob = cronSecret && authHeader === `Bearer ${cronSecret}`;

    if (isCronJob) {
      // Authenticated via cron secret - this is valid
      adminId = "system"; // Use "system" as admin ID for cron jobs
    } else {
      // Require admin authentication for manual requests
      const admin = await requireAdmin();
      adminId = admin.id;
    }

    const body = (await request.json()) as {
      professionalId?: string;
      dryRun?: boolean;
    };

    const { professionalId, dryRun = false } = body;

    // Get current payout period
    const { periodStart, periodEnd } = getCurrentPayoutPeriod();

    // Build query for professionals to process
    let professionalsQuery = supabase
      .from("professional_profiles")
      .select(
        `
        profile_id,
        stripe_connect_account_id,
        stripe_connect_onboarding_status
      `
      )
      .eq("stripe_connect_onboarding_status", "complete")
      .not("stripe_connect_account_id", "is", null);

    if (professionalId) {
      professionalsQuery = professionalsQuery.eq("profile_id", professionalId);
    }

    const { data: professionals, error: profError } = await professionalsQuery;

    if (profError) {
      return NextResponse.json({ error: "Failed to fetch professionals" }, { status: 500 });
    }

    if (!professionals || professionals.length === 0) {
      return NextResponse.json({
        message: "No professionals with completed onboarding found",
        processed: 0,
      });
    }

    const results: Array<{
      professionalId: string;
      success: boolean;
      error?: string;
      skipped?: boolean;
      reason?: string;
      dryRun?: boolean;
      calculation?: any;
      payoutId?: string;
      stripeTransferId?: string;
      netAmount?: number;
      bookingCount?: number;
    }> = [];

    // Process each professional
    for (const professional of professionals) {
      try {
        // Fetch completed bookings in current period not yet paid out
        const { data: pendingBookings, error: bookingsError } = await supabase
          .from("bookings")
          .select(
            `
            id,
            amount_captured,
            currency,
            checked_out_at,
            created_at
          `
          )
          .eq("professional_id", professional.profile_id)
          .eq("status", "completed")
          .not("amount_captured", "is", null)
          .is("included_in_payout_id", null);

        if (bookingsError) {
          results.push({
            professionalId: professional.profile_id,
            success: false,
            error: "Failed to fetch bookings",
          });
          continue;
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

        // Skip if no bookings in current period
        if (periodBookings.length === 0) {
          results.push({
            professionalId: professional.profile_id,
            success: true,
            skipped: true,
            reason: "No bookings in current period",
          });
          continue;
        }

        // Calculate payout
        const payout = calculatePayoutFromBookings(periodBookings as BookingForPayout[]);

        // Skip if net amount is 0
        if (payout.netAmount <= 0) {
          results.push({
            professionalId: professional.profile_id,
            success: true,
            skipped: true,
            reason: "Net amount is zero",
          });
          continue;
        }

        // If dry run, just return calculation
        if (dryRun) {
          results.push({
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
          });
          continue;
        }

        // Create payout record
        const { data: payoutRecord, error: payoutError } = await supabase
          .from("payouts")
          .insert({
            professional_id: professional.profile_id,
            stripe_connect_account_id: professional.stripe_connect_account_id,
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

        if (payoutError || !payoutRecord) {
          results.push({
            professionalId: professional.profile_id,
            success: false,
            error: "Failed to create payout record",
          });
          continue;
        }

        // Create Stripe transfer
        try {
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

          results.push({
            professionalId: professional.profile_id,
            success: true,
            payoutId: payoutRecord.id,
            stripeTransferId: transfer.id,
            netAmount: payout.netAmount,
            bookingCount: payout.bookingCount,
          });
        } catch (stripeError: any) {
          // Update payout status to failed
          await supabase
            .from("payouts")
            .update({
              status: "failed",
              failure_reason: stripeError.message || "Stripe transfer failed",
            })
            .eq("id", payoutRecord.id);

          results.push({
            professionalId: professional.profile_id,
            success: false,
            payoutId: payoutRecord.id,
            error: stripeError.message || "Stripe transfer failed",
          });
        }
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
    return NextResponse.json(
      { error: error.message || "Failed to process payouts" },
      {
        status:
          error.message === "Not authenticated"
            ? 401
            : error.message === "Unauthorized - admin access required"
              ? 403
              : 500,
      }
    );
  }
}

import { NextResponse } from "next/server";
import { withAdvisoryLock } from "@/lib/cron";
import { sendBookingDeclinedEmail } from "@/lib/email/send";
import { formatDate, formatTime } from "@/lib/format";
import { withRateLimit } from "@/lib/rate-limit";
import { stripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

// Better Stack structured logging
const logger = {
  info: (message: string, metadata?: Record<string, unknown>) => {
    console.log(
      JSON.stringify({
        level: "info",
        service: "casaora",
        cron: "auto-decline",
        message,
        ...metadata,
        timestamp: new Date().toISOString(),
      })
    );
  },
  error: (message: string, metadata?: Record<string, unknown>) => {
    console.error(
      JSON.stringify({
        level: "error",
        service: "casaora",
        cron: "auto-decline",
        message,
        ...metadata,
        timestamp: new Date().toISOString(),
      })
    );
  },
  warn: (message: string, metadata?: Record<string, unknown>) => {
    console.warn(
      JSON.stringify({
        level: "warn",
        service: "casaora",
        cron: "auto-decline",
        message,
        ...metadata,
        timestamp: new Date().toISOString(),
      })
    );
  },
};

// Batch size for processing (prevent timeouts)
const BATCH_SIZE = 100;

// Type for Supabase client
type SupabaseClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

// Type for booking data from the query
type BookingData = {
  id: string;
  professional_id: string;
  customer_id: string;
  status: string;
  stripe_payment_intent_id: string | null;
  service_name: string | null;
  scheduled_start: string | null;
  duration_minutes: number | null;
  address: Record<string, unknown> | null;
  updated_at: string;
};

// Helper: Verify cron authorization
function verifyCronAuth(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

// Helper: Get formatted address from booking
function getFormattedAddress(address: Record<string, unknown> | null): string {
  if (!address) {
    return "Not specified";
  }
  if (typeof address === "object" && "formatted" in address) {
    return String(address.formatted);
  }
  return JSON.stringify(address);
}

// Helper: Cancel stripe payment intent
async function cancelStripePayment(paymentIntentId: string): Promise<void> {
  try {
    await stripe.paymentIntents.cancel(paymentIntentId);
  } catch (_stripeError) {
    // Continue even if Stripe cancellation fails
  }
}

// Helper: Update booking to declined status with idempotency tracking
async function declineBooking(supabase: SupabaseClient, bookingId: string): Promise<boolean> {
  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      status: "declined",
      stripe_payment_status: "canceled",
      declined_reason: "professional_no_response",
      auto_declined_at: now,
      processed_by_cron: true,
      updated_at: now,
    })
    .eq("id", bookingId)
    .eq("status", "authorized"); // Double-check status to prevent race conditions

  if (updateError) {
    logger.error("Failed to update booking status", { bookingId, error: updateError.message });
    return false;
  }

  logger.info("Booking auto-declined successfully", { bookingId });
  return true;
}

// Helper: Send decline notification email
async function sendDeclineNotification(
  supabase: SupabaseClient,
  booking: BookingData
): Promise<void> {
  try {
    const { data: professionalProfile } = await supabase
      .from("professional_profiles")
      .select("full_name")
      .eq("profile_id", booking.professional_id)
      .single();

    const { data: customerUser } = await supabase.auth.admin.getUserById(booking.customer_id);

    if (!customerUser?.user?.email) {
      return;
    }

    const scheduledDate = booking.scheduled_start
      ? formatDate(new Date(booking.scheduled_start))
      : "TBD";
    const scheduledTime = booking.scheduled_start
      ? formatTime(new Date(booking.scheduled_start))
      : "TBD";
    const duration = booking.duration_minutes ? `${booking.duration_minutes} minutes` : "TBD";
    const address = getFormattedAddress(booking.address);

    await sendBookingDeclinedEmail(
      customerUser.user.email,
      {
        customerName: customerUser.user.user_metadata?.full_name || "there",
        professionalName: professionalProfile?.full_name || "The professional",
        serviceName: booking.service_name || "Service",
        scheduledDate,
        scheduledTime,
        duration,
        address,
        bookingId: booking.id,
      },
      "The professional did not respond within 24 hours"
    );
  } catch (_emailError) {
    // Don't fail the whole operation if email fails
  }
}

// Helper: Process a single expired booking
async function processExpiredBooking(
  supabase: SupabaseClient,
  booking: BookingData
): Promise<{ success: boolean; error?: string }> {
  try {
    // Cancel the payment intent if it exists
    if (booking.stripe_payment_intent_id) {
      await cancelStripePayment(booking.stripe_payment_intent_id);
    }

    // Update booking status to declined
    const declined = await declineBooking(supabase, booking.id);
    if (!declined) {
      return { success: false, error: "Failed to update booking status" };
    }

    // Send email notification to customer
    await sendDeclineNotification(supabase, booking);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Auto-decline bookings that have been in "authorized" status for more than 24 hours
 * This endpoint should be called by Vercel Cron
 *
 * Features:
 * - Idempotency: Uses declined_reason, auto_declined_at, processed_by_cron columns
 * - Batch processing: Processes up to 100 bookings per run to prevent timeouts
 * - Structured logging: Logs to Better Stack with service/cron tags
 * - Race condition protection: Double-checks status before updating
 *
 * GET /api/cron/auto-decline-bookings
 *
 * Rate Limit: 1 request per 5 minutes (cron tier - prevents concurrent execution)
 */
async function handleAutoDeclineBookings(request: Request) {
  const startTime = Date.now();
  logger.info("Auto-decline cron started");

  try {
    // Verify cron authorization
    if (!verifyCronAuth(request)) {
      logger.warn("Unauthorized cron request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createSupabaseServerClient();

    // Find all bookings that are "authorized" and older than 24 hours
    // Only process bookings NOT already processed by cron (idempotency)
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const { data: expiredBookings, error: fetchError } = await supabase
      .from("bookings")
      .select(`
        id,
        professional_id,
        customer_id,
        status,
        stripe_payment_intent_id,
        service_name,
        scheduled_start,
        duration_minutes,
        address,
        updated_at
      `)
      .eq("status", "authorized")
      .is("processed_by_cron", null) // Only process bookings not yet processed
      .lt("updated_at", twentyFourHoursAgo.toISOString())
      .limit(BATCH_SIZE); // Process in batches to prevent timeouts

    if (fetchError) {
      logger.error("Failed to fetch expired bookings", { error: fetchError.message });
      return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
    }

    if (!expiredBookings || expiredBookings.length === 0) {
      logger.info("No expired bookings to decline");
      return NextResponse.json({
        success: true,
        message: "No expired bookings to decline",
        declined: 0,
      });
    }

    logger.info("Found expired bookings", { count: expiredBookings.length });

    const results = {
      declined: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each expired booking
    for (const booking of expiredBookings) {
      const result = await processExpiredBooking(supabase, booking);

      if (result.success) {
        results.declined++;
      } else {
        results.failed++;
        results.errors.push(`Booking ${booking.id}: ${result.error}`);
      }
    }

    const duration = Date.now() - startTime;
    logger.info("Auto-decline cron completed", {
      duration: `${duration}ms`,
      declined: results.declined,
      failed: results.failed,
    });

    return NextResponse.json({
      success: true,
      message: `Auto-declined ${results.declined} expired booking(s)`,
      declined: results.declined,
      failed: results.failed,
      errors: results.errors.length > 0 ? results.errors : undefined,
      duration: `${duration}ms`,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error("Auto-decline cron failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      duration: `${duration}ms`,
    });

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Apply rate limiting + advisory lock for true single-instance execution
// Rate limit: Fast Redis check prevents retries within 5 minutes
// Advisory lock: Database-level lock prevents concurrent execution across serverless instances
export const GET = withRateLimit(
  withAdvisoryLock("auto-decline-bookings", handleAutoDeclineBookings),
  "cron"
);

import { NextResponse } from "next/server";
import { sendBookingDeclinedEmail } from "@/lib/email/send";
import { formatDate, formatTime } from "@/lib/format";
import { stripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

// Helper: Verify cron authorization
function verifyCronAuth(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

// Helper: Get formatted address from booking
function getFormattedAddress(address: Record<string, any> | null): string {
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

// Helper: Update booking to declined status
async function declineBooking(supabase: any, bookingId: string): Promise<boolean> {
  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      status: "declined",
      stripe_payment_status: "canceled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  return !updateError;
}

// Helper: Send decline notification email
async function sendDeclineNotification(supabase: any, booking: any): Promise<void> {
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
  supabase: any,
  booking: any
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
 * GET /api/cron/auto-decline-bookings
 */
export async function GET(request: Request) {
  try {
    // Verify cron authorization
    if (!verifyCronAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createSupabaseServerClient();

    // Find all bookings that are "authorized" and older than 24 hours
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
      .lt("updated_at", twentyFourHoursAgo.toISOString());

    if (fetchError) {
      return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
    }

    if (!expiredBookings || expiredBookings.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No expired bookings to decline",
        declined: 0,
      });
    }

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

    return NextResponse.json({
      success: true,
      message: `Auto-declined ${results.declined} expired booking(s)`,
      declined: results.declined,
      failed: results.failed,
      errors: results.errors.length > 0 ? results.errors : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

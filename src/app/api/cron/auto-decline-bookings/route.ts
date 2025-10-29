import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { stripe } from "@/lib/stripe";
import { sendBookingDeclinedEmail } from "@/lib/email/send";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * Auto-decline bookings that have been in "authorized" status for more than 24 hours
 * This endpoint should be called by Vercel Cron
 *
 * GET /api/cron/auto-decline-bookings
 */
export async function GET(request: Request) {
  try {
    // Verify this is a cron request (Vercel adds this header)
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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
      console.error("Failed to fetch expired bookings:", fetchError);
      return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
    }

    if (!expiredBookings || expiredBookings.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No expired bookings to decline",
        declined: 0,
      });
    }

    console.log(`Found ${expiredBookings.length} expired booking(s) to auto-decline`);

    const results = {
      declined: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each expired booking
    for (const booking of expiredBookings) {
      try {
        // Cancel the payment intent if it exists
        if (booking.stripe_payment_intent_id) {
          try {
            await stripe.paymentIntents.cancel(booking.stripe_payment_intent_id);
          } catch (stripeError) {
            console.error(`Failed to cancel payment intent ${booking.stripe_payment_intent_id}:`, stripeError);
            // Continue even if Stripe cancellation fails
          }
        }

        // Update booking status to declined
        const { error: updateError } = await supabase
          .from("bookings")
          .update({
            status: "declined",
            stripe_payment_status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("id", booking.id);

        if (updateError) {
          console.error(`Failed to update booking ${booking.id}:`, updateError);
          results.failed++;
          results.errors.push(`Booking ${booking.id}: ${updateError.message}`);
          continue;
        }

        // Send email notification to customer
        try {
          const { data: professionalProfile } = await supabase
            .from("professional_profiles")
            .select("full_name")
            .eq("profile_id", booking.professional_id)
            .single();

          const { data: customerUser } = await supabase.auth.admin.getUserById(booking.customer_id);

          if (customerUser?.user?.email) {
            const scheduledDate = booking.scheduled_start
              ? new Date(booking.scheduled_start).toLocaleDateString()
              : "TBD";
            const scheduledTime = booking.scheduled_start
              ? new Date(booking.scheduled_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : "TBD";
            const duration = booking.duration_minutes
              ? `${booking.duration_minutes} minutes`
              : "TBD";
            const address = booking.address
              ? typeof booking.address === 'object' && 'formatted' in booking.address
                ? String(booking.address.formatted)
                : JSON.stringify(booking.address)
              : "Not specified";

            await sendBookingDeclinedEmail(
              customerUser.user.email,
              {
                customerName: customerUser.user.user_metadata?.full_name || 'there',
                professionalName: professionalProfile?.full_name || 'The professional',
                serviceName: booking.service_name || 'Service',
                scheduledDate,
                scheduledTime,
                duration,
                address,
                bookingId: booking.id,
              },
              "The professional did not respond within 24 hours"
            );
          }
        } catch (emailError) {
          console.error(`Failed to send email for booking ${booking.id}:`, emailError);
          // Don't fail the whole operation if email fails
        }

        results.declined++;
      } catch (error) {
        console.error(`Error processing booking ${booking.id}:`, error);
        results.failed++;
        results.errors.push(
          `Booking ${booking.id}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    console.log(`Auto-decline completed: ${results.declined} declined, ${results.failed} failed`);

    return NextResponse.json({
      success: true,
      message: `Auto-declined ${results.declined} expired booking(s)`,
      declined: results.declined,
      failed: results.failed,
      errors: results.errors.length > 0 ? results.errors : undefined,
    });
  } catch (error) {
    console.error("Auto-decline cron job error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { withRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

/**
 * Rebook API Route
 * Creates a new booking based on a previous completed booking
 * Pre-fills all details except the scheduling date/time
 *
 * Research findings:
 * - Xanh SM doubled repeat orders with optimized re-engagement
 * - Hyatt saw 2.5% conversion lift with "Complete Your Booking" feature
 * - Pre-filled forms reduce booking time by 70%
 */

const rebookSchema = z.object({
  originalBookingId: z.string().uuid(),
  scheduledStart: z.string().datetime().optional(),
  durationMinutes: z.number().int().positive().max(1440).optional(),
});

async function handlePOST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { originalBookingId, scheduledStart, durationMinutes } = rebookSchema.parse(body);

    // Fetch original booking details
    const { data: originalBooking, error: fetchError } = await supabase
      .from("bookings")
      .select(
        `
        *,
        professional:profiles!professional_id (
          id,
          full_name,
          avatar_url
        )
      `
      )
      .eq("id", originalBookingId)
      .eq("customer_id", user.id) // Ensure user owns the booking
      .maybeSingle();

    if (fetchError || !originalBooking) {
      return NextResponse.json(
        { error: "Original booking not found or access denied" },
        { status: 404 }
      );
    }

    // Only allow rebooking of completed bookings
    if (originalBooking.status !== "completed") {
      return NextResponse.json({ error: "Can only rebook completed bookings" }, { status: 400 });
    }

    // Calculate new scheduling details
    const newScheduledStart = scheduledStart;
    let newScheduledEnd: string | null = null;
    const newDuration = durationMinutes || originalBooking.duration_minutes;

    if (newScheduledStart && newDuration) {
      const startDate = new Date(newScheduledStart);
      const endDate = new Date(startDate.getTime() + newDuration * 60 * 1000);
      newScheduledEnd = endDate.toISOString();
    }

    // Create new booking with pre-filled data
    const { data: newBooking, error: createError } = await supabase
      .from("bookings")
      .insert({
        customer_id: user.id,
        professional_id: originalBooking.professional_id,
        scheduled_start: newScheduledStart || null,
        scheduled_end: newScheduledEnd,
        duration_minutes: newDuration,
        status: "pending_payment",
        amount_estimated: originalBooking.amount_estimated || originalBooking.amount_final,
        currency: originalBooking.currency || "cop",
        special_instructions: originalBooking.special_instructions,
        address: originalBooking.address,
        service_name: originalBooking.service_name,
        service_hourly_rate: originalBooking.service_hourly_rate,
      })
      .select()
      .single();

    if (createError || !newBooking) {
      return NextResponse.json(
        { error: createError?.message || "Failed to create rebook" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      bookingId: newBooking.id,
      professional: {
        id: originalBooking.professional_id,
        name: originalBooking.professional?.full_name,
        photo: originalBooking.professional?.avatar_url,
      },
      serviceName: originalBooking.service_name,
      amount: newBooking.amount_estimated,
      durationMinutes: newDuration,
      address: originalBooking.address,
      specialInstructions: originalBooking.special_instructions,
      // Return whether the user still needs to select a date
      needsScheduling: !newScheduledStart,
      redirectTo: newScheduledStart
        ? `/dashboard/customer/bookings/${newBooking.id}/payment`
        : `/dashboard/customer/bookings/${newBooking.id}/schedule`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[Rebook API] Error:", error);
    return NextResponse.json({ error: "Unexpected error during rebook" }, { status: 500 });
  }
}

// Apply rate limiting: 10 rebooks per minute
export const POST = withRateLimit(handlePOST, "rebook");

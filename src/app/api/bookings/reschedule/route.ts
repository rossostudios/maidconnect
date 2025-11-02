import { format } from "date-fns";
import { NextResponse } from "next/server";
import { sendBookingRescheduleEmail } from "@/lib/email/send";
import { notifyProfessionalBookingRescheduled } from "@/lib/notifications";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type RescheduleBookingRequest = {
  bookingId: string;
  newScheduledStart: string; // ISO 8601 datetime
  newDurationMinutes?: number;
};

/**
 * Customer reschedules a booking
 * POST /api/bookings/reschedule
 *
 * This endpoint:
 * - Verifies the customer owns the booking
 * - Validates new datetime is in the future
 * - Updates booking schedule
 * - Resets booking to "authorized" status (professional must re-confirm)
 * - Sends email and in-app notification to professional
 *
 * Note: Rescheduling resets the booking to "authorized" status,
 * requiring the professional to accept the new time.
 */
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as RescheduleBookingRequest;
    const { bookingId, newScheduledStart, newDurationMinutes } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }

    if (!newScheduledStart) {
      return NextResponse.json({ error: "newScheduledStart is required" }, { status: 400 });
    }

    // Validate new datetime is in the future
    const newStartTime = new Date(newScheduledStart);
    const now = new Date();

    if (Number.isNaN(newStartTime.getTime())) {
      return NextResponse.json(
        { error: "Invalid datetime format for newScheduledStart" },
        { status: 400 }
      );
    }

    if (newStartTime <= now) {
      return NextResponse.json(
        { error: "New scheduled time must be in the future" },
        { status: 400 }
      );
    }

    // Fetch the booking with names and address
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        id,
        customer_id,
        professional_id,
        status,
        scheduled_start,
        duration_minutes,
        service_name,
        address_line1,
        address_line2,
        address_city,
        customer_profiles:profiles!bookings_customer_id_fkey(full_name),
        professional_profiles:profiles!bookings_professional_id_fkey(full_name)
      `)
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify this customer owns this booking
    if (booking.customer_id !== user.id) {
      return NextResponse.json(
        { error: "You are not authorized to reschedule this booking" },
        { status: 403 }
      );
    }

    // Check if booking can be rescheduled
    const validStatuses = ["authorized", "confirmed"];
    if (!validStatuses.includes(booking.status)) {
      return NextResponse.json(
        {
          error: `Cannot reschedule booking with status: ${booking.status}. Only authorized or confirmed bookings can be rescheduled.`,
        },
        { status: 400 }
      );
    }

    // Calculate new end time
    const durationToUse = newDurationMinutes || booking.duration_minutes || 60;
    const newEndTime = new Date(newStartTime.getTime() + durationToUse * 60 * 1000);

    // Update booking with new schedule
    // Reset status to "authorized" to require professional re-confirmation
    const { data: updatedBooking, error: updateError } = await supabase
      .from("bookings")
      .update({
        scheduled_start: newStartTime.toISOString(),
        scheduled_end: newEndTime.toISOString(),
        duration_minutes: durationToUse,
        status: "authorized", // Reset to require professional confirmation
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: "Failed to reschedule booking" }, { status: 500 });
    }

    // Send email notification to professional about reschedule request
    try {
      const { data: professionalAuth } = await supabase.auth.admin.getUserById(
        booking.professional_id
      );
      const professionalEmail = professionalAuth?.user?.email;

      if (professionalEmail) {
        const customerName = (booking.customer_profiles as any)?.full_name || "Customer";
        const professionalName =
          (booking.professional_profiles as any)?.full_name || "Professional";
        const address = [booking.address_line1, booking.address_line2, booking.address_city]
          .filter(Boolean)
          .join(", ");

        const oldDate = new Date(booking.scheduled_start);
        const oldScheduledDate = format(oldDate, "MMMM d, yyyy");
        const oldScheduledTime = format(oldDate, "h:mm a");

        const newScheduledDate = format(newStartTime, "MMMM d, yyyy");
        const newScheduledTime = format(newStartTime, "h:mm a");

        await sendBookingRescheduleEmail(
          professionalEmail,
          {
            customerName,
            professionalName,
            serviceName: booking.service_name || "Service",
            scheduledDate: oldScheduledDate,
            scheduledTime: oldScheduledTime,
            duration: `${durationToUse} minutes`,
            address,
            bookingId: booking.id,
          },
          newScheduledDate,
          newScheduledTime,
          true // isForProfessional
        );
      }
    } catch (_emailError) {}

    // Send in-app notification to professional
    const customerName = (booking.customer_profiles as any)?.full_name || "Customer";
    await notifyProfessionalBookingRescheduled(booking.professional_id, {
      id: booking.id,
      serviceName: booking.service_name || "Service",
      customerName,
      newScheduledStart: newStartTime.toISOString(),
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status,
        scheduled_start: updatedBooking.scheduled_start,
        scheduled_end: updatedBooking.scheduled_end,
        duration_minutes: updatedBooking.duration_minutes,
      },
      message:
        "Booking rescheduled successfully. The professional will need to confirm the new time.",
    });
  } catch (_error) {
    return NextResponse.json({ error: "Unable to reschedule booking" }, { status: 500 });
  }
}

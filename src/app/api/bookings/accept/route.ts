import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { sendBookingConfirmedEmail } from "@/lib/email/send";
import { notifyCustomerBookingAccepted } from "@/lib/notifications";

export const runtime = "edge";
export const dynamic = "force-dynamic";

type AcceptBookingRequest = {
  bookingId: string;
};

/**
 * Professional accepts a booking request
 * POST /api/bookings/accept
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
    const body = (await request.json()) as AcceptBookingRequest;
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }

    // Fetch the booking with related data
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        id,
        professional_id,
        customer_id,
        status,
        scheduled_start,
        duration_minutes,
        service_name,
        amount_authorized,
        currency,
        address,
        special_instructions
      `)
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify this professional owns this booking
    if (booking.professional_id !== user.id) {
      return NextResponse.json({ error: "You are not authorized to accept this booking" }, { status: 403 });
    }

    // Can only accept authorized bookings (payment has been authorized)
    if (booking.status !== "authorized") {
      return NextResponse.json(
        { error: `Cannot accept booking with status: ${booking.status}` },
        { status: 400 }
      );
    }

    // Update booking status to confirmed
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "confirmed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Failed to update booking status:", updateError);
      return NextResponse.json({ error: "Failed to accept booking" }, { status: 500 });
    }

    // Fetch customer and professional details for email
    const { data: customerProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", booking.customer_id)
      .single();

    const { data: professionalProfile } = await supabase
      .from("professional_profiles")
      .select("full_name")
      .eq("profile_id", booking.professional_id)
      .single();

    if (customerProfile) {
      // Get customer email
      const { data: customerUser } = await supabase.auth.admin.getUserById(booking.customer_id);

      if (customerUser.user?.email) {
        // Format booking data for email
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
        const amount = booking.amount_authorized
          ? `${new Intl.NumberFormat('es-CO', { style: 'currency', currency: booking.currency || 'COP' }).format(booking.amount_authorized / 100)}`
          : undefined;

        // Send confirmation email to customer
        await sendBookingConfirmedEmail(customerUser.user.email, {
          customerName: customerUser.user.user_metadata?.full_name || 'there',
          professionalName: professionalProfile?.full_name || 'Your professional',
          serviceName: booking.service_name || 'Service',
          scheduledDate,
          scheduledTime,
          duration,
          address,
          bookingId: booking.id,
          amount,
        });

        // Send push notification to customer
        await notifyCustomerBookingAccepted(booking.customer_id, {
          id: booking.id,
          serviceName: booking.service_name || 'Service',
          professionalName: professionalProfile?.full_name || 'Your professional',
        });
      }
    }

    return NextResponse.json({ success: true, booking: { id: booking.id, status: "confirmed" } });
  } catch (error) {
    console.error("Accept booking error:", error);
    return NextResponse.json({ error: "Unable to accept booking" }, { status: 500 });
  }
}

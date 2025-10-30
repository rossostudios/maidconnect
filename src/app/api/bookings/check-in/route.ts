import { NextResponse } from "next/server";
import { notifyCustomerServiceStarted } from "@/lib/notifications";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const runtime = "edge";
export const dynamic = "force-dynamic";

type CheckInRequest = {
  bookingId: string;
  latitude: number;
  longitude: number;
};

/**
 * Professional checks in to start a service
 * POST /api/bookings/check-in
 *
 * Requirements:
 * - Booking must be in "confirmed" status
 * - Only the assigned professional can check in
 * - GPS coordinates are required for verification
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
    const body = (await request.json()) as CheckInRequest;
    const { bookingId, latitude, longitude } = body;

    // Validate required fields
    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return NextResponse.json(
        { error: "Valid latitude and longitude are required" },
        { status: 400 }
      );
    }

    // Validate GPS coordinate ranges
    if (latitude < -90 || latitude > 90) {
      return NextResponse.json({ error: "Latitude must be between -90 and 90" }, { status: 400 });
    }
    if (longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: "Longitude must be between -180 and 180" },
        { status: 400 }
      );
    }

    // Fetch the booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        id,
        professional_id,
        customer_id,
        status,
        scheduled_start,
        service_name,
        address
      `)
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify this professional owns this booking
    if (booking.professional_id !== user.id) {
      return NextResponse.json(
        { error: "You are not authorized to check in to this booking" },
        { status: 403 }
      );
    }

    // Can only check in to confirmed bookings
    if (booking.status !== "confirmed") {
      return NextResponse.json(
        { error: `Cannot check in to booking with status: ${booking.status}` },
        { status: 400 }
      );
    }

    // TODO: Optional GPS verification - check if coordinates are within reasonable distance of booking address
    // This would require geocoding the address and calculating distance
    // For now, we just store the coordinates

    // Update booking to in_progress status with check-in data
    const { data: updatedBooking, error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "in_progress",
        checked_in_at: new Date().toISOString(),
        check_in_latitude: latitude,
        check_in_longitude: longitude,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: "Failed to check in" }, { status: 500 });
    }

    // Fetch professional name for notification
    const { data: professionalProfile } = await supabase
      .from("professional_profiles")
      .select("full_name")
      .eq("profile_id", booking.professional_id)
      .single();

    // Send push notification to customer
    await notifyCustomerServiceStarted(booking.customer_id, {
      id: booking.id,
      serviceName: booking.service_name || "Service",
      professionalName: professionalProfile?.full_name || "Your professional",
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status,
        checked_in_at: updatedBooking.checked_in_at,
      },
    });
  } catch (_error) {
    return NextResponse.json({ error: "Unable to check in" }, { status: 500 });
  }
}

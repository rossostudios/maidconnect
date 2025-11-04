import { NextRequest, NextResponse } from "next/server";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { notifyCustomerProfessionalEnRoute } from "@/lib/notifications";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

// Note: API routes are dynamic by default, no config needed with cacheComponents

/**
 * Arrival Alert API
 *
 * Returns arrival window information for a booking and triggers notifications
 * when the professional is en route.
 *
 * Privacy-conscious design:
 * - No precise GPS location exposed to customers
 * - Time-based arrival windows (30 minutes)
 * - Status updates only (scheduled, en_route, arriving_soon, arrived)
 *
 * GET /api/notifications/arrival-alert?bookingId=123
 * Returns: { arrivalWindow: { status, estimatedArrival, windowStart, windowEnd, lastUpdate } }
 */
export async function GET(request: NextRequest) {
  try {
    // Check if feature is enabled
    if (!isFeatureEnabled("arrival_notifications")) {
      return NextResponse.json(
        { error: "Arrival notifications feature is not enabled" },
        { status: 403 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get bookingId from query params
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId");

    if (!bookingId) {
      return NextResponse.json({ error: "Missing bookingId parameter" }, { status: 400 });
    }

    // Fetch booking details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(
        `
        id,
        status,
        scheduled_start,
        customer_id,
        professional_id,
        check_in_time,
        check_out_time,
        service:services(name),
        professional:profiles!bookings_professional_id_fkey(full_name)
      `
      )
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify user is the customer for this booking
    if (booking.customer_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized - not booking customer" }, { status: 403 });
    }

    // Calculate arrival status
    const now = new Date();
    const scheduledStart = new Date(booking.scheduled_start);

    // Time until scheduled start (in minutes)
    const minutesUntilStart = Math.floor((scheduledStart.getTime() - now.getTime()) / (1000 * 60));

    let status: "scheduled" | "en_route" | "arriving_soon" | "arrived" | "in_progress" =
      "scheduled";
    let estimatedArrival: Date | null = null;
    let windowStart: Date | null = null;
    let windowEnd: Date | null = null;

    // Service already in progress (checked in)
    if (booking.check_in_time) {
      status = "in_progress";
    }
    // Professional has arrived (within 5 minutes of scheduled start and not checked in yet)
    else if (minutesUntilStart <= 5 && minutesUntilStart >= -10) {
      status = "arrived";
      estimatedArrival = scheduledStart;
    }
    // Arriving soon (10-30 minutes before scheduled start)
    else if (minutesUntilStart > 5 && minutesUntilStart <= 30) {
      status = "arriving_soon";
      estimatedArrival = scheduledStart;

      // 30-minute arrival window centered on scheduled time
      windowStart = new Date(scheduledStart.getTime() - 15 * 60 * 1000);
      windowEnd = new Date(scheduledStart.getTime() + 15 * 60 * 1000);

      // Trigger "arriving soon" notification (only once per booking)
      // Check if notification was already sent
      const { data: sentNotification } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", booking.customer_id)
        .eq("tag", `arriving-soon-${bookingId}`)
        .single();

      if (!sentNotification) {
        const professional = Array.isArray(booking.professional)
          ? booking.professional[0]
          : booking.professional;
        const service = Array.isArray(booking.service) ? booking.service[0] : booking.service;

        await notifyCustomerProfessionalEnRoute(booking.customer_id, {
          bookingId: booking.id,
          professionalName: professional?.full_name || "Your professional",
          serviceName: service?.name || "service",
          estimatedArrival: scheduledStart.toISOString(),
          windowStart: windowStart.toISOString(),
          windowEnd: windowEnd.toISOString(),
        });
      }
    }
    // En route (30-60 minutes before scheduled start)
    else if (minutesUntilStart > 30 && minutesUntilStart <= 60) {
      status = "en_route";
      estimatedArrival = scheduledStart;

      // 30-minute arrival window
      windowStart = new Date(scheduledStart.getTime() - 15 * 60 * 1000);
      windowEnd = new Date(scheduledStart.getTime() + 15 * 60 * 1000);
    }
    // Still scheduled (more than 60 minutes away)
    else {
      status = "scheduled";
    }

    return NextResponse.json({
      success: true,
      arrivalWindow: {
        status,
        estimatedArrival: estimatedArrival?.toISOString() || null,
        windowStart: windowStart?.toISOString() || null,
        windowEnd: windowEnd?.toISOString() || null,
        lastUpdate: now.toISOString(),
      },
    });
  } catch (error) {
    console.error("Arrival alert error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST endpoint to manually trigger arrival notifications
 * (Can be called by professional's mobile app when they start traveling to the job)
 */
export async function POST(request: NextRequest) {
  try {
    // Check if feature is enabled
    if (!isFeatureEnabled("arrival_notifications")) {
      return NextResponse.json(
        { error: "Arrival notifications feature is not enabled" },
        { status: 403 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
    }

    // Fetch booking details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(
        `
        id,
        customer_id,
        professional_id,
        scheduled_start,
        service:services(name),
        professional:profiles!bookings_professional_id_fkey(full_name)
      `
      )
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify user is the professional for this booking
    if (booking.professional_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized - not booking professional" },
        { status: 403 }
      );
    }

    // Calculate arrival window
    const scheduledStart = new Date(booking.scheduled_start);
    const windowStart = new Date(scheduledStart.getTime() - 15 * 60 * 1000);
    const windowEnd = new Date(scheduledStart.getTime() + 15 * 60 * 1000);

    // Send "en route" notification to customer
    const professional = Array.isArray(booking.professional)
      ? booking.professional[0]
      : booking.professional;
    const service = Array.isArray(booking.service) ? booking.service[0] : booking.service;

    await notifyCustomerProfessionalEnRoute(booking.customer_id, {
      bookingId: booking.id,
      professionalName: professional?.full_name || "Your professional",
      serviceName: service?.name || "service",
      estimatedArrival: scheduledStart.toISOString(),
      windowStart: windowStart.toISOString(),
      windowEnd: windowEnd.toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "En route notification sent to customer",
    });
  } catch (error) {
    console.error("Arrival alert POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

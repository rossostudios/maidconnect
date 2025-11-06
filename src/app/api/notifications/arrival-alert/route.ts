/**
 * Arrival Alert API
 * GET/POST /api/notifications/arrival-alert
 *
 * REFACTORED: Complexity 29 → <15
 * - Extracted arrival window calculation to arrival-alert-service.ts
 * - Route now focuses on auth and orchestration
 *
 * Returns arrival window information for a booking and triggers notifications
 * when the professional is en route.
 *
 * Privacy-conscious design:
 * - No precise GPS location exposed to customers
 * - Time-based arrival windows (30 minutes)
 * - Status updates only (scheduled, en_route, arriving_soon, arrived)
 */

import { NextRequest, NextResponse } from "next/server";
import { isFeatureEnabled } from "@/lib/feature-flags";
import type { BookingArrivalData } from "@/lib/notifications/arrival-alert-service";
import {
  buildArrivalWindow,
  calculateMinutesUntilStart,
  determineArrivalStatus,
  sendArrivingSoonNotification,
  sendEnRouteNotification,
} from "@/lib/notifications/arrival-alert-service";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

/**
 * GET endpoint - Calculate and return arrival window status
 * GET /api/notifications/arrival-alert?bookingId=123
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

    // Calculate arrival status using service
    const scheduledStart = new Date(booking.scheduled_start);
    const minutesUntilStart = calculateMinutesUntilStart(scheduledStart);
    const hasCheckedIn = Boolean(booking.check_in_time);
    const status = determineArrivalStatus(minutesUntilStart, hasCheckedIn);

    // Build arrival window response using service
    const arrivalWindow = buildArrivalWindow(status, scheduledStart, minutesUntilStart);

    // Trigger "arriving soon" notification if appropriate using service
    if (status === "arriving_soon") {
      await sendArrivingSoonNotification(supabase, booking as BookingArrivalData, scheduledStart);
    }

    return NextResponse.json({
      success: true,
      arrivalWindow,
    });
  } catch (error) {
    console.error("Arrival alert error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST endpoint - Manually trigger arrival notifications
 * (Called by professional's mobile app when they start traveling)
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

    // Send en route notification using service
    const scheduledStart = new Date(booking.scheduled_start);
    await sendEnRouteNotification(booking as BookingArrivalData, scheduledStart);

    return NextResponse.json({
      success: true,
      message: "En route notification sent to customer",
    });
  } catch (error) {
    console.error("Arrival alert POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

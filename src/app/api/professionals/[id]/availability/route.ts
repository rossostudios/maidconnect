import { NextResponse } from "next/server";
import {
  type AvailabilitySettings,
  type DayAvailability,
  getAvailabilityForRange,
} from "@/lib/availability";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const runtime = "edge";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * Get professional availability for a date range
 * GET /api/professionals/[id]/availability?startDate=2025-01-01&endDate=2025-01-31
 *
 * Returns availability status for each day in the range:
 * - available: Many slots available
 * - limited: Few slots remaining
 * - booked: No slots available
 * - blocked: Professional not working (vacation, etc.)
 */
export async function GET(request: Request, context: RouteContext) {
  try {
    const { id: professionalId } = await context.params;
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    if (!startDateParam || !endDateParam) {
      return NextResponse.json(
        { error: "startDate and endDate query parameters are required" },
        { status: 400 }
      );
    }

    const startDate = new Date(startDateParam);
    const endDate = new Date(endDateParam);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    // Fetch professional availability settings
    const { data: professional, error: profError } = await supabase
      .from("professional_profiles")
      .select(
        "availability_settings, blocked_dates, instant_booking_enabled, instant_booking_settings"
      )
      .eq("profile_id", professionalId)
      .single();

    if (profError || !professional) {
      return NextResponse.json({ error: "Professional not found" }, { status: 404 });
    }

    // Parse availability settings with defaults
    const defaultSettings: AvailabilitySettings = {
      working_hours: {
        monday: [{ start: "09:00", end: "17:00" }],
        tuesday: [{ start: "09:00", end: "17:00" }],
        wednesday: [{ start: "09:00", end: "17:00" }],
        thursday: [{ start: "09:00", end: "17:00" }],
        friday: [{ start: "09:00", end: "17:00" }],
      },
      buffer_time_minutes: 30,
      max_bookings_per_day: 3,
      advance_booking_days: 60,
    };

    const rawSettings = professional.availability_settings as any;
    const availabilitySettings: AvailabilitySettings =
      rawSettings && typeof rawSettings === "object" && rawSettings.working_hours
        ? (rawSettings as AvailabilitySettings)
        : defaultSettings;

    const blockedDates: string[] = (professional.blocked_dates as string[]) || [];

    // Fetch existing bookings in the date range
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("scheduled_start, scheduled_end")
      .eq("professional_id", professionalId)
      .in("status", ["pending_payment", "authorized", "confirmed", "in_progress"])
      .gte("scheduled_start", startDate.toISOString())
      .lte("scheduled_start", endDate.toISOString());

    if (bookingsError) {
      console.error("Failed to fetch bookings:", bookingsError);
      return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 });
    }

    // Calculate availability for date range
    const availability: DayAvailability[] = getAvailabilityForRange(
      startDate,
      endDate,
      availabilitySettings,
      (bookings || []) as { scheduled_start: string; scheduled_end: string }[],
      blockedDates
    );

    return NextResponse.json({
      professionalId,
      startDate: startDateParam,
      endDate: endDateParam,
      availability,
      instantBooking: {
        enabled: professional.instant_booking_enabled || false,
        settings: professional.instant_booking_settings || {},
      },
    });
  } catch (error) {
    console.error("Availability API error:", error);
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 });
  }
}

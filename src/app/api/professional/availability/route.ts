import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const runtime = "edge";
export const dynamic = "force-dynamic";

type DaySchedule = {
  day: string;
  enabled: boolean;
  start: string;
  end: string;
};

type UpdateAvailabilityRequest = {
  weeklyHours?: DaySchedule[];
  blockedDates?: string[];
};

/**
 * Update professional availability settings
 * PUT /api/professional/availability
 */
export async function PUT(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify user is a professional
    const { data: professionalProfile } = await supabase
      .from("professional_profiles")
      .select("profile_id")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (!professionalProfile) {
      return NextResponse.json({ error: "Not a professional" }, { status: 403 });
    }

    const body = (await request.json()) as UpdateAvailabilityRequest;

    // Build update object
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    // Update availability_settings (JSONB)
    if (body.weeklyHours !== undefined) {
      updates.availability_settings = {
        weeklyHours: body.weeklyHours,
        updatedAt: new Date().toISOString(),
      };
    }

    // Update blocked_dates (text array)
    if (body.blockedDates !== undefined) {
      updates.blocked_dates = body.blockedDates;
    }

    // Update profile
    const { error: updateError } = await supabase
      .from("professional_profiles")
      .update(updates)
      .eq("profile_id", user.id);

    if (updateError) {
      console.error("Failed to update availability:", updateError);
      return NextResponse.json({ error: "Failed to update availability" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Availability update error:", error);
    return NextResponse.json({ error: "Failed to update availability" }, { status: 500 });
  }
}

/**
 * Get professional availability settings
 * GET /api/professional/availability
 */
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from("professional_profiles")
      .select("availability_settings, blocked_dates")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch availability:", error);
      return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      availability_settings: profile.availability_settings,
      blocked_dates: profile.blocked_dates || [],
    });
  } catch (error) {
    console.error("Availability fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 });
  }
}

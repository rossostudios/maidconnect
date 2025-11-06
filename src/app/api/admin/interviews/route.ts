import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // 1. Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Verify admin role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // 3. Fetch all interview slots with professional information
    const { data: interviews, error: interviewsError } = await supabase
      .from("interview_slots")
      .select(
        `
        id,
        professional_id,
        scheduled_at,
        location,
        location_address,
        status,
        interview_notes,
        completed_by,
        completed_at,
        created_at,
        profiles!interview_slots_professional_id_fkey (
          id,
          full_name,
          email,
          phone,
          city,
          country
        )
      `
      )
      .order("scheduled_at", { ascending: true });

    if (interviewsError) {
      console.error("[Admin] Failed to fetch interviews:", interviewsError);
      return NextResponse.json({ error: "Failed to fetch interviews" }, { status: 500 });
    }

    // 4. Transform data to match component expectations
    const transformedInterviews = interviews.map((interview) => {
      // Extract profile from array (Supabase joins return arrays)
      const interviewProfile = Array.isArray(interview.profiles)
        ? interview.profiles[0]
        : interview.profiles;

      return {
        id: interview.id,
        professional_id: interview.professional_id,
        scheduled_at: interview.scheduled_at,
        location: interview.location,
        location_address: interview.location_address || {},
        status: interview.status,
        interview_notes: interview.interview_notes,
        completed_by: interview.completed_by,
        completed_at: interview.completed_at,
        created_at: interview.created_at,
        professional: interviewProfile
          ? {
              id: interviewProfile.id,
              full_name: interviewProfile.full_name,
              email: interviewProfile.email,
              phone: interviewProfile.phone,
              city: interviewProfile.city,
              country: interviewProfile.country,
            }
          : null,
      };
    });

    // 5. Group interviews by status
    const grouped = {
      scheduled: transformedInterviews.filter((interview) => interview.status === "scheduled"),
      completed: transformedInterviews.filter((interview) => interview.status === "completed"),
      no_show: transformedInterviews.filter((interview) => interview.status === "no_show"),
      cancelled: transformedInterviews.filter((interview) => interview.status === "cancelled"),
    };

    // 6. Count interviews by status
    const counts = {
      scheduled: grouped.scheduled.length,
      completed: grouped.completed.length,
      no_show: grouped.no_show.length,
      cancelled: grouped.cancelled.length,
      total: transformedInterviews.length,
    };

    return NextResponse.json({
      interviews: transformedInterviews,
      grouped,
      counts,
    });
  } catch (error) {
    console.error("[Admin] Interviews API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

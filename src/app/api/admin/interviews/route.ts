/**
 * Admin Interviews API
 *
 * GET /api/admin/interviews
 *
 * Returns all interview slots with professional information.
 * Cached for 1 minute (SHORT duration) to reduce database load.
 */

import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { CACHE_DURATIONS, CACHE_TAGS } from "@/lib/cache";
import { createSupabaseAnonClient } from "@/lib/integrations/supabase/serverClient";
import { withAuth } from "@/lib/shared/api/middleware";

type InterviewProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
};

type TransformedInterview = {
  id: string;
  professional_id: string;
  scheduled_at: string | null;
  location: string | null;
  location_address: Record<string, unknown>;
  status: string | null;
  interview_notes: string | null;
  completed_by: string | null;
  completed_at: string | null;
  created_at: string;
  professional: InterviewProfile | null;
};

type InterviewsData = {
  interviews: TransformedInterview[];
  grouped: {
    scheduled: TransformedInterview[];
    completed: TransformedInterview[];
    no_show: TransformedInterview[];
    cancelled: TransformedInterview[];
  };
  counts: {
    scheduled: number;
    completed: number;
    no_show: number;
    cancelled: number;
    total: number;
  };
};

/**
 * Cached interviews data fetch
 * Uses anon client since this is aggregate data, not user-specific
 */
const getCachedInterviews = unstable_cache(
  async (): Promise<InterviewsData> => {
    const supabase = createSupabaseAnonClient();

    // Fetch all interview slots with professional information
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
      throw new Error("Failed to fetch interviews");
    }

    // Transform data to match component expectations
    const transformedInterviews: TransformedInterview[] = (interviews ?? []).map((interview) => {
      // Extract profile from array (Supabase joins return arrays)
      const interviewProfile = Array.isArray(interview.profiles)
        ? interview.profiles[0]
        : interview.profiles;

      return {
        id: interview.id,
        professional_id: interview.professional_id,
        scheduled_at: interview.scheduled_at,
        location: interview.location,
        location_address: (interview.location_address as Record<string, unknown>) || {},
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

    // Group interviews by status
    const grouped = {
      scheduled: transformedInterviews.filter((interview) => interview.status === "scheduled"),
      completed: transformedInterviews.filter((interview) => interview.status === "completed"),
      no_show: transformedInterviews.filter((interview) => interview.status === "no_show"),
      cancelled: transformedInterviews.filter((interview) => interview.status === "cancelled"),
    };

    // Count interviews by status
    const counts = {
      scheduled: grouped.scheduled.length,
      completed: grouped.completed.length,
      no_show: grouped.no_show.length,
      cancelled: grouped.cancelled.length,
      total: transformedInterviews.length,
    };

    return { interviews: transformedInterviews, grouped, counts };
  },
  ["admin-interviews"],
  {
    revalidate: CACHE_DURATIONS.SHORT,
    tags: [CACHE_TAGS.ADMIN_INTERVIEWS],
  }
);

async function handler(_context: unknown, _req: NextRequest) {
  try {
    const data = await getCachedInterviews();

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Admin] Interviews API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Wrap with auth middleware (admin only)
export const GET = withAuth(handler, { requiredRole: "admin" });

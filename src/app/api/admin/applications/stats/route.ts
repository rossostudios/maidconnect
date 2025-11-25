import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import { CACHE_DURATIONS, CACHE_TAGS } from "@/lib/cache";
import { requireAdmin } from "@/lib/admin-helpers";
import { createSupabaseAnonClient } from "@/lib/integrations/supabase/serverClient";
import { withRateLimit } from "@/lib/utils/rate-limit";

type RawProfessionalData = {
  profile_id: string;
  status: string | null;
  created_at: string;
  profile:
    | { onboarding_status: string | null }
    | { onboarding_status: string | null }[]
    | null;
};

type TransformedProfessional = Omit<RawProfessionalData, "profile"> & {
  profile: { onboarding_status: string | null } | null;
};

type ReviewData = {
  created_at: string;
  reviewed_at: string | null;
  professional_id: string;
};

type ApplicationStatsData = {
  metrics: {
    totalApplications: number;
    pendingReview: number;
    approvalRate: number;
    averageReviewTime: number;
  };
  funnel: { stage: string; count: number; percentage: number }[];
  breakdown: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
};

/**
 * Cached application statistics fetch
 * Uses anon client since this is aggregate data, not user-specific
 */
const getCachedApplicationStats = unstable_cache(
  async (): Promise<ApplicationStatsData> => {
    const supabase = createSupabaseAnonClient();

    // Get start of current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch all professionals created this month
    const { data: professionals, error: professionalsError } = await supabase
      .from("professional_profiles")
      .select(
        `
        profile_id,
        status,
        created_at,
        profile:profiles!professional_profiles_profile_id_fkey(
          onboarding_status
        )
      `
      )
      .gte("created_at", startOfMonth.toISOString());

    if (professionalsError) {
      console.error("[Admin] Failed to fetch professionals:", professionalsError);
      return NextResponse.json({ error: "Failed to fetch application stats" }, { status: 500 });
    }

    // Transform profile from array to object
    const transformedProfessionals = ((professionals || []) as RawProfessionalData[]).map((prof): TransformedProfessional => ({
      ...prof,
      profile: Array.isArray(prof.profile) ? prof.profile[0] : prof.profile,
    }));

    // Count applications by status
    const totalApplications = transformedProfessionals.length;
    const pendingReview = transformedProfessionals.filter(
      (p) => p.profile?.onboarding_status === "application_in_review"
    ).length;
    const approved = transformedProfessionals.filter(
      (p) => p.profile?.onboarding_status === "approved" || p.status === "approved"
    ).length;
    const rejected = transformedProfessionals.filter((p) => p.status === "rejected").length;

    // Calculate approval rate
    const approvalRate =
      totalApplications > 0 ? Math.round((approved / totalApplications) * 100) : 0;

    // Fetch reviews to calculate average review time
    const { data: reviews } = await supabase
      .from("admin_professional_reviews")
      .select("created_at, reviewed_at, professional_id")
      .gte("created_at", startOfMonth.toISOString())
      .not("reviewed_at", "is", null);

    // Calculate average review time in days
    let averageReviewTime = 0;
    if (reviews && reviews.length > 0) {
      const reviewTimes = (reviews as ReviewData[]).map((review) => {
        const created = new Date(review.created_at);
        const reviewed = new Date(review.reviewed_at!);
        return Math.ceil((reviewed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      });
      averageReviewTime = Math.round(
        reviewTimes.reduce((sum, time) => sum + time, 0) / reviewTimes.length
      );
    }

    // Build funnel data
    const applied = totalApplications;
    const reviewed = transformedProfessionals.filter(
      (p) =>
        p.profile?.onboarding_status !== "application_pending" &&
        p.profile?.onboarding_status !== "created"
    ).length;
    const interviewed = transformedProfessionals.filter(
      (p) =>
        p.profile?.onboarding_status === "interview_scheduled" ||
        p.profile?.onboarding_status === "approved" ||
        p.status === "approved"
    ).length;

    const funnel = [
      {
        stage: "Applied",
        count: applied,
        percentage: 100,
      },
      {
        stage: "Reviewed",
        count: reviewed,
        percentage: applied > 0 ? Math.round((reviewed / applied) * 100) : 0,
      },
      {
        stage: "Interviewed",
        count: interviewed,
        percentage: applied > 0 ? Math.round((interviewed / applied) * 100) : 0,
      },
      {
        stage: "Approved",
        count: approved,
        percentage: applied > 0 ? Math.round((approved / applied) * 100) : 0,
      },
    ];

    return {
      metrics: {
        totalApplications,
        pendingReview,
        approvalRate,
        averageReviewTime,
      },
      funnel,
      breakdown: {
        pending: pendingReview,
        approved,
        rejected,
        total: totalApplications,
      },
    };
  },
  ["admin-applications-stats"],
  {
    revalidate: CACHE_DURATIONS.SHORT,
    tags: [CACHE_TAGS.ADMIN_APPLICATIONS],
  }
);

/**
 * Get application statistics and funnel data
 * GET /api/admin/applications/stats
 *
 * Returns metrics for the current month including:
 * - Total applications
 * - Pending review count
 * - Approval rate
 * - Average review time
 * - Funnel visualization data
 */
async function handler(): Promise<NextResponse> {
  try {
    // Verify admin access
    await requireAdmin();

    const data = await getCachedApplicationStats();

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Admin] Application stats error:", error);

    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (error instanceof Error && error.message.includes("Admin access required")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    return NextResponse.json({ error: "Failed to fetch application stats" }, { status: 500 });
  }
}

export const GET = withRateLimit(handler, "admin");

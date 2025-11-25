/**
 * Admin Background Checks API
 *
 * GET /api/admin/background-checks
 *
 * Returns all background checks with transformations.
 * Cached for 1 minute (SHORT duration) to reduce database load.
 *
 * REFACTORED: Complexity 21 → <15
 * - Extracted transformation logic to background-checks-service.ts
 * - Route now focuses on orchestration
 */

import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import type { RawBackgroundCheck } from "@/lib/admin/background-checks-service";
import {
  countChecksByStatus,
  groupChecksByStatus,
  transformBackgroundCheck,
} from "@/lib/admin/background-checks-service";
import { CACHE_DURATIONS, CACHE_TAGS } from "@/lib/cache";
import { createSupabaseAnonClient } from "@/lib/integrations/supabase/serverClient";
import { withAuth } from "@/lib/shared/api/middleware";

type TransformedCheck = ReturnType<typeof transformBackgroundCheck>;

type BackgroundChecksData = {
  checks: TransformedCheck[];
  grouped: ReturnType<typeof groupChecksByStatus>;
  counts: ReturnType<typeof countChecksByStatus>;
};

/**
 * Cached background checks data fetch
 * Uses anon client since this is aggregate data, not user-specific
 */
const getCachedBackgroundChecks = unstable_cache(
  async (): Promise<BackgroundChecksData> => {
    const supabase = createSupabaseAnonClient();

    // Fetch all background checks with professional information
    const { data: checks, error: checksError } = await supabase
      .from("background_checks")
      .select(
        `
        id,
        professional_id,
        provider,
        provider_check_id,
        status,
        result_data,
        completed_at,
        created_at,
        updated_at,
        profiles!background_checks_professional_id_fkey (
          id,
          full_name,
          email,
          phone,
          city,
          country
        )
      `
      )
      .order("created_at", { ascending: false });

    if (checksError) {
      console.error("[Admin] Failed to fetch background checks:", checksError);
      throw new Error("Failed to fetch background checks");
    }

    // Transform data using service
    const transformedChecks = (checks ?? []).map((check) => {
      // Extract profile from array (Supabase joins return arrays)
      const checkProfile = Array.isArray(check.profiles) ? check.profiles[0] : check.profiles;

      return transformBackgroundCheck({
        ...check,
        profiles: checkProfile,
      } as RawBackgroundCheck);
    });

    // Group and count checks using service
    const grouped = groupChecksByStatus(transformedChecks);
    const counts = countChecksByStatus(grouped);

    return { checks: transformedChecks, grouped, counts };
  },
  ["admin-background-checks"],
  {
    revalidate: CACHE_DURATIONS.SHORT,
    tags: [CACHE_TAGS.ADMIN_BACKGROUND_CHECKS],
  }
);

async function handler(_context: unknown, _req: NextRequest) {
  try {
    const data = await getCachedBackgroundChecks();

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Admin] Background checks API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Wrap with auth middleware (admin only)
export const GET = withAuth(handler, { requiredRole: "admin" });

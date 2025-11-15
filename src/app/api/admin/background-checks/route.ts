/**
 * Admin Background Checks API
 * GET /api/admin/background-checks - Get all background checks with transformations
 *
 * REFACTORED: Complexity 21 → <15
 * - Extracted transformation logic to background-checks-service.ts
 * - Route now focuses on orchestration
 *
 * Rate Limit: 10 requests per minute (admin tier)
 */

import { NextResponse } from "next/server";
import type { RawBackgroundCheck } from "@/lib/admin/background-checks-service";
import {
  countChecksByStatus,
  groupChecksByStatus,
  transformBackgroundCheck,
} from "@/lib/admin/background-checks-service";
import { withRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

async function handleGetBackgroundChecks(_request: Request) {
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

    // 3. Fetch all background checks with professional information
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
      return NextResponse.json({ error: "Failed to fetch background checks" }, { status: 500 });
    }

    // 4. Transform data using service
    const transformedChecks = checks.map((check) => {
      // Extract profile from array (Supabase joins return arrays)
      const checkProfile = Array.isArray(check.profiles) ? check.profiles[0] : check.profiles;

      return transformBackgroundCheck({
        ...check,
        profiles: checkProfile,
      } as RawBackgroundCheck);
    });

    // 5. Group and count checks using service
    const grouped = groupChecksByStatus(transformedChecks);
    const counts = countChecksByStatus(grouped);

    return NextResponse.json({
      checks: transformedChecks,
      grouped,
      counts,
    });
  } catch (error) {
    console.error("[Admin] Background checks API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Apply rate limiting: 10 requests per minute (admin tier)
export const GET = withRateLimit(handleGetBackgroundChecks, "admin");

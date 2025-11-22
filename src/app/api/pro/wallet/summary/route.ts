/**
 * Wallet/Earnings Summary API
 * GET /api/pro/wallet/summary - Get professional's career earnings summary
 *
 * Returns:
 * - Total career earnings (total_earnings_cop)
 * - Total bookings completed (total_bookings_completed)
 * - Badge visibility setting (share_earnings_badge)
 * - Public profile slug (for linking to profile)
 */

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { COUNTRIES, type CountryCode } from "@/lib/shared/config/territories";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

// ========================================
// GET: Get Wallet Summary
// ========================================

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "professional") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const { data: profile, error } = await supabase
      .from("professional_profiles")
      .select(
        "total_earnings_cop, total_bookings_completed, share_earnings_badge, slug, country_code"
      )
      .eq("profile_id", user.id)
      .maybeSingle();

    if (error || !profile) {
      logger.error("[Wallet Summary API] Failed to fetch profile", {
        professionalId: user.id,
        error,
      });
      return NextResponse.json({ error: "Professional profile not found" }, { status: 404 });
    }

    // Get currency code from professional's country (default to COP for backward compatibility)
    const countryCode = (profile.country_code as CountryCode) || "CO";
    const currencyCode = COUNTRIES[countryCode]?.currencyCode || "COP";

    return NextResponse.json({
      success: true,
      totalEarningsCOP: profile.total_earnings_cop ?? 0,
      totalBookingsCompleted: profile.total_bookings_completed ?? 0,
      shareEarningsBadge: profile.share_earnings_badge ?? false,
      slug: profile.slug,
      countryCode,
      currencyCode,
    });
  } catch (error) {
    logger.error("[Wallet Summary API] Failed to get summary", {
      professionalId: user.id,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json({ error: "Failed to fetch wallet summary" }, { status: 500 });
  }
}

// ========================================
// Runtime Configuration
// ========================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

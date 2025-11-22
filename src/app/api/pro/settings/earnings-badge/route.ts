/**
 * Earnings Badge Visibility API
 * GET /api/pro/settings/earnings-badge - Get current setting
 * PUT /api/pro/settings/earnings-badge - Update setting
 *
 * Allows professionals to opt-in/out of showing earnings badge on public profile
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

// ========================================
// Validation Schema
// ========================================

const UpdateEarningsBadgeSchema = z.object({
  enabled: z.boolean(),
});

// ========================================
// GET: Get Current Setting
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
      .select("share_earnings_badge, total_bookings_completed, total_earnings_cop")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (error || !profile) {
      return NextResponse.json({ error: "Professional profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      enabled: profile.share_earnings_badge ?? false,
      totalBookings: profile.total_bookings_completed ?? 0,
      totalEarningsCOP: profile.total_earnings_cop ?? 0,
    });
  } catch (error) {
    logger.error("[Earnings Badge API] Failed to get setting", {
      professionalId: user.id,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json({ error: "Failed to fetch earnings badge setting" }, { status: 500 });
  }
}

// ========================================
// PUT: Update Setting
// ========================================

export async function PUT(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "professional") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    // ========================================
    // 1. Parse and Validate Request
    // ========================================

    const body = await request.json();
    const validation = UpdateEarningsBadgeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { enabled } = validation.data;

    // ========================================
    // 2. Update Setting
    // ========================================

    const { data: updatedProfile, error: updateError } = await supabase
      .from("professional_profiles")
      .update({
        share_earnings_badge: enabled,
        updated_at: new Date().toISOString(),
      })
      .eq("profile_id", user.id)
      .select("share_earnings_badge, total_bookings_completed, total_earnings_cop")
      .single();

    if (updateError || !updatedProfile) {
      logger.error("[Earnings Badge API] Failed to update setting", {
        professionalId: user.id,
        enabled,
        error: updateError,
      });

      return NextResponse.json({ error: "Failed to update setting" }, { status: 500 });
    }

    logger.info("[Earnings Badge API] Setting updated successfully", {
      professionalId: user.id,
      enabled,
    });

    // ========================================
    // 3. Return Success Response
    // ========================================

    return NextResponse.json({
      success: true,
      enabled: updatedProfile.share_earnings_badge ?? false,
      totalBookings: updatedProfile.total_bookings_completed ?? 0,
      totalEarningsCOP: updatedProfile.total_earnings_cop ?? 0,
    });
  } catch (error) {
    logger.error("[Earnings Badge API] Failed to update setting", {
      professionalId: user.id,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json({ error: "Failed to update setting" }, { status: 500 });
  }
}

// ========================================
// Runtime Configuration
// ========================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

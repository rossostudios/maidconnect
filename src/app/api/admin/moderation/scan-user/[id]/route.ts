/**
 * Scan User API Endpoint
 * POST /api/admin/moderation/scan-user/[id]
 *
 * Runs all fraud detection checks on a specific user
 * and returns a comprehensive risk assessment.
 *
 * Rate Limit: 10 requests per minute (admin tier)
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-helpers";
import { withRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import {
  calculateRiskScore,
  detectAccountAnomaly,
  detectReviewManipulation,
  detectSuspiciousBookingPattern,
} from "@/lib/utils/fraud-detection";

async function handleScanUser(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const supabase = await createSupabaseServerClient();
    const params = await context.params;
    const userId = params.id;

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role, full_name, email, created_at")
      .eq("id", userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Run all fraud detection checks
    const [bookingPattern, reviewPattern, accountAnomaly, riskScore] = await Promise.all([
      detectSuspiciousBookingPattern(userId),
      detectReviewManipulation(userId, profile.role as "customer" | "professional"),
      detectAccountAnomaly(userId),
      calculateRiskScore(userId),
    ]);

    // Get existing flags for this user
    const { data: existingFlags } = await supabase
      .from("moderation_flags")
      .select("id, flag_type, severity, reason, status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    return NextResponse.json({
      user: {
        id: profile.id,
        name: profile.full_name,
        email: profile.email,
        role: profile.role,
        accountAge: Math.floor(
          (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)
        ),
      },
      riskAssessment: {
        overallScore: riskScore.score,
        recommendation: riskScore.recommendation,
        factors: riskScore.factors,
      },
      detections: {
        bookingPattern: {
          detected: bookingPattern.detected,
          severity: bookingPattern.severity,
          reason: bookingPattern.reason,
          details: bookingPattern.details,
        },
        reviewPattern: {
          detected: reviewPattern.detected,
          severity: reviewPattern.severity,
          reason: reviewPattern.reason,
          details: reviewPattern.details,
        },
        accountAnomaly: {
          detected: accountAnomaly.detected,
          severity: accountAnomaly.severity,
          reason: accountAnomaly.reason,
          details: accountAnomaly.details,
        },
      },
      existingFlags: existingFlags || [],
    });
  } catch (error: any) {
    console.error("Scan user error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to scan user" },
      { status: error.message === "Not authenticated" ? 401 : 500 }
    );
  }
}

// Apply rate limiting: 10 requests per minute (admin tier)
export const POST = withRateLimit(handleScanUser, "admin");

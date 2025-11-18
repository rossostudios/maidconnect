/**
 * Auto-Flag API Endpoint
 * POST /api/admin/moderation/auto-flag
 *
 * Automatically scans all users or a specific user for suspicious activity
 * and creates moderation flags based on fraud detection patterns.
 *
 * Rate Limit: 1 request per minute (admin tier)
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

type AutoFlagRequestBody = {
  userId?: string; // If provided, scan only this user
  scanAll?: boolean; // If true, scan all users (expensive operation)
  daysBack?: number; // How many days back to scan (default: 30)
};

async function handleAutoFlag(request: Request) {
  try {
    const admin = await requireAdmin();
    const supabase = await createSupabaseServerClient();

    const body: AutoFlagRequestBody = await request.json();
    const { userId, scanAll = false, daysBack = 30 } = body;

    // Get users to scan
    let usersToScan: Array<{
      id: string;
      role: string;
      full_name: string | null;
      email: string | null;
    }> = [];

    if (userId) {
      // Scan specific user
      const { data: user } = await supabase
        .from("profiles")
        .select("id, role, full_name, email")
        .eq("id", userId)
        .single();

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      usersToScan = [user];
    } else if (scanAll) {
      // Scan all users (limit to recent users for performance)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysBack);

      const { data: users } = await supabase
        .from("profiles")
        .select("id, role, full_name, email")
        .gte("created_at", cutoffDate.toISOString())
        .limit(1000);

      if (!users) {
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
      }

      usersToScan = users;
    } else {
      return NextResponse.json(
        { error: "Must provide userId or set scanAll=true" },
        { status: 400 }
      );
    }

    // Scan each user and create flags
    const flagsCreated: Array<{
      userId: string;
      userName: string | null;
      flagType: string;
      severity: string;
      reason: string;
    }> = [];

    for (const user of usersToScan) {
      // Run all fraud detection checks
      const [bookingPattern, reviewPattern, accountAnomaly, riskScore] = await Promise.all([
        detectSuspiciousBookingPattern(user.id),
        detectReviewManipulation(user.id, user.role as "customer" | "professional"),
        detectAccountAnomaly(user.id),
        calculateRiskScore(user.id),
      ]);

      // Create flags for detected issues
      const flagsToCreate: Array<{
        user_id: string;
        flag_type: string;
        severity: string;
        reason: string;
        auto_detected: boolean;
        metadata: any;
      }> = [];

      if (bookingPattern.detected) {
        flagsToCreate.push({
          user_id: user.id,
          flag_type: "booking_pattern",
          severity: bookingPattern.severity,
          reason: bookingPattern.reason || "Suspicious booking pattern",
          auto_detected: true,
          metadata: {
            ...bookingPattern.details,
            riskScore: riskScore.score,
          },
        });
      }

      if (reviewPattern.detected) {
        flagsToCreate.push({
          user_id: user.id,
          flag_type: "review_manipulation",
          severity: reviewPattern.severity,
          reason: reviewPattern.reason || "Review manipulation detected",
          auto_detected: true,
          metadata: {
            ...reviewPattern.details,
            riskScore: riskScore.score,
          },
        });
      }

      if (accountAnomaly.detected) {
        flagsToCreate.push({
          user_id: user.id,
          flag_type: "account_anomaly",
          severity: accountAnomaly.severity,
          reason: accountAnomaly.reason || "Account anomaly detected",
          auto_detected: true,
          metadata: {
            ...accountAnomaly.details,
            riskScore: riskScore.score,
          },
        });
      }

      // Insert flags into database
      if (flagsToCreate.length > 0) {
        const { error } = await supabase.from("moderation_flags").insert(flagsToCreate);

        if (error) {
          console.error("Failed to create flags for user:", user.id, error);
        } else {
          for (const flag of flagsToCreate) {
            flagsCreated.push({
              userId: user.id,
              userName: user.full_name,
              flagType: flag.flag_type,
              severity: flag.severity,
              reason: flag.reason,
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      usersScanned: usersToScan.length,
      flagsCreated: flagsCreated.length,
      flags: flagsCreated,
    });
  } catch (error: any) {
    console.error("Auto-flag error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to auto-flag users" },
      { status: error.message === "Not authenticated" ? 401 : 500 }
    );
  }
}

// Apply rate limiting: 1 request per minute (admin tier - prevent abuse)
export const POST = withRateLimit(handleAutoFlag, "admin");

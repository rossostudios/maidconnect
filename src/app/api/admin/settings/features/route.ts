/**
 * Admin Feature Flags API
 * PATCH /api/admin/settings/features - Toggle platform features
 *
 * Rate Limit: 10 requests per minute (admin tier)
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { withRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

const FeatureToggleSchema = z.object({
  feature: z.enum([
    "recurring_bookings",
    "amara_ai",
    "auto_translate",
    "gps_verification",
    "one_tap_rebook",
    "professional_bidding",
    "customer_reviews",
    "tips",
  ]),
  enabled: z.boolean(),
});

async function handlePatchFeatures(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    // 1. Authenticate
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Verify admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3. Validate request body
    const body = await request.json();
    const validated = FeatureToggleSchema.parse(body);

    // 4. Update feature flag in database
    const { error: updateError } = await supabase
      .from("platform_settings")
      .update({
        setting_value: { enabled: validated.enabled },
      })
      .eq("setting_key", `feature_${validated.feature}`);

    if (updateError) {
      console.error("Feature flag update error:", updateError);
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      feature: validated.feature,
      enabled: validated.enabled,
    });
  } catch (error) {
    console.error("Feature toggle error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid feature data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Apply rate limiting: 10 requests per minute (admin tier)
export const PATCH = withRateLimit(handlePatchFeatures, "admin");

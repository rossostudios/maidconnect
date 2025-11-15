/**
 * Admin Business Settings API
 * PATCH /api/admin/settings/business - Update platform business settings
 *
 * Rate Limit: 10 requests per minute (admin tier)
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { withRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

const BusinessSettingsSchema = z.object({
  commission_rate: z.number().min(0).max(50),
  service_fee: z.number().min(0),
  cancellation_fees: z.object({
    customer: z.number().min(0),
    professional: z.number().min(0),
    no_show: z.number().min(0),
  }),
  booking_rules: z.object({
    min_advance_hours: z.number().int().min(0),
    max_duration_hours: z.number().int().min(1),
    min_booking_amount: z.number().min(0),
    max_service_radius_km: z.number().int().min(1),
    auto_accept_threshold: z.number().min(0),
  }),
  payout_settings: z.object({
    schedule: z.enum(["daily", "weekly", "monthly"]),
    min_threshold: z.number().min(0),
    currency: z.string(),
    auto_payout: z.boolean(),
  }),
});

async function handlePatchBusiness(request: Request) {
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
    const validated = BusinessSettingsSchema.parse(body);

    // 4. Update settings in database
    // Update commission rate
    await supabase
      .from("platform_settings")
      .update({
        setting_value: {
          rate: validated.commission_rate,
          type: "percentage",
        },
      })
      .eq("setting_key", "platform_commission_rate");

    // Update service fee
    await supabase
      .from("platform_settings")
      .update({
        setting_value: {
          rate: validated.service_fee,
          type: "fixed",
        },
      })
      .eq("setting_key", "customer_service_fee");

    // Update cancellation fees
    await supabase
      .from("platform_settings")
      .update({
        setting_value: validated.cancellation_fees,
      })
      .eq("setting_key", "cancellation_fee");

    // Update booking rules
    await supabase
      .from("platform_settings")
      .update({
        setting_value: validated.booking_rules,
      })
      .eq("setting_key", "booking_rules");

    // Update payout settings
    await supabase
      .from("platform_settings")
      .update({
        setting_value: validated.payout_settings,
      })
      .eq("setting_key", "payout_settings");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Business settings update error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid settings data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Apply rate limiting: 10 requests per minute (admin tier)
export const PATCH = withRateLimit(handlePatchBusiness, "admin");

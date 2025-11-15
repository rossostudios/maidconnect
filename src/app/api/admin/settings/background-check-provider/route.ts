/**
 * Admin Background Check Provider Settings API
 * POST /api/admin/settings/background-check-provider - Update provider settings
 * GET /api/admin/settings/background-check-provider - Get current provider settings
 *
 * Rate Limit: 10 requests per minute (admin tier)
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { withRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

const SettingsSchema = z.object({
  provider: z.enum(["checkr", "truora"]),
  enabled: z.boolean(),
  auto_initiate: z.boolean(),
});

async function handleUpdateBackgroundCheckProvider(request: Request) {
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

    // 3. Validate request body
    const body = await request.json();
    const validated = SettingsSchema.parse(body);

    // 4. Update platform settings
    const { error: updateError } = await supabase
      .from("platform_settings")
      .update({
        setting_value: {
          provider: validated.provider,
          enabled: validated.enabled,
          auto_initiate: validated.auto_initiate,
        },
      })
      .eq("setting_key", "background_check_provider");

    if (updateError) {
      console.error("[Admin] Failed to update background check provider settings:", updateError);
      return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin] Background check provider settings API error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid settings data" }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function handleGetBackgroundCheckProvider(_request: Request) {
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

    // 3. Fetch platform settings
    const { data: settings, error: settingsError } = await supabase
      .from("platform_settings")
      .select("setting_value")
      .eq("setting_key", "background_check_provider")
      .maybeSingle();

    if (settingsError) {
      console.error("[Admin] Failed to fetch background check provider settings:", settingsError);
      return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }

    // 4. Return settings with defaults if not found
    const settingValue = settings?.setting_value || {
      provider: "checkr",
      enabled: true,
      auto_initiate: false,
    };

    return NextResponse.json(settingValue);
  } catch (error) {
    console.error("[Admin] Background check provider settings GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Apply rate limiting: 10 requests per minute (admin tier)
export const POST = withRateLimit(handleUpdateBackgroundCheckProvider, "admin");
export const GET = withRateLimit(handleGetBackgroundCheckProvider, "admin");

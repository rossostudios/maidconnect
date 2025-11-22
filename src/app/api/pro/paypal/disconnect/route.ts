/**
 * PayPal Account Disconnect API Route
 * POST /api/pro/paypal/disconnect
 *
 * Allows professionals to remove their PayPal email configuration.
 * Available for professionals in Paraguay, Uruguay, and Argentina.
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.user_metadata?.role !== "professional") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Get professional profile with current PayPal configuration
    const { data: profile, error: profileError } = await supabase
      .from("professional_profiles")
      .select("country, paypal_email, paypal_status")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Professional profile not found" }, { status: 404 });
    }

    // Verify PayPal is available for this country
    const professionalCountry = profile.country?.toUpperCase();
    if (!["PY", "UY", "AR"].includes(professionalCountry || "")) {
      return NextResponse.json(
        {
          error: `PayPal is only available for Paraguay, Uruguay, and Argentina. Your country: ${professionalCountry}`,
          country: professionalCountry,
        },
        { status: 400 }
      );
    }

    // Check if PayPal is currently configured
    if (!profile.paypal_email) {
      return NextResponse.json(
        {
          error: "No PayPal account is currently configured",
          status: "not_configured",
        },
        { status: 400 }
      );
    }

    // Remove PayPal configuration
    const { error: updateError } = await supabase
      .from("professional_profiles")
      .update({
        paypal_email: null,
        paypal_status: "disconnected",
        paypal_last_updated: new Date().toISOString(),
      })
      .eq("profile_id", user.id);

    if (updateError) {
      console.error("[PayPal Disconnect] Failed to update profile:", updateError);
      return NextResponse.json({ error: "Failed to disconnect PayPal account" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      status: "disconnected",
      message: "PayPal account disconnected successfully",
    });
  } catch (error) {
    console.error("[PayPal Disconnect] Error:", error);
    return NextResponse.json({ error: "Unable to disconnect PayPal account" }, { status: 500 });
  }
}

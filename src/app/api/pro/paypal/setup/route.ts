/**
 * PayPal Account Setup API Route
 * POST /api/pro/paypal/setup
 *
 * Allows professionals to configure their PayPal email for receiving payouts.
 * Available for professionals in Paraguay, Uruguay, and Argentina.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

const PayPalSetupSchema = z.object({
  paypalEmail: z.string().email("Invalid email address"),
});

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.user_metadata?.role !== "professional") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Get professional profile with country
    const { data: profile, error: profileError } = await supabase
      .from("professional_profiles")
      .select("country, paypal_email")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Professional profile not found" }, { status: 404 });
    }

    // PayPal is only available for Paraguay, Uruguay, and Argentina
    // Colombia uses Stripe Connect
    const professionalCountry = profile.country?.toUpperCase();
    if (professionalCountry === "CO") {
      return NextResponse.json(
        {
          error: "PayPal is not available for Colombia. Please use Stripe Connect integration.",
          paymentProvider: "stripe",
          country: professionalCountry,
        },
        { status: 400 }
      );
    }

    if (!["PY", "UY", "AR"].includes(professionalCountry || "")) {
      return NextResponse.json(
        {
          error: `PayPal payouts are only available for Paraguay, Uruguay, and Argentina. Your country: ${professionalCountry}`,
          country: professionalCountry,
        },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = PayPalSetupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { paypalEmail } = validation.data;

    // Update professional profile with PayPal email
    const { data: updated, error: updateError } = await supabase
      .from("professional_profiles")
      .update({
        paypal_email: paypalEmail,
        paypal_status: "active",
        paypal_last_updated: new Date().toISOString(),
      })
      .eq("profile_id", user.id)
      .select("paypal_email, paypal_status")
      .single();

    if (updateError) {
      console.error("[PayPal Setup] Failed to update profile:", updateError);
      return NextResponse.json({ error: "Failed to update PayPal configuration" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      paypalEmail: updated.paypal_email,
      status: updated.paypal_status,
      message: "PayPal account configured successfully",
    });
  } catch (error) {
    console.error("[PayPal Setup] Error:", error);
    return NextResponse.json({ error: "Unable to configure PayPal account" }, { status: 500 });
  }
}

/**
 * GET /api/pro/paypal/setup
 *
 * Get current PayPal configuration for the professional
 */
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.user_metadata?.role !== "professional") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const { data: profile, error } = await supabase
      .from("professional_profiles")
      .select("country, paypal_email, paypal_status, paypal_last_updated")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (error || !profile) {
      return NextResponse.json({ error: "Professional profile not found" }, { status: 404 });
    }

    const professionalCountry = profile.country?.toUpperCase();

    // Check if PayPal is available for this country
    const paypalAvailable = ["PY", "UY", "AR"].includes(professionalCountry || "");

    return NextResponse.json({
      country: professionalCountry,
      paypalAvailable,
      paypalEmail: profile.paypal_email,
      paypalStatus: profile.paypal_status || "not_configured",
      lastUpdated: profile.paypal_last_updated,
      paymentProvider: paypalAvailable ? "paypal" : "stripe",
    });
  } catch (error) {
    console.error("[PayPal Setup] Error:", error);
    return NextResponse.json({ error: "Unable to fetch PayPal configuration" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const dynamic = "force-dynamic";

/**
 * Check Stripe Connect account status
 * GET /api/pro/stripe/connect-status
 *
 * Returns current status of professional's Stripe Connect account
 */
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "professional") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { data: profile, error } = await supabase
    .from("professional_profiles")
    .select("stripe_connect_account_id, stripe_connect_onboarding_status")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (error || !profile) {
    return NextResponse.json({ error: "Professional profile not found" }, { status: 404 });
  }

  if (!profile.stripe_connect_account_id) {
    return NextResponse.json({
      status: "not_started",
      charges_enabled: false,
      payouts_enabled: false,
    });
  }

  try {
    // Fetch latest account status from Stripe
    const account = await stripe.accounts.retrieve(profile.stripe_connect_account_id);

    // Determine onboarding status
    let onboardingStatus = "pending";
    if (account.details_submitted && account.charges_enabled && account.payouts_enabled) {
      onboardingStatus = "complete";
    } else if (account.details_submitted) {
      onboardingStatus = "submitted";
    }

    // Update our database with latest status
    await supabase
      .from("professional_profiles")
      .update({
        stripe_connect_onboarding_status: onboardingStatus,
        stripe_connect_last_refresh: new Date().toISOString(),
      })
      .eq("profile_id", user.id);

    return NextResponse.json({
      status: onboardingStatus,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
      requirements: {
        currently_due: account.requirements?.currently_due || [],
        eventually_due: account.requirements?.eventually_due || [],
        past_due: account.requirements?.past_due || [],
      },
    });
  } catch (_stripeError) {
    return NextResponse.json({ error: "Failed to fetch account status" }, { status: 500 });
  }
}

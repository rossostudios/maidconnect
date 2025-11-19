import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "professional") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { data: profile, error } = await supabase
    .from("professional_profiles")
    .select("stripe_connect_account_id, stripe_connect_onboarding_status, full_name, country")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (error || !profile) {
    return NextResponse.json({ error: "Professional profile not found" }, { status: 404 });
  }

  // Stripe Connect is only available for Colombia
  // Other countries (Paraguay, Uruguay, Argentina) use PayPal
  const professionalCountry = profile.country?.toUpperCase();
  if (professionalCountry !== "CO") {
    return NextResponse.json(
      {
        error: "Stripe Connect is only available for Colombia. Please use PayPal integration.",
        paymentProvider: "paypal",
        country: professionalCountry,
      },
      { status: 400 }
    );
  }

  let accountId = profile.stripe_connect_account_id ?? undefined;

  try {
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "CO",
        email: user.email ?? undefined,
        business_type: "individual",
        capabilities: {
          transfers: { requested: true },
        },
        metadata: {
          supabase_profile_id: user.id,
        },
      });

      accountId = account.id;
      await supabase
        .from("professional_profiles")
        .update({
          stripe_connect_account_id: accountId,
          stripe_connect_onboarding_status: account.details_submitted ? "submitted" : "pending",
          stripe_connect_last_refresh: new Date().toISOString(),
        })
        .eq("profile_id", user.id);
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId!,
      refresh_url: `${SITE_URL}/dashboard/pro?connect=refresh`,
      return_url: `${SITE_URL}/dashboard/pro?connect=return`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (_accountError) {
    return NextResponse.json({ error: "Unable to start Stripe onboarding" }, { status: 500 });
  }
}

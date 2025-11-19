/**
 * Direct Hire Payment API
 * POST /api/direct-hire
 *
 * Creates a Stripe payment intent for direct hire finder's fee and booking record.
 * This is a one-time fee charged to customers who want to hire a professional
 * off-platform for full-time employment.
 *
 * Rate Limit: 15 requests per minute (payment tier)
 */

import { z } from "zod";
import { ok, withAuth } from "@/lib/api";
import { withRateLimit } from "@/lib/rate-limit";
import { stripe } from "@/lib/stripe";
import { calculateDirectHireFee } from "@/lib/services/bookings/pricingService";
import {
  getTrialCreditInfo,
  applyTrialCredit,
} from "@/lib/services/trial-credits/trialCreditService";

const directHireSchema = z.object({
  professionalId: z.string().uuid("Invalid professional ID"),
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Valid email is required"),
});

const handler = withAuth(async ({ user, supabase }, request: Request) => {
  // Parse and validate request body
  const body = await request.json();
  const { professionalId, customerName, customerEmail } = directHireSchema.parse(body);

  // Calculate direct hire fee from database (server-side validation)
  const feeResult = await calculateDirectHireFee(supabase, professionalId);

  if (!feeResult.success) {
    return new Response(
      JSON.stringify({ error: feeResult.error }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  const { feeCOP, professionalName, professionalId: verifiedProfId } = feeResult.feeData;

  // Check for trial credit and apply discount
  const creditInfo = await getTrialCreditInfo(supabase, user.id, verifiedProfId);
  const pricing = await applyTrialCredit(supabase, user.id, verifiedProfId, feeCOP);

  // Get or create Stripe customer
  const { data: customerRow } = await supabase
    .from("profiles")
    .select("id, stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  let stripeCustomerId = customerRow?.stripe_customer_id as string | undefined;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      name: customerName,
      email: customerEmail ?? user.email ?? undefined,
      metadata: {
        supabase_profile_id: user.id,
      },
    });

    stripeCustomerId = customer.id;

    await supabase
      .from("profiles")
      .update({ stripe_customer_id: stripeCustomerId })
      .eq("id", user.id);
  }

  // Create booking record for tracking
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      customer_id: user.id,
      professional_id: verifiedProfId,
      booking_type: "direct_hire",
      status: "pending",
      total_amount: pricing.finalPriceCOP,  // Discounted price
      currency: "COP",
      service_name: `Direct Hire - ${professionalName}`,
      direct_hire_fee_paid: false,
      original_price_cop: feeCOP,  // Original price before discount
      trial_credit_applied_cop: pricing.discountAppliedCOP,  // Trial discount
    })
    .select("id")
    .single();

  if (bookingError || !booking) {
    return new Response(
      JSON.stringify({ error: "Failed to create booking record" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Create Stripe payment intent (NOT manual capture - this is a one-time finder's fee)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: pricing.finalPriceCOP,  // Discounted price after trial credit
    currency: "cop",
    capture_method: "automatic", // Auto-capture on confirmation
    customer: stripeCustomerId,
    description: `Direct Hire Finder's Fee - ${professionalName}${pricing.discountAppliedCOP > 0 ? " (Trial Credit Applied)" : ""}`,
    metadata: {
      supabase_profile_id: user.id,
      booking_id: booking.id,
      booking_type: "direct_hire",
      professional_id: verifiedProfId,
      professional_name: professionalName,
      customer_id: user.id,
      original_price_cop: feeCOP.toString(),
      trial_credit_applied_cop: pricing.discountAppliedCOP.toString(),
      has_trial_discount: pricing.discountAppliedCOP > 0 ? "true" : "false",
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  // Update booking with payment intent ID
  await supabase
    .from("bookings")
    .update({ stripe_payment_intent_id: paymentIntent.id })
    .eq("id", booking.id);

  return ok({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    bookingId: booking.id,
    feeCOP: pricing.finalPriceCOP,  // Final price after discount
    originalFeeCOP: feeCOP,  // Original price before discount
    trialCreditAppliedCOP: pricing.discountAppliedCOP,
    hasTrialDiscount: pricing.discountAppliedCOP > 0,
    professionalName,
    creditInfo: {
      hasCredit: creditInfo.hasCredit,
      bookingsCompleted: creditInfo.bookingsCompleted,
      percentageEarned: creditInfo.percentageEarned,
    },
  });
});

// Apply rate limiting: 15 requests per minute
export const POST = withRateLimit(handler, "payment");

/**
 * REFACTORED VERSION - Create a Stripe payment intent
 * POST /api/payments/create-intent
 *
 * BEFORE: 113 lines
 * AFTER: 73 lines (35% reduction)
 */

import { withAuth, ok } from "@/lib/api";
import { stripe } from "@/lib/stripe";
import { ValidationError, BusinessRuleError } from "@/lib/errors";
import { z } from "zod";

const SUPPORTED_CURRENCIES = ["cop", "usd", "eur"];
const MAX_AMOUNT_COP = 1_000_000_000; // 1M COP in centavos

const createIntentSchema = z.object({
  amount: z.number().int().positive().max(MAX_AMOUNT_COP, "Amount exceeds maximum allowed"),
  currency: z.string().toLowerCase().refine(
    (val) => SUPPORTED_CURRENCIES.includes(val),
    { message: `Currency must be one of: ${SUPPORTED_CURRENCIES.join(", ")}` }
  ).default("cop"),
  bookingId: z.string().uuid().optional(),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional(),
});

export const POST = withAuth(async ({ user, supabase }, request: Request) => {
  // Parse and validate request body
  const body = await request.json();
  const { amount, currency, bookingId, customerName, customerEmail } = createIntentSchema.parse(body);

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

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    capture_method: "manual",
    customer: stripeCustomerId,
    metadata: {
      supabase_profile_id: user.id,
      ...(bookingId ? { booking_id: bookingId } : {}),
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return ok({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  });
});

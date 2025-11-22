/**
 * Payment Methods API
 * GET /api/payments/methods - List customer's payment methods
 * POST /api/payments/methods - Create setup intent for adding new payment method
 * DELETE /api/payments/methods?paymentMethodId=<id> - Delete a payment method
 */

import { z } from "zod";
import { ok, withCustomer } from "@/lib/api";
import { ValidationError } from "@/lib/errors";
import { stripe } from "@/lib/integrations/stripe";

export type PaymentMethodData = {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
  created: number;
};

// GET: List payment methods
export const GET = withCustomer(async ({ user, supabase }) => {
  // Get Stripe customer ID from profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return ok({ paymentMethods: [], defaultPaymentMethodId: null }, "No payment methods found");
  }

  // Fetch customer to get default payment method
  const customer = await stripe.customers.retrieve(profile.stripe_customer_id);
  if (customer.deleted) {
    return ok({ paymentMethods: [], defaultPaymentMethodId: null }, "Customer not found");
  }

  const defaultPaymentMethodId =
    typeof customer.invoice_settings?.default_payment_method === "string"
      ? customer.invoice_settings.default_payment_method
      : customer.invoice_settings?.default_payment_method?.id || null;

  // Fetch payment methods
  const paymentMethods = await stripe.paymentMethods.list({
    customer: profile.stripe_customer_id,
    type: "card",
  });

  const formattedMethods: PaymentMethodData[] = paymentMethods.data.map((pm) => ({
    id: pm.id,
    brand: pm.card?.brand || "unknown",
    last4: pm.card?.last4 || "****",
    exp_month: pm.card?.exp_month || 0,
    exp_year: pm.card?.exp_year || 0,
    is_default: pm.id === defaultPaymentMethodId,
    created: pm.created,
  }));

  return ok(
    {
      paymentMethods: formattedMethods,
      defaultPaymentMethodId,
    },
    "Payment methods retrieved successfully"
  );
});

// POST: Create setup intent for adding new payment method
export const POST = withCustomer(async ({ user, supabase }) => {
  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, full_name")
    .eq("id", user.id)
    .single();

  let stripeCustomerId = profile?.stripe_customer_id;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      name: profile?.full_name || undefined,
      email: user.email || undefined,
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

  // Create setup intent for adding a payment method
  const setupIntent = await stripe.setupIntents.create({
    customer: stripeCustomerId,
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      supabase_profile_id: user.id,
    },
  });

  return ok(
    {
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id,
    },
    "Setup intent created successfully"
  );
});

const deleteMethodSchema = z.object({
  paymentMethodId: z.string().min(1, "Payment method ID is required"),
});

// DELETE: Delete a payment method
export const DELETE = withCustomer(async ({ user, supabase }, request: Request) => {
  const url = new URL(request.url);
  const paymentMethodId = url.searchParams.get("paymentMethodId");

  const { paymentMethodId: validatedId } = deleteMethodSchema.parse({ paymentMethodId });

  // Verify user owns this payment method
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    throw new ValidationError("No Stripe customer found for this user");
  }

  // Verify the payment method belongs to this customer
  const paymentMethod = await stripe.paymentMethods.retrieve(validatedId);
  if (paymentMethod.customer !== profile.stripe_customer_id) {
    throw new ValidationError("Payment method does not belong to this user");
  }

  // Detach the payment method
  await stripe.paymentMethods.detach(validatedId);

  return ok({ deleted: true, paymentMethodId: validatedId }, "Payment method deleted successfully");
});

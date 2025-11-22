/**
 * Set Default Payment Method
 * PUT /api/payments/methods/default
 */

import { z } from "zod";
import { ok, withCustomer } from "@/lib/api";
import { ValidationError } from "@/lib/errors";
import { stripe } from "@/lib/integrations/stripe";

const setDefaultSchema = z.object({
  paymentMethodId: z.string().min(1, "Payment method ID is required"),
});

export const PUT = withCustomer(async ({ user, supabase }, request: Request) => {
  const body = await request.json();
  const { paymentMethodId } = setDefaultSchema.parse(body);

  // Get Stripe customer ID
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    throw new ValidationError("No Stripe customer found for this user");
  }

  // Verify the payment method belongs to this customer
  const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
  if (paymentMethod.customer !== profile.stripe_customer_id) {
    throw new ValidationError("Payment method does not belong to this user");
  }

  // Update customer's default payment method
  await stripe.customers.update(profile.stripe_customer_id, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  });

  return ok(
    { defaultPaymentMethodId: paymentMethodId },
    "Default payment method updated successfully"
  );
});

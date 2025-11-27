/**
 * Subscription Service
 *
 * Handles Stripe subscription lifecycle management.
 */

import { stripe } from "@/lib/stripe/client";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { SubscriptionPlan } from "./plans";
import { getPlanBySlug } from "./plans";

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired";

export type UserSubscription = {
  id: string;
  userId: string;
  planId: string;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
  status: SubscriptionStatus;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  plan?: SubscriptionPlan;
};

/**
 * Get or create Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string> {
  const supabase = await createSupabaseServerClient();

  // Check if user already has a Stripe customer ID
  const { data: existingSubscription } = await supabase
    .from("user_subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .not("stripe_customer_id", "is", null)
    .limit(1)
    .single();

  if (existingSubscription?.stripe_customer_id) {
    return existingSubscription.stripe_customer_id;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: {
      user_id: userId,
    },
  });

  return customer.id;
}

/**
 * Create a checkout session for a subscription
 */
export async function createSubscriptionCheckout(
  userId: string,
  email: string,
  planSlug: string,
  successUrl: string,
  cancelUrl: string
): Promise<{ sessionId: string; url: string }> {
  const plan = getPlanBySlug(planSlug);
  if (!plan) {
    throw new Error(`Plan not found: ${planSlug}`);
  }

  if (plan.priceCents === 0) {
    throw new Error("Cannot create checkout for free plan");
  }

  const customerId = await getOrCreateStripeCustomer(userId, email);

  // Get or create Stripe price
  const priceId = await getOrCreateStripePrice(plan);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    metadata: {
      user_id: userId,
      plan_slug: planSlug,
    },
    subscription_data: {
      metadata: {
        user_id: userId,
        plan_slug: planSlug,
      },
    },
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session");
  }

  return {
    sessionId: session.id,
    url: session.url,
  };
}

/**
 * Get or create Stripe price for a plan
 */
async function getOrCreateStripePrice(plan: SubscriptionPlan): Promise<string> {
  // Check if we already have the price ID in the database
  const supabase = await createSupabaseServerClient();
  const { data: dbPlan } = await supabase
    .from("subscription_plans")
    .select("stripe_price_id")
    .eq("slug", plan.slug)
    .single();

  if (dbPlan?.stripe_price_id) {
    return dbPlan.stripe_price_id;
  }

  // Create product and price in Stripe
  const product = await stripe.products.create({
    name: `${plan.name} (${plan.planType === "customer" ? "Customer" : "Professional"})`,
    description: plan.description,
    metadata: {
      plan_slug: plan.slug,
      plan_type: plan.planType,
    },
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: plan.priceCents,
    currency: plan.currency.toLowerCase(),
    recurring: {
      interval: plan.billingInterval,
    },
    metadata: {
      plan_slug: plan.slug,
    },
  });

  // Update database with Stripe IDs
  await supabase
    .from("subscription_plans")
    .update({
      stripe_product_id: product.id,
      stripe_price_id: price.id,
    })
    .eq("slug", plan.slug);

  return price.id;
}

/**
 * Get user's active subscription
 */
export async function getUserSubscription(
  userId: string,
  planType?: "customer" | "professional"
): Promise<UserSubscription | null> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("user_subscriptions")
    .select(
      `
      id,
      user_id,
      plan_id,
      stripe_subscription_id,
      stripe_customer_id,
      status,
      current_period_start,
      current_period_end,
      cancel_at_period_end,
      subscription_plans (
        id,
        name,
        slug,
        plan_type,
        price_cents,
        currency,
        billing_interval,
        features,
        priority_badge,
        discount_percentage
      )
    `
    )
    .eq("user_id", userId)
    .in("status", ["active", "trialing"]);

  if (planType) {
    // Join to filter by plan type
    query = query.eq("subscription_plans.plan_type", planType);
  }

  const { data, error } = await query.limit(1).single();

  if (error || !data) {
    return null;
  }

  const planData = data.subscription_plans as any;

  return {
    id: data.id,
    userId: data.user_id,
    planId: data.plan_id,
    stripeSubscriptionId: data.stripe_subscription_id,
    stripeCustomerId: data.stripe_customer_id,
    status: data.status as SubscriptionStatus,
    currentPeriodStart: data.current_period_start,
    currentPeriodEnd: data.current_period_end,
    cancelAtPeriodEnd: data.cancel_at_period_end,
    plan: planData
      ? {
          id: planData.id,
          slug: planData.slug,
          name: planData.name,
          description: "",
          planType: planData.plan_type,
          priceCents: planData.price_cents,
          currency: planData.currency,
          billingInterval: planData.billing_interval,
          features: planData.features || [],
          maxBookingsPerMonth: null,
          priorityBadge: planData.priority_badge,
          discountPercentage: planData.discount_percentage,
        }
      : undefined,
  };
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string, reason?: string): Promise<void> {
  const supabase = await createSupabaseServerClient();

  // Get the subscription
  const { data: subscription, error } = await supabase
    .from("user_subscriptions")
    .select("stripe_subscription_id")
    .eq("id", subscriptionId)
    .single();

  if (error || !subscription) {
    throw new Error("Subscription not found");
  }

  if (subscription.stripe_subscription_id) {
    // Cancel in Stripe (at period end)
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
      metadata: {
        cancellation_reason: reason || "User requested",
      },
    });
  }

  // Update local database
  await supabase
    .from("user_subscriptions")
    .update({
      cancel_at_period_end: true,
      canceled_at: new Date().toISOString(),
      cancellation_reason: reason,
    })
    .eq("id", subscriptionId);
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateSubscription(subscriptionId: string): Promise<void> {
  const supabase = await createSupabaseServerClient();

  const { data: subscription, error } = await supabase
    .from("user_subscriptions")
    .select("stripe_subscription_id")
    .eq("id", subscriptionId)
    .single();

  if (error || !subscription) {
    throw new Error("Subscription not found");
  }

  if (subscription.stripe_subscription_id) {
    // Reactivate in Stripe
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: false,
    });
  }

  // Update local database
  await supabase
    .from("user_subscriptions")
    .update({
      cancel_at_period_end: false,
      canceled_at: null,
      cancellation_reason: null,
    })
    .eq("id", subscriptionId);
}

/**
 * Create a free subscription for a user
 */
export async function createFreeSubscription(
  userId: string,
  planSlug: string
): Promise<UserSubscription> {
  const plan = getPlanBySlug(planSlug);
  if (!plan) {
    throw new Error(`Plan not found: ${planSlug}`);
  }

  if (plan.priceCents !== 0) {
    throw new Error("This is not a free plan");
  }

  const supabase = await createSupabaseServerClient();

  // Get plan ID from database
  const { data: dbPlan } = await supabase
    .from("subscription_plans")
    .select("id")
    .eq("slug", planSlug)
    .single();

  if (!dbPlan) {
    throw new Error("Plan not found in database");
  }

  // Create subscription
  const { data, error } = await supabase
    .from("user_subscriptions")
    .insert({
      user_id: userId,
      plan_id: dbPlan.id,
      status: "active",
      current_period_start: new Date().toISOString(),
      current_period_end: null, // No end for free plans
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create subscription: ${error.message}`);
  }

  return {
    id: data.id,
    userId: data.user_id,
    planId: data.plan_id,
    stripeSubscriptionId: null,
    stripeCustomerId: null,
    status: "active",
    currentPeriodStart: data.current_period_start,
    currentPeriodEnd: data.current_period_end,
    cancelAtPeriodEnd: false,
    plan,
  };
}

/**
 * Check if user has an active paid subscription
 */
async function hasActivePaidSubscription(
  userId: string,
  planType?: "customer" | "professional"
): Promise<boolean> {
  const subscription = await getUserSubscription(userId, planType);
  return subscription !== null && subscription.plan?.priceCents !== 0;
}

/**
 * Get subscription discount for a user
 */
export async function getSubscriptionDiscount(userId: string): Promise<number> {
  const subscription = await getUserSubscription(userId, "customer");
  return subscription?.plan?.discountPercentage || 0;
}

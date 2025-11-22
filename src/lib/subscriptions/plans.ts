/**
 * Subscription Plans Configuration
 *
 * Defines available subscription tiers for customers and professionals.
 * Prices are in cents (USD).
 */

export type PlanType = "customer" | "professional";

export type BillingInterval = "month" | "year";

export interface SubscriptionPlan {
  id: string;
  slug: string;
  name: string;
  description: string;
  planType: PlanType;
  priceCents: number;
  currency: string;
  billingInterval: BillingInterval;
  features: string[];
  maxBookingsPerMonth: number | null;
  priorityBadge: boolean;
  discountPercentage: number;
  stripePriceId?: string;
  popular?: boolean;
}

/**
 * Customer subscription plans
 */
export const CUSTOMER_PLANS: SubscriptionPlan[] = [
  {
    id: "customer-basic",
    slug: "customer-basic",
    name: "Basic",
    description: "Pay only for bookings you make",
    planType: "customer",
    priceCents: 0,
    currency: "USD",
    billingInterval: "month",
    features: [
      "Pay per booking",
      "Access to all professionals",
      "Standard support",
      "Secure payments",
    ],
    maxBookingsPerMonth: null,
    priorityBadge: false,
    discountPercentage: 0,
  },
  {
    id: "customer-pro",
    slug: "customer-pro",
    name: "Pro",
    description: "Unlimited short cleanings for busy households",
    planType: "customer",
    priceCents: 2900, // $29/month
    currency: "USD",
    billingInterval: "month",
    features: [
      "Unlimited 2-hour cleanings",
      "5% discount on longer bookings",
      "Priority support",
      "Favorite professionals list",
      "Schedule recurring bookings",
      "No booking fees",
    ],
    maxBookingsPerMonth: null,
    priorityBadge: false,
    discountPercentage: 5,
    popular: true,
  },
];

/**
 * Professional subscription plans
 */
export const PROFESSIONAL_PLANS: SubscriptionPlan[] = [
  {
    id: "pro-basic",
    slug: "pro-basic",
    name: "Basic",
    description: "Get started and find clients",
    planType: "professional",
    priceCents: 0,
    currency: "USD",
    billingInterval: "month",
    features: [
      "List your services",
      "Accept bookings",
      "Standard visibility",
      "15% platform commission",
    ],
    maxBookingsPerMonth: null,
    priorityBadge: false,
    discountPercentage: 0,
  },
  {
    id: "pro-pro",
    slug: "pro-pro",
    name: "Pro",
    description: "Boost visibility and earn more",
    planType: "professional",
    priceCents: 900, // $9/month
    currency: "USD",
    billingInterval: "month",
    features: [
      "Priority badge on profile",
      "Featured in search results",
      "10% platform commission (reduced)",
      "Analytics dashboard",
      "Priority support",
      "More job notifications",
    ],
    maxBookingsPerMonth: null,
    priorityBadge: true,
    discountPercentage: 0,
    popular: true,
  },
];

/**
 * Get all plans
 */
export function getAllPlans(): SubscriptionPlan[] {
  return [...CUSTOMER_PLANS, ...PROFESSIONAL_PLANS];
}

/**
 * Get plans by type
 */
export function getPlansByType(planType: PlanType): SubscriptionPlan[] {
  return planType === "customer" ? CUSTOMER_PLANS : PROFESSIONAL_PLANS;
}

/**
 * Get plan by slug
 */
export function getPlanBySlug(slug: string): SubscriptionPlan | undefined {
  return getAllPlans().find((plan) => plan.slug === slug);
}

/**
 * Get plan by ID
 */
export function getPlanById(id: string): SubscriptionPlan | undefined {
  return getAllPlans().find((plan) => plan.id === id);
}

/**
 * Format price for display
 */
export function formatPlanPrice(plan: SubscriptionPlan): string {
  if (plan.priceCents === 0) {
    return "Free";
  }
  const price = plan.priceCents / 100;
  return `$${price}/${plan.billingInterval === "month" ? "mo" : "yr"}`;
}

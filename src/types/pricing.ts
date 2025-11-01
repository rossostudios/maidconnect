/**
 * Pricing System Types
 *
 * Type definitions for pricing plans and FAQs
 */

// =============================================
// Pricing Plan Types
// =============================================

export type BillingPeriod = "monthly" | "annual" | "custom";

export type PricingAudience = "customer" | "professional" | "both";

export type PricingFaqCategory = "billing" | "security" | "features" | "general" | "support";

export interface PricingFeatureItem {
  name: string;
  included: boolean;
  limit?: string | null; // e.g., "Up to 10 users", "5GB storage"
  tooltip?: string; // Optional explanation
}

export interface PricingFeatureCategory {
  category: string; // e.g., "Core Features", "Advanced", "Support"
  items: PricingFeatureItem[];
}

export interface PricingPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_monthly: number | null;
  price_annual: number | null;
  currency: string;
  billing_period: BillingPeriod;
  features: PricingFeatureCategory[];
  highlight_as_popular: boolean;
  recommended_for: string | null;
  cta_text: string;
  cta_url: string | null;
  target_audience: PricingAudience;
  display_order: number;
  is_visible: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PricingPlanInput {
  name: string;
  slug: string;
  description: string;
  price_monthly?: number | null;
  price_annual?: number | null;
  currency?: string;
  billing_period?: BillingPeriod;
  features: PricingFeatureCategory[];
  highlight_as_popular?: boolean;
  recommended_for?: string | null;
  cta_text?: string;
  cta_url?: string | null;
  target_audience?: PricingAudience;
  display_order?: number;
  is_visible?: boolean;
  metadata?: Record<string, unknown>;
}

// =============================================
// Pricing FAQ Types
// =============================================

export interface PricingFaq {
  id: string;
  question: string;
  answer: string;
  category: PricingFaqCategory;
  display_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface PricingFaqInput {
  question: string;
  answer: string;
  category?: PricingFaqCategory;
  display_order?: number;
  is_visible?: boolean;
}

// =============================================
// API Response Types
// =============================================

export interface PricingPlansResponse {
  success: boolean;
  data: PricingPlan[];
}

export interface PricingFaqsResponse {
  success: boolean;
  data: PricingFaq[];
}

// =============================================
// Helper Types for UI
// =============================================

export interface PricingToggleOption {
  value: "monthly" | "annual";
  label: string;
  discount?: string; // e.g., "Save 20%"
}

export interface PricingCardProps {
  plan: PricingPlan;
  billingPeriod: "monthly" | "annual";
  isHighlighted?: boolean;
}

// =============================================
// Constants
// =============================================

export const PRICING_TOGGLE_OPTIONS: PricingToggleOption[] = [
  { value: "monthly", label: "Monthly" },
  { value: "annual", label: "Annual", discount: "Save 20%" },
];

export const FAQ_CATEGORIES: Record<PricingFaqCategory, { label: string; icon: string }> = {
  billing: { label: "Billing & Payments", icon: "💳" },
  security: { label: "Security & Privacy", icon: "🔒" },
  features: { label: "Features", icon: "✨" },
  general: { label: "General", icon: "❓" },
  support: { label: "Support", icon: "💬" },
};

// =============================================
// Helper Functions
// =============================================

/**
 * Calculate savings percentage for annual billing
 */
export function calculateSavingsPercentage(
  monthlyPrice: number | null,
  annualPrice: number | null
): number {
  if (!monthlyPrice || !annualPrice) return 0;

  const monthlyTotal = monthlyPrice * 12;
  const savings = monthlyTotal - annualPrice;
  const percentage = (savings / monthlyTotal) * 100;

  return Math.round(percentage);
}

/**
 * Get display price based on billing period
 */
export function getDisplayPrice(
  plan: PricingPlan,
  billingPeriod: "monthly" | "annual"
): { price: number | null; period: string; perMonth?: number } {
  if (billingPeriod === "annual" && plan.price_annual !== null) {
    return {
      price: plan.price_annual,
      period: "year",
      perMonth: Math.round((plan.price_annual / 12) * 100) / 100,
    };
  }

  return {
    price: plan.price_monthly,
    period: "month",
  };
}

/**
 * Format price for display
 */
export function formatPrice(
  price: number | null,
  currency = "USD",
  showDecimals = true
): string {
  if (price === null) {
    return "Custom";
  }

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });

  return formatter.format(price);
}

/**
 * Generate slug from plan name
 */
export function generatePricingSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * Get all features from a plan as a flat list
 */
export function getAllFeatures(plan: PricingPlan): PricingFeatureItem[] {
  return plan.features.flatMap((category) => category.items);
}

/**
 * Check if a specific feature is included in a plan
 */
export function hasFeature(plan: PricingPlan, featureName: string): boolean {
  return getAllFeatures(plan).some((feature) => feature.name === featureName && feature.included);
}

/**
 * Group FAQs by category
 */
export function groupFaqsByCategory(faqs: PricingFaq[]): Record<PricingFaqCategory, PricingFaq[]> {
  const grouped = {
    billing: [],
    security: [],
    features: [],
    general: [],
    support: [],
  } as Record<PricingFaqCategory, PricingFaq[]>;

  faqs.forEach((faq) => {
    grouped[faq.category].push(faq);
  });

  return grouped;
}

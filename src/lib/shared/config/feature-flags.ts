/**
 * Feature Flag Configuration
 *
 * Centralized type-safe feature flag definitions for PostHog integration.
 * All feature flags must be defined here to ensure type safety and prevent typos.
 *
 * @module feature-flags
 */

/**
 * Feature flag keys used in PostHog
 * Add new feature flags here to maintain type safety across the application
 */
export const FEATURE_FLAGS = {
  // Epic G-2: Homepage Hero A/B Test
  HERO_VARIANT: "hero_variant",

  // Epic G-3: Match Wizard Rollout
  MATCH_WIZARD_ENABLED: "match_wizard_enabled",

  // Structured Outputs - AI-Powered Features
  BOOKING_INTENT_DETECTION: "booking_intent_detection",
  DOCUMENT_EXTRACTION: "document_extraction",
  REVIEW_MODERATION_AI: "review_moderation_ai",
  SMART_MATCHING: "smart_matching",
  AI_ANALYTICS: "ai_analytics",

  // Future Feature Flags
  ONE_TAP_REBOOK: "one_tap_rebook",
  ENHANCED_SEARCH: "enhanced_search",
  PREMIUM_FEATURES: "premium_features",
  NEW_CHECKOUT_FLOW: "new_checkout_flow",
} as const;

/**
 * Type-safe feature flag keys
 */
export type FeatureFlagKey = (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS];

/**
 * Feature flag value types
 * PostHog can return string, boolean, or undefined
 */
export type FeatureFlagValue = string | boolean | undefined;

/**
 * Hero variant options for A/B testing
 */
export const HERO_VARIANTS = {
  CONTROL: "control", // Original hero with "Start Your Brief"
  VARIANT_A: "variant_a", // Alternative messaging/CTA
} as const;

export type HeroVariant = (typeof HERO_VARIANTS)[keyof typeof HERO_VARIANTS];

/**
 * Feature flag metadata for documentation and testing
 */
export type FeatureFlagMetadata = {
  key: FeatureFlagKey;
  name: string;
  description: string;
  defaultValue: boolean | string;
  type: "boolean" | "string" | "multivariate";
  variants?: readonly string[];
};

/**
 * All feature flags with metadata
 * Used for documentation, testing, and admin UI
 */
export const FEATURE_FLAG_METADATA: Record<string, FeatureFlagMetadata> = {
  [FEATURE_FLAGS.HERO_VARIANT]: {
    key: FEATURE_FLAGS.HERO_VARIANT,
    name: "Homepage Hero A/B Test",
    description: "Tests different hero section variants to optimize conversion",
    defaultValue: HERO_VARIANTS.CONTROL,
    type: "multivariate",
    variants: Object.values(HERO_VARIANTS),
  },
  [FEATURE_FLAGS.MATCH_WIZARD_ENABLED]: {
    key: FEATURE_FLAGS.MATCH_WIZARD_ENABLED,
    name: "Match Wizard",
    description: "Gradual rollout of AI-powered professional matching wizard",
    defaultValue: false,
    type: "boolean",
  },
  [FEATURE_FLAGS.ONE_TAP_REBOOK]: {
    key: FEATURE_FLAGS.ONE_TAP_REBOOK,
    name: "One-Tap Rebook",
    description: "Quick rebook with one tap from booking history",
    defaultValue: false,
    type: "boolean",
  },
  [FEATURE_FLAGS.ENHANCED_SEARCH]: {
    key: FEATURE_FLAGS.ENHANCED_SEARCH,
    name: "Enhanced Search",
    description: "Improved search with filters and smart matching",
    defaultValue: false,
    type: "boolean",
  },
  [FEATURE_FLAGS.PREMIUM_FEATURES]: {
    key: FEATURE_FLAGS.PREMIUM_FEATURES,
    name: "Premium Features",
    description: "Premium tier features for subscribed users",
    defaultValue: false,
    type: "boolean",
  },
  [FEATURE_FLAGS.NEW_CHECKOUT_FLOW]: {
    key: FEATURE_FLAGS.NEW_CHECKOUT_FLOW,
    name: "New Checkout Flow",
    description: "Redesigned checkout experience with improved conversion",
    defaultValue: false,
    type: "boolean",
  },
  [FEATURE_FLAGS.BOOKING_INTENT_DETECTION]: {
    key: FEATURE_FLAGS.BOOKING_INTENT_DETECTION,
    name: "AI Booking Intent Detection",
    description: "Detects booking intent in Amara chat and suggests relevant actions",
    defaultValue: false,
    type: "boolean",
  },
  [FEATURE_FLAGS.DOCUMENT_EXTRACTION]: {
    key: FEATURE_FLAGS.DOCUMENT_EXTRACTION,
    name: "AI Document Extraction",
    description: "Extracts data from professional vetting documents (IDs, licenses, certificates)",
    defaultValue: false,
    type: "boolean",
  },
  [FEATURE_FLAGS.REVIEW_MODERATION_AI]: {
    key: FEATURE_FLAGS.REVIEW_MODERATION_AI,
    name: "AI Review Moderation",
    description: "Analyzes reviews for sentiment, safety flags, and moderation recommendations",
    defaultValue: false,
    type: "boolean",
  },
  [FEATURE_FLAGS.SMART_MATCHING]: {
    key: FEATURE_FLAGS.SMART_MATCHING,
    name: "AI Smart Matching",
    description: "Natural language professional search with AI-powered matching criteria",
    defaultValue: false,
    type: "boolean",
  },
  [FEATURE_FLAGS.AI_ANALYTICS]: {
    key: FEATURE_FLAGS.AI_ANALYTICS,
    name: "AI Analytics Dashboard",
    description: "AI-generated business intelligence reports and insights for admins",
    defaultValue: false,
    type: "boolean",
  },
};

/**
 * Get feature flag metadata
 */
export function getFeatureFlagMetadata(key: FeatureFlagKey): FeatureFlagMetadata | undefined {
  return FEATURE_FLAG_METADATA[key];
}

/**
 * Get all feature flag keys
 */
export function getAllFeatureFlagKeys(): FeatureFlagKey[] {
  return Object.values(FEATURE_FLAGS);
}

/**
 * Check if a string is a valid feature flag key
 */
export function isValidFeatureFlagKey(key: string): key is FeatureFlagKey {
  return getAllFeatureFlagKeys().includes(key as FeatureFlagKey);
}

/**
 * Feature Flags System
 *
 * Enables A/B testing, gradual rollouts, and environment-specific features.
 * Can be easily migrated to LaunchDarkly or similar service later.
 */

export type FeatureFlag =
  // Business Model Controls (Concierge Migration)
  | "enable_professional_directory" // Show /professionals browsing/listing pages
  | "enable_lead_queue" // Show Lead Queue in professional dashboard
  | "concierge_only_mode" // Master flag: disable all self-service marketplace features

  // Week 1-2 Features
  | "show_match_wizard" // Concierge match wizard for first booking
  | "enable_web_vitals" // Web Vitals reporting

  // Week 3-4 Features
  | "enhanced_trust_badges" // Show verification badges on cards
  | "live_price_breakdown" // Real-time price calculation with fees
  | "show_on_time_metrics" // Display professional arrival reliability

  // Week 5-6 Features
  | "auto_translate_chat" // Auto-translate messages ES/EN
  | "one_tap_rebook" // Quick rebook from notification
  | "recurring_plans" // Weekly/biweekly subscription plans
  | "rebook_nudge_system" // Send rebook nudges 24h/72h after completion (A/B test)

  // Week 7-8 Features
  | "gps_check_in_out" // GPS verification (already implemented)
  | "arrival_notifications" // Notify customer when pro is nearby
  | "time_extension_ui" // In-booking time extension requests
  | "show_amara_assistant" // AI booking assistant with onboarding

  // Week 9-12 Features
  | "admin_verification_queue" // Admin moderation UI (already implemented)
  | "payout_ledger" // Financial reconciliation dashboard
  | "city_landing_pages" // SEO-optimized city pages

  // Pricing Experiments
  | "show_platform_fee" // Display platform fee separately
  | "enable_tipping" // Allow customers to tip professionals
  | "subscription_discount_badges" // Highlight savings with plans

  // Beta Features
  | "caregiver_profiles" // Specialized caregiver/childcare profiles
  | "maintenance_reminders" // Auto-remind for deep clean every 90 days
  | "referral_program"; // Referral credits system

/**
 * Feature flag configuration
 * Can be overridden by environment variables: NEXT_PUBLIC_FEATURE_<FLAG_NAME>=true
 */
const defaultFlags: Record<FeatureFlag, boolean> = {
  // Business Model Controls (Concierge Migration)
  // Set to false initially for safe rollout - can be toggled via env vars
  enable_professional_directory: false, // Disabled: redirects to /concierge
  enable_lead_queue: false, // Disabled: hides Lead Queue from pro dashboard
  concierge_only_mode: true, // Enabled: full concierge-only operation

  // Week 1-2 (Ready to enable)
  show_match_wizard: true,
  enable_web_vitals: false,

  // Week 3-4
  enhanced_trust_badges: false,
  live_price_breakdown: false,
  show_on_time_metrics: false,

  // Week 5-6
  auto_translate_chat: true, // Real-time ES/EN translation in messaging
  one_tap_rebook: true,
  recurring_plans: true,
  rebook_nudge_system: true, // Sprint 2 - A/B test for rebook nudges

  // Week 7-8 (GPS already implemented)
  gps_check_in_out: true, // Already live
  arrival_notifications: true, // Arrival window tracker with 30-min notifications
  time_extension_ui: true, // Improved modal with preset options
  show_amara_assistant: true, // AI assistant with onboarding tooltip

  // Week 9-12 (Admin queue already implemented)
  admin_verification_queue: true, // Already live
  payout_ledger: false,
  city_landing_pages: true, // SEO-optimized city-specific landing pages

  // Pricing Experiments
  show_platform_fee: false,
  enable_tipping: true,
  subscription_discount_badges: false,

  // Beta Features
  caregiver_profiles: false,
  maintenance_reminders: false,
  referral_program: true, // Two-sided referral credit system
};

/**
 * Get environment variable override for a feature flag
 */
function getEnvOverride(flag: FeatureFlag): boolean | undefined {
  const envKey = `NEXT_PUBLIC_FEATURE_${flag.toUpperCase()}`;
  const envValue = process.env[envKey];

  if (envValue === undefined) {
    return;
  }

  return envValue === "true" || envValue === "1";
}

/**
 * Check if a feature flag is enabled
 *
 * Priority:
 * 1. Environment variable override (NEXT_PUBLIC_FEATURE_<FLAG_NAME>)
 * 2. User-specific override (for beta testing)
 * 3. Default configuration
 *
 * @param flag - Feature flag to check
 * @param userId - Optional user ID for user-specific flags
 */
export function isFeatureEnabled(flag: FeatureFlag, userId?: string): boolean {
  // Check environment variable override first
  const envOverride = getEnvOverride(flag);
  if (envOverride !== undefined) {
    return envOverride;
  }

  // User-specific overrides (for beta testing)
  // In the future, this could check a database or external service
  if (userId && isBetaTester(userId, flag)) {
    return true;
  }

  // Default configuration
  return defaultFlags[flag];
}

/**
 * Check if user is a beta tester for a specific feature
 * This can be replaced with a database query or external service call
 */
function isBetaTester(userId: string, flag: FeatureFlag): boolean {
  // Example: Beta testers for specific features
  const betaTesters: Partial<Record<FeatureFlag, string[]>> = {
    show_match_wizard: [], // Add user IDs here for beta testing
    recurring_plans: [],
    // Add more as needed
  };

  return betaTesters[flag]?.includes(userId) ?? false;
}

/**
 * Get all enabled feature flags
 * Useful for debugging and analytics
 */
export function getEnabledFlags(userId?: string): FeatureFlag[] {
  return (Object.keys(defaultFlags) as FeatureFlag[]).filter((flag) =>
    isFeatureEnabled(flag, userId)
  );
}

/**
 * Feature flag context for logging and analytics
 * Include in Better Stack logs to correlate feature usage with errors
 */
export function getFeatureFlagContext(userId?: string): Record<string, boolean> {
  const flags: Record<string, boolean> = {};
  for (const flag of Object.keys(defaultFlags) as FeatureFlag[]) {
    flags[flag] = isFeatureEnabled(flag, userId);
  }
  return flags;
}

/**
 * Percentage-based rollout (0-100)
 * Deterministic based on user ID - same user always gets same result
 *
 * @param percentage - Percentage of users to enable (0-100)
 * @param userId - User ID for deterministic bucketing
 */
export function isInRollout(percentage: number, userId: string): boolean {
  if (percentage <= 0) {
    return false;
  }
  if (percentage >= 100) {
    return true;
  }

  // Simple hash function for deterministic bucketing
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash; // Convert to 32-bit integer
  }

  const bucket = Math.abs(hash) % 100;
  return bucket < percentage;
}

/**
 * Get rebook nudge variant for A/B test
 * 50/50 split: 24h vs 72h delay after booking completion
 *
 * @param userId - User ID for deterministic bucketing
 * @returns '24h' or '72h'
 */
export function getRebookNudgeVariant(userId: string): "24h" | "72h" {
  return isInRollout(50, userId) ? "24h" : "72h";
}

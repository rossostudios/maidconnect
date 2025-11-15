/**
 * PostHog Integration - Client-Side Only
 * Product analytics, feature flags, and session recording
 *
 * NOTE: For server-side tracking, import directly from:
 * - '@/lib/integrations/posthog/server' for server tracking functions
 */

// Feature flag configuration
export {
  FEATURE_FLAG_METADATA,
  FEATURE_FLAGS,
  type FeatureFlagKey,
  type FeatureFlagMetadata,
  type FeatureFlagValue,
  getAllFeatureFlagKeys,
  getFeatureFlagMetadata,
  HERO_VARIANTS,
  type HeroVariant,
  isValidFeatureFlagKey,
} from "@/lib/shared/config/feature-flags";
// Client-side enhanced tracking modules
export { bookingTracking } from "./booking-tracking-client";
// Client-side core exports
export { initPostHog, posthog } from "./client";
// Type-safe feature flags (Epic G-1)
export {
  clearFeatureFlagOverrides,
  getAllFeatureFlags,
  getFeatureFlag,
  getFeatureFlagInfo,
  getFeatureFlagOrDefault,
  getFeatureFlagWithDefault,
  getHeroVariant,
  isAIAnalyticsEnabled,
  // Structured Outputs Feature Checks
  isBookingIntentDetectionEnabled,
  isDocumentExtractionEnabled,
  isFeatureEnabled,
  isFeatureEnabledOrDefault,
  isMatchWizardEnabled,
  isOneTapRebookEnabled,
  isReviewModerationEnabled,
  isSmartMatchingEnabled,
  overrideFeatureFlags,
  reloadFeatureFlags,
} from "./feature-flags";
export { matchWizardTracking } from "./match-wizard-tracking";
export { pmfTracking } from "./pmf-tracking-client";
export {
  identifyAuthenticatedUser,
  trackEmailVerified,
  trackLogin,
  trackLogout,
  trackPlanChange,
  trackProfessionalVerified,
  trackSignup,
  type UserProperties,
  updateUserProfile,
} from "./user-tracking-client";
export {
  bookingEvents,
  funnelEvents,
  identifyUser,
  professionalEvents,
  resetUser,
  searchEvents,
  setUserProperties,
  trackError,
  trackEvent,
} from "./utils";

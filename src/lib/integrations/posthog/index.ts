/**
 * PostHog Integration - Client-Side Only
 * Product analytics, feature flags, and session recording
 *
 * NOTE: For server-side tracking, import directly from:
 * - '@/lib/integrations/posthog/server' for server tracking functions
 */

// Client-side enhanced tracking modules
export { bookingTracking } from "./booking-tracking-client";
// Client-side core exports
export { initPostHog, posthog } from "./client";
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
  getFeatureFlag,
  identifyUser,
  isFeatureEnabled,
  professionalEvents,
  resetUser,
  searchEvents,
  setUserProperties,
  trackError,
  trackEvent,
} from "./utils";

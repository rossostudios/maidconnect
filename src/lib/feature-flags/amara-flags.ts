/**
 * Amara Feature Flags
 *
 * PostHog feature flag utilities for Amara AI.
 * Manages rollout of Amara V2 (Generative UI).
 */

/**
 * Amara feature flag names
 */
export const AMARA_FLAGS = {
  /**
   * Enable Amara V2 (Generative UI)
   */
  ENABLE_V2: 'enable-amara-v2',

  /**
   * Enable availability selector component
   */
  ENABLE_AVAILABILITY_SELECTOR: 'enable-amara-availability-selector',

  /**
   * Enable booking summary component
   */
  ENABLE_BOOKING_SUMMARY: 'enable-amara-booking-summary',

  /**
   * Enable smart re-booking nudges
   */
  ENABLE_SMART_NUDGES: 'enable-amara-smart-nudges',
} as const;

/**
 * Check if Amara V2 is enabled (client-side)
 */
export function isAmaraV2Enabled(): boolean {
  if (typeof window === 'undefined' || !(window as any).posthog) {
    return false;
  }

  return (window as any).posthog.isFeatureEnabled(AMARA_FLAGS.ENABLE_V2) === true;
}

/**
 * Check if availability selector is enabled (client-side)
 */
export function isAvailabilitySelectorEnabled(): boolean {
  if (typeof window === 'undefined' || !(window as any).posthog) {
    return false;
  }

  return (
    (window as any).posthog.isFeatureEnabled(AMARA_FLAGS.ENABLE_AVAILABILITY_SELECTOR) === true
  );
}

/**
 * Check if booking summary is enabled (client-side)
 */
export function isBookingSummaryEnabled(): boolean {
  if (typeof window === 'undefined' || !(window as any).posthog) {
    return false;
  }

  return (window as any).posthog.isFeatureEnabled(AMARA_FLAGS.ENABLE_BOOKING_SUMMARY) === true;
}

/**
 * Check if smart nudges are enabled (client-side)
 */
export function isSmartNudgesEnabled(): boolean {
  if (typeof window === 'undefined' || !(window as any).posthog) {
    return false;
  }

  return (window as any).posthog.isFeatureEnabled(AMARA_FLAGS.ENABLE_SMART_NUDGES) === true;
}

/**
 * Get all Amara feature flags state
 */
export function getAmaraFlagsState() {
  if (typeof window === 'undefined' || !(window as any).posthog) {
    return {
      v2Enabled: false,
      availabilitySelectorEnabled: false,
      bookingSummaryEnabled: false,
      smartNudgesEnabled: false,
    };
  }

  return {
    v2Enabled: isAmaraV2Enabled(),
    availabilitySelectorEnabled: isAvailabilitySelectorEnabled(),
    bookingSummaryEnabled: isBookingSummaryEnabled(),
    smartNudgesEnabled: isSmartNudgesEnabled(),
  };
}

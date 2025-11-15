/**
 * PostHog Utility Functions
 * Common analytics tracking helpers
 */

import { posthog } from "./client";

/**
 * Identify user with PostHog
 */
export function identifyUser(userId: string, properties?: Record<string, any>) {
  if (typeof window === "undefined") {
    return;
  }

  posthog.identify(userId, properties);
}

/**
 * Track custom event
 */
export function trackEvent(event: string, properties?: Record<string, any>) {
  if (typeof window === "undefined") {
    return;
  }

  posthog.capture(event, properties);
}

/**
 * Track booking events
 */
export const bookingEvents = {
  started: (data: { service: string; city?: string }) => trackEvent("Booking Started", data),

  completed: (data: { bookingId: string; amount: number; service: string }) =>
    trackEvent("Booking Completed", data),

  cancelled: (data: { bookingId: string; reason?: string }) =>
    trackEvent("Booking Cancelled", data),
};

/**
 * Track search events
 */
export const searchEvents = {
  performed: (data: { query: string; resultCount: number; locale: string }) =>
    trackEvent("Search Performed", data),

  resultClicked: (data: { query: string; resultId: string; position: number }) =>
    trackEvent("Search Result Clicked", data),
};

/**
 * Track professional events
 */
export const professionalEvents = {
  viewed: (data: { professionalId: string; source?: string }) =>
    trackEvent("Professional Viewed", data),

  contacted: (data: { professionalId: string; method: string }) =>
    trackEvent("Professional Contacted", data),

  favorited: (data: { professionalId: string }) => trackEvent("Professional Favorited", data),
};

/**
 * Track conversion funnel
 */
export const funnelEvents = {
  viewedLanding: () => trackEvent("Viewed Landing Page"),
  clickedCTA: (ctaText: string) => trackEvent("Clicked CTA", { ctaText }),
  startedSignup: () => trackEvent("Started Signup"),
  completedSignup: (method: string) => trackEvent("Completed Signup", { method }),
  viewedPricing: () => trackEvent("Viewed Pricing"),
};

/**
 * Reset user identity (e.g., on logout)
 */
export function resetUser() {
  if (typeof window === "undefined") {
    return;
  }

  posthog.reset();
}

/**
 * Check if feature flag is enabled
 */
export function isFeatureEnabled(flagKey: string, defaultValue = false): boolean {
  if (typeof window === "undefined") {
    return defaultValue;
  }

  return posthog.isFeatureEnabled(flagKey) ?? defaultValue;
}

/**
 * Get feature flag variant
 */
export function getFeatureFlag(flagKey: string): string | boolean | undefined {
  if (typeof window === "undefined") {
    return;
  }

  return posthog.getFeatureFlag(flagKey);
}

/**
 * Set user properties
 */
export function setUserProperties(properties: Record<string, any>) {
  if (typeof window === "undefined") {
    return;
  }

  posthog.setPersonProperties(properties);
}

/**
 * Track error
 */
export function trackError(error: Error, context?: Record<string, any>) {
  if (typeof window === "undefined") {
    return;
  }

  posthog.capture("Error Occurred", {
    error: error.message,
    stack: error.stack,
    ...context,
  });
}

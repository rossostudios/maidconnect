/**
 * PostHog Utility Functions
 * Common analytics tracking helpers
 */

import { posthog } from "./client";

/**
 * Required properties for ALL PostHog events (multi-country support)
 * CRITICAL: These properties enable market-specific analytics and feature flags
 */
export interface RequiredEventProperties {
  /** User's country code (CO, PY, UY, AR) - REQUIRED for market analysis */
  country_code: "CO" | "PY" | "UY" | "AR";
  /** User's role (customer, professional, admin) - REQUIRED for role segmentation */
  role: "customer" | "professional" | "admin";
  /** User's city ID - Optional for granular location analysis */
  city_id?: string;
  /** Currency code (COP, PYG, UYU, ARS) - Required for transaction events */
  currency?: "COP" | "PYG" | "UYU" | "ARS";
  /** User's locale (es, en) - Optional for language preference */
  locale?: "es" | "en";
}

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
  started: (data: RequiredEventProperties & { service: string; city?: string }) =>
    trackEvent("Booking Started", data),

  completed: (
    data: RequiredEventProperties & {
      bookingId: string;
      amount: number;
      service: string;
    },
  ) => trackEvent("Booking Completed", data),

  cancelled: (data: RequiredEventProperties & { bookingId: string; reason?: string }) =>
    trackEvent("Booking Cancelled", data),
};

/**
 * Track search events
 */
export const searchEvents = {
  performed: (data: RequiredEventProperties & { query: string; resultCount: number }) =>
    trackEvent("Search Performed", data),

  resultClicked: (
    data: RequiredEventProperties & { query: string; resultId: string; position: number },
  ) => trackEvent("Search Result Clicked", data),
};

/**
 * Track professional events
 */
export const professionalEvents = {
  viewed: (data: RequiredEventProperties & { professionalId: string; source?: string }) =>
    trackEvent("Professional Viewed", data),

  contacted: (data: RequiredEventProperties & { professionalId: string; method: string }) =>
    trackEvent("Professional Contacted", data),

  favorited: (data: RequiredEventProperties & { professionalId: string }) =>
    trackEvent("Professional Favorited", data),
};

/**
 * Track conversion funnel
 */
export const funnelEvents = {
  viewedLanding: (data: RequiredEventProperties) => trackEvent("Viewed Landing Page", data),
  clickedCTA: (data: RequiredEventProperties & { ctaText: string }) =>
    trackEvent("Clicked CTA", data),
  startedSignup: (data: RequiredEventProperties) => trackEvent("Started Signup", data),
  completedSignup: (data: RequiredEventProperties & { method: string }) =>
    trackEvent("Completed Signup", data),
  viewedPricing: (data: RequiredEventProperties) => trackEvent("Viewed Pricing", data),
};

/**
 * Track intro video events (Phase 1.2 - Professional Trust Features)
 */
export const videoEvents = {
  /** Professional uploads a new intro video */
  uploaded: (
    data: RequiredEventProperties & {
      professionalId: string;
      durationSeconds: number;
      fileSizeMb: number;
    },
  ) => trackEvent("Video Uploaded", data),

  /** Customer or admin views a professional's intro video */
  viewed: (
    data: RequiredEventProperties & {
      professionalId: string;
      videoStatus: "pending_review" | "approved" | "rejected";
      viewerRole: "customer" | "admin";
    },
  ) => trackEvent("Video Viewed", data),

  /** Admin approves a professional's intro video */
  approved: (
    data: RequiredEventProperties & {
      professionalId: string;
      reviewedBy: string;
      reviewTimeMinutes: number;
    },
  ) => trackEvent("Video Approved", data),

  /** Admin rejects a professional's intro video */
  rejected: (
    data: RequiredEventProperties & {
      professionalId: string;
      reviewedBy: string;
      rejectionReason: string;
      reviewTimeMinutes: number;
    },
  ) => trackEvent("Video Rejected", data),
};

/**
 * Track concierge interaction events (Phase 1.4 - Human-Powered Support)
 */
export const conciergeEvents = {
  /** Customer initiates chat with concierge team */
  chatStarted: (
    data: RequiredEventProperties & {
      source: "booking_flow" | "profile_page" | "help_center" | "direct";
      topic?: string;
    },
  ) => trackEvent("Concierge Chat Started", data),

  /** Customer requests direct hire placement (higher-fee service) */
  directHireRequested: (
    data: RequiredEventProperties & {
      serviceType: string;
      estimatedSalaryRange?: string;
      urgency: "immediate" | "within_week" | "within_month" | "flexible";
    },
  ) => trackEvent("Concierge Direct Hire Requested", data),

  /** Concierge team completes a direct hire placement */
  placementCompleted: (
    data: RequiredEventProperties & {
      placementId: string;
      serviceType: string;
      timeToPlacementDays: number;
      conciergeFeeCents: number;
    },
  ) => trackEvent("Concierge Placement Completed", data),

  /** Concierge reassigns a professional to resolve booking issues */
  professionalReassigned: (
    data: RequiredEventProperties & {
      bookingId: string;
      originalProfessionalId: string;
      newProfessionalId: string;
      reason: string;
    },
  ) => trackEvent("Concierge Professional Reassigned", data),
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
 * Multi-country context for analytics
 * Used to automatically attach country/currency info to all events
 */
export type MultiCountryContext = {
  /** User's country code (CO, PY, UY, AR) */
  country_code?: "CO" | "PY" | "UY" | "AR";
  /** User's city ID */
  city_id?: string;
  /** Currency code based on country */
  currency?: "COP" | "PYG" | "UYU" | "ARS";
  /** Payment processor for this market */
  payment_processor?: "stripe" | "paypal";
  /** User's role */
  role?: "customer" | "professional" | "admin";
  /** User's locale */
  locale?: "es" | "en";
};

/**
 * Register super properties that are automatically attached to ALL events
 * CRITICAL: Call this when user is identified to ensure multi-country context
 *
 * Super properties persist across page loads and are included in every event
 */
export function registerMultiCountryContext(context: MultiCountryContext) {
  if (typeof window === "undefined") {
    return;
  }

  // Map country to payment processor
  const paymentProcessor =
    context.country_code === "CO" ? "stripe" : context.country_code ? "paypal" : undefined;

  // Map country to currency
  const currencyMap: Record<string, "COP" | "PYG" | "UYU" | "ARS"> = {
    CO: "COP",
    PY: "PYG",
    UY: "UYU",
    AR: "ARS",
  };
  const currency = context.country_code
    ? currencyMap[context.country_code] || context.currency
    : context.currency;

  // Register as super properties (attached to all future events)
  posthog.register({
    country_code: context.country_code,
    city_id: context.city_id,
    currency: currency,
    payment_processor: context.payment_processor || paymentProcessor,
    role: context.role,
    locale: context.locale,
  });
}

/**
 * Clear super properties (call on logout)
 */
export function clearMultiCountryContext() {
  if (typeof window === "undefined") {
    return;
  }

  posthog.unregister("country_code");
  posthog.unregister("city_id");
  posthog.unregister("currency");
  posthog.unregister("payment_processor");
  posthog.unregister("role");
  posthog.unregister("locale");
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

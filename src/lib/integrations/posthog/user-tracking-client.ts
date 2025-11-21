/**
 * PostHog User Identification and Tracking - Client Side Only
 * Helpers for identifying users and tracking auth events
 *
 * For server-side user tracking, use:
 * import { identifyUserServer, trackSignupServer } from '@/lib/integrations/posthog/server';
 */

import {
  clearMultiCountryContext,
  identifyUser as identifyUserClient,
  registerMultiCountryContext,
  resetUser,
  trackEvent,
} from "./utils";

export type UserProperties = {
  email?: string;
  name?: string;
  role?: "customer" | "professional" | "admin";
  locale?: string;
  signupDate?: string;
  plan?: string;
  totalBookings?: number;
  totalSpent?: number;
  verificationStatus?: string;
  /** User's country code (CO, PY, UY, AR) - for multi-country analytics */
  country?: "CO" | "PY" | "UY" | "AR";
  /** User's city ID - for granular location analytics */
  city?: string;
  /** User's currency (COP, PYG, UYU, ARS) - for transaction analytics */
  currency?: "COP" | "PYG" | "UYU" | "ARS";
};

/**
 * Client-side user identification
 * Call this after login/signup to identify the user
 * CRITICAL: Also registers multi-country context for analytics
 */
export function identifyAuthenticatedUser(userId: string, properties?: UserProperties) {
  identifyUserClient(userId, {
    ...properties,
    identified_at: new Date().toISOString(),
  });

  // Register multi-country context as super properties (attached to all events)
  if (properties?.country || properties?.role) {
    registerMultiCountryContext({
      country_code: properties.country,
      city_id: properties.city,
      currency: properties.currency,
      role: properties.role,
      locale: properties.locale?.split("-")[0] as "es" | "en" | undefined,
    });
  }
}

/**
 * Track user signup
 * Includes multi-country context for LATAM market analytics
 */
export function trackSignup(data: {
  userId: string;
  method: "email" | "google" | "facebook";
  role: "customer" | "professional";
  locale: string;
  /** User's country code for multi-country analytics */
  country?: "CO" | "PY" | "UY" | "AR";
  /** User's city ID */
  city?: string;
}) {
  identifyUserClient(data.userId, {
    role: data.role,
    locale: data.locale,
    signup_date: new Date().toISOString(),
    signup_method: data.method,
  });

  // Register multi-country context if country is provided
  if (data.country) {
    registerMultiCountryContext({
      country_code: data.country,
      city_id: data.city,
      role: data.role,
      locale: data.locale.split("-")[0] as "es" | "en" | undefined,
    });
  }

  trackEvent("User Signed Up", {
    signup_method: data.method,
    user_role: data.role,
    locale: data.locale,
    country_code: data.country,
    city_id: data.city,
  });
}

/**
 * Track user login
 */
export function trackLogin(data: { userId: string; method: "email" | "google" | "facebook" }) {
  trackEvent("User Logged In", {
    login_method: data.method,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track user logout
 * CRITICAL: Clears multi-country context to prevent data pollution
 */
export function trackLogout() {
  trackEvent("User Logged Out", {
    timestamp: new Date().toISOString(),
  });

  // Clear multi-country super properties before resetting identity
  clearMultiCountryContext();

  // Reset PostHog identity
  resetUser();
}

/**
 * Update user properties
 * Call this when user profile is updated
 */
export function updateUserProfile(properties: Partial<UserProperties>) {
  identifyUserClient(undefined as any, properties);
}

/**
 * Track email verification
 */
export function trackEmailVerified(userId: string) {
  identifyUserClient(userId, {
    email_verified: true,
    email_verified_at: new Date().toISOString(),
  });

  trackEvent("Email Verified", {
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track professional verification
 */
export function trackProfessionalVerified(userId: string, verificationType: string) {
  identifyUserClient(userId, {
    professional_verified: true,
    verification_type: verificationType,
    verified_at: new Date().toISOString(),
  });

  trackEvent("Professional Verified", {
    verification_type: verificationType,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track subscription/plan change
 */
export function trackPlanChange(data: {
  userId: string;
  oldPlan?: string;
  newPlan: string;
  billingCycle?: "monthly" | "annual";
}) {
  identifyUserClient(data.userId, {
    plan: data.newPlan,
    billing_cycle: data.billingCycle,
    plan_updated_at: new Date().toISOString(),
  });

  trackEvent("Plan Changed", {
    old_plan: data.oldPlan,
    new_plan: data.newPlan,
    billing_cycle: data.billingCycle,
  });
}

/**
 * PostHog User Identification and Tracking - Client Side Only
 * Helpers for identifying users and tracking auth events
 *
 * For server-side user tracking, use:
 * import { identifyUserServer, trackSignupServer } from '@/lib/integrations/posthog/server';
 */

import { identifyUser as identifyUserClient, resetUser, trackEvent } from "./utils";

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
};

/**
 * Client-side user identification
 * Call this after login/signup to identify the user
 */
export function identifyAuthenticatedUser(userId: string, properties?: UserProperties) {
  identifyUserClient(userId, {
    ...properties,
    identified_at: new Date().toISOString(),
  });
}

/**
 * Track user signup
 */
export function trackSignup(data: {
  userId: string;
  method: "email" | "google" | "facebook";
  role: "customer" | "professional";
  locale: string;
}) {
  identifyUserClient(data.userId, {
    role: data.role,
    locale: data.locale,
    signup_date: new Date().toISOString(),
    signup_method: data.method,
  });

  trackEvent("User Signed Up", {
    signup_method: data.method,
    user_role: data.role,
    locale: data.locale,
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
 */
export function trackLogout() {
  trackEvent("User Logged Out", {
    timestamp: new Date().toISOString(),
  });

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

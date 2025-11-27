/**
 * PostHog Server Configuration
 * Server-side analytics for API routes and server actions
 */

import { PostHog } from "posthog-node";
import type { FeatureFlagKey, FeatureFlagValue } from "@/lib/shared/config/feature-flags";
import { getFeatureFlagMetadata } from "@/lib/shared/config/feature-flags";

let posthogInstance: PostHog | null = null;

export function getPostHogClient(): PostHog | null {
  if (posthogInstance) {
    return posthogInstance;
  }

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

  if (!apiKey) {
    console.warn("PostHog: Missing NEXT_PUBLIC_POSTHOG_KEY");
    return null;
  }

  posthogInstance = new PostHog(apiKey, {
    host,
    flushAt: 1, // Flush immediately in serverless
    flushInterval: 0,
  });

  return posthogInstance;
}

/**
 * Track server-side event
 */
export async function trackServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, any>
) {
  const client = getPostHogClient();
  if (!client) {
    return;
  }

  client.capture({
    distinctId,
    event,
    properties,
  });

  await client.flush();
}

/**
 * Identify user on server
 */
export async function identifyUser(distinctId: string, properties?: Record<string, any>) {
  const client = getPostHogClient();
  if (!client) {
    return;
  }

  client.identify({
    distinctId,
    properties,
  });

  await client.flush();
}

/**
 * Track user signup event (server-side)
 */
export async function trackSignupServer(data: {
  userId: string;
  method: "email" | "google" | "facebook";
  role: "customer" | "professional" | "admin";
  locale: string;
}) {
  // Identify the user with their attributes
  await identifyUser(data.userId, {
    role: data.role,
    locale: data.locale,
    signup_date: new Date().toISOString(),
    signup_method: data.method,
  });

  // Track the signup event
  await trackServerEvent(data.userId, "User Signed Up", {
    signup_method: data.method,
    user_role: data.role,
    locale: data.locale,
  });
}

/**
 * Track user login event (server-side)
 */
export async function trackLoginServer(data: {
  userId: string;
  method: "email" | "google" | "facebook";
}) {
  await trackServerEvent(data.userId, "User Logged In", {
    login_method: data.method,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track user logout event (server-side)
 */
export async function trackLogoutServer(userId: string) {
  await trackServerEvent(userId, "User Logged Out", {
    timestamp: new Date().toISOString(),
  });
}

/**
 * Booking flow tracking (server-side)
 */
export async function trackBookingSubmittedServer(
  userId: string,
  data: {
    bookingId: string;
    professionalId: string;
    serviceType: string;
    totalAmount: number;
    currency: string;
    duration: number;
    addons?: string[];
  }
) {
  await trackServerEvent(userId, "Booking Submitted", {
    ...data,
    value: data.totalAmount,
  });
}

export async function trackBookingConfirmedServer(
  userId: string,
  data: {
    bookingId: string;
    professionalId: string;
    totalAmount: number;
    currency: string;
  }
) {
  await trackServerEvent(userId, "Booking Confirmed", {
    ...data,
    value: data.totalAmount,
  });
}

export async function trackBookingCancelledServer(
  userId: string,
  data: {
    bookingId: string;
    cancelledBy: "customer" | "professional";
    reason?: string;
    refundAmount?: number;
  }
) {
  await trackServerEvent(userId, "Booking Cancelled", data);
}

export async function trackBookingCompletedServer(
  userId: string,
  data: {
    bookingId: string;
    professionalId: string;
    totalAmount: number;
    currency: string;
    rating?: number;
  }
) {
  await trackServerEvent(userId, "Booking Completed", {
    ...data,
    value: data.totalAmount,
  });
}

async function trackBookingRescheduledServer(
  userId: string,
  data: {
    bookingId: string;
    oldDate: string;
    newDate: string;
    reason?: string;
  }
) {
  await trackServerEvent(userId, "Booking Rescheduled", data);
}

async function trackBookingExtendedServer(
  userId: string,
  data: {
    bookingId: string;
    additionalHours: number;
    additionalAmount: number;
  }
) {
  await trackServerEvent(userId, "Booking Time Extended", data);
}

async function trackBookingDeclinedServer(
  userId: string,
  data: {
    bookingId: string;
    professionalId: string;
    reason?: string;
  }
) {
  await trackServerEvent(userId, "Booking Declined", data);
}

async function trackBookingDisputeCreatedServer(
  userId: string,
  data: {
    bookingId: string;
    disputeType: string;
    amount: number;
  }
) {
  await trackServerEvent(userId, "Booking Dispute Created", data);
}

/**
 * Server-Side Feature Flags (Epic G-1)
 */

/**
 * Get feature flag for a specific user (server-side)
 *
 * @param flagKey - The feature flag key to check
 * @param distinctId - User ID or anonymous ID
 * @param defaultValue - Default value if flag is not set
 * @returns The feature flag value
 *
 * @example
 * const variant = await getFeatureFlagServer('hero_variant', userId);
 */
async function getFeatureFlagServer(
  flagKey: FeatureFlagKey,
  distinctId: string,
  defaultValue?: FeatureFlagValue
): Promise<FeatureFlagValue> {
  const client = getPostHogClient();
  if (!client) {
    return defaultValue ?? getFeatureFlagMetadata(flagKey)?.defaultValue;
  }

  try {
    const value = await client.getFeatureFlag(flagKey, distinctId);
    return value ?? defaultValue ?? getFeatureFlagMetadata(flagKey)?.defaultValue;
  } catch (error) {
    console.error(`PostHog: Error getting feature flag ${flagKey}:`, error);
    return defaultValue ?? getFeatureFlagMetadata(flagKey)?.defaultValue;
  }
}

/**
 * Check if feature flag is enabled for a user (server-side)
 *
 * @param flagKey - The feature flag key to check
 * @param distinctId - User ID or anonymous ID
 * @param defaultValue - Default value if flag is not set
 * @returns true if enabled, false otherwise
 *
 * @example
 * const enabled = await isFeatureFlagEnabledServer('match_wizard_enabled', userId);
 */
async function isFeatureFlagEnabledServer(
  flagKey: FeatureFlagKey,
  distinctId: string,
  defaultValue = false
): Promise<boolean> {
  const client = getPostHogClient();
  if (!client) {
    return defaultValue;
  }

  try {
    const value = await client.isFeatureEnabled(flagKey, distinctId);
    return value ?? defaultValue;
  } catch (error) {
    console.error(`PostHog: Error checking feature flag ${flagKey}:`, error);
    return defaultValue;
  }
}

/**
 * Get all feature flags for a user (server-side)
 *
 * @param distinctId - User ID or anonymous ID
 * @returns Object with all feature flags and their values
 *
 * @example
 * const flags = await getAllFeatureFlagsServer(userId);
 */
async function getAllFeatureFlagsServer(
  distinctId: string
): Promise<Record<string, FeatureFlagValue>> {
  const client = getPostHogClient();
  if (!client) {
    return {};
  }

  try {
    const flags = await client.getAllFlags(distinctId);
    return flags || {};
  } catch (error) {
    console.error("PostHog: Error getting all feature flags:", error);
    return {};
  }
}

/**
 * Get feature flag payload for a user (server-side)
 * Useful for multivariate flags with additional data
 *
 * @param flagKey - The feature flag key
 * @param distinctId - User ID or anonymous ID
 * @returns Feature flag payload (string, number, boolean, object, or undefined)
 *
 * @example
 * const payload = await getFeatureFlagPayloadServer('hero_variant', userId);
 */
async function getFeatureFlagPayloadServer(
  flagKey: FeatureFlagKey,
  distinctId: string
): Promise<string | number | boolean | Record<string, any> | undefined> {
  const client = getPostHogClient();
  if (!client) {
    return;
  }

  try {
    const payload = await client.getFeatureFlagPayload(flagKey, distinctId);
    return payload ?? undefined;
  } catch (error) {
    console.error(`PostHog: Error getting feature flag payload ${flagKey}:`, error);
    return;
  }
}

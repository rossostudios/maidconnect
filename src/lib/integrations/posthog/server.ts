/**
 * PostHog Server Configuration
 * Server-side analytics for API routes and server actions
 */

import { PostHog } from "posthog-node";

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
  if (!client) return;

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
  if (!client) return;

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

export async function trackBookingRescheduledServer(
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

export async function trackBookingExtendedServer(
  userId: string,
  data: {
    bookingId: string;
    additionalHours: number;
    additionalAmount: number;
  }
) {
  await trackServerEvent(userId, "Booking Time Extended", data);
}

export async function trackBookingDeclinedServer(
  userId: string,
  data: {
    bookingId: string;
    professionalId: string;
    reason?: string;
  }
) {
  await trackServerEvent(userId, "Booking Declined", data);
}

export async function trackBookingDisputeCreatedServer(
  userId: string,
  data: {
    bookingId: string;
    disputeType: string;
    amount: number;
  }
) {
  await trackServerEvent(userId, "Booking Dispute Created", data);
}

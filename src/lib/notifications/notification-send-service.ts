/**
 * Notification Send Service - Business logic for sending push notifications
 *
 * Extracts VAPID setup, payload building, and sending logic to reduce route complexity
 * Handles: Request validation, VAPID configuration, subscription sending, history saving
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type NotificationRequest = {
  userId: string;
  title: string;
  body: string;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
};

export type NotificationSubscription = {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

export type SendResult = {
  success: boolean;
  endpoint: string;
  error?: string;
};

export type ValidationResult = {
  valid: boolean;
  error?: string;
};

/**
 * Validate notification request has required fields
 */
export function validateNotificationRequest(data: any): ValidationResult {
  if (!(data.userId && data.title && data.body)) {
    return {
      valid: false,
      error: "Missing required fields: userId, title, body",
    };
  }
  return { valid: true };
}

/**
 * Configure VAPID keys for web-push
 * Returns null if keys not configured
 */
export function configureVAPIDKeys(): {
  publicKey: string;
  privateKey: string;
  subject: string;
} | null {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || "mailto:support@casaora.co";

  if (!(vapidPublicKey && vapidPrivateKey)) {
    return null;
  }

  return {
    publicKey: vapidPublicKey,
    privateKey: vapidPrivateKey,
    subject: vapidSubject,
  };
}

/**
 * Build notification payload for web-push
 */
export function buildNotificationPayload(request: NotificationRequest): string {
  return JSON.stringify({
    title: request.title,
    body: request.body,
    icon: "/icon-192x192.png",
    badge: "/badge-72x72.png",
    url: request.url || "/dashboard/customer",
    tag: request.tag || "default",
    requireInteraction: request.requireInteraction,
  });
}

/**
 * Build push subscription object from database subscription
 */
export function buildPushSubscription(subscription: NotificationSubscription) {
  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.p256dh,
      auth: subscription.auth,
    },
  };
}

/**
 * Send notification to a single subscription
 * Handles 410 (Gone) errors by deleting expired subscriptions
 */
export async function sendToSubscription(
  webPush: any,
  subscription: NotificationSubscription,
  payload: string,
  supabase: SupabaseClient
): Promise<SendResult> {
  try {
    const pushSubscription = buildPushSubscription(subscription);
    await webPush.sendNotification(pushSubscription, payload);

    return {
      success: true,
      endpoint: subscription.endpoint,
    };
  } catch (error: any) {
    // If subscription is invalid (410 Gone), delete it
    if (error.statusCode === 410) {
      await supabase.from("notification_subscriptions").delete().eq("id", subscription.id);
    }

    return {
      success: false,
      endpoint: subscription.endpoint,
      error: error.message,
    };
  }
}

/**
 * Send notification to all user subscriptions
 * Returns array of results for each subscription
 */
export async function sendToAllSubscriptions(
  webPush: any,
  subscriptions: NotificationSubscription[],
  payload: string,
  supabase: SupabaseClient
): Promise<SendResult[]> {
  const sendPromises = subscriptions.map((subscription) =>
    sendToSubscription(webPush, subscription, payload, supabase)
  );

  return await Promise.all(sendPromises);
}

/**
 * Save notification to database history
 * Intentionally suppresses errors - notification already sent
 */
export async function saveNotificationHistory(
  supabase: SupabaseClient,
  request: NotificationRequest
): Promise<void> {
  try {
    await supabase.from("notifications").insert({
      user_id: request.userId,
      title: request.title,
      body: request.body,
      url: request.url || null,
      tag: request.tag || null,
    });
  } catch (historyError) {
    // Intentionally suppress - push notification was already sent
    console.warn("Failed to save notification to history:", historyError);
  }
}

/**
 * Count successful sends from results
 */
export function countSuccessfulSends(results: SendResult[]): number {
  return results.filter((r) => r.success).length;
}

/**
 * Helper function to send push notifications (can be called from other services)
 */
async function sendPushNotification(
  userId: string,
  notification: {
    title: string;
    body: string;
    url?: string;
    tag?: string;
    requireInteraction?: boolean;
  }
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const response = await fetch(`${appUrl}/api/notifications/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      ...notification,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send push notification");
  }

  return await response.json();
}

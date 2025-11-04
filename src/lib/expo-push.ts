/**
 * Expo Push Notification Service
 * Handles sending push notifications to mobile devices using Expo Push Notification API
 */

import { createClient } from "@supabase/supabase-js";
import { Expo, ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";

// Create Expo client
const expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN,
  useFcmV1: true, // Use FCM v1 API
});

/**
 * Get mobile push tokens for a user from the database
 */
async function getMobilePushTokens(userId: string): Promise<string[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const { data, error } = await supabase
    .from("mobile_push_tokens")
    .select("expo_push_token")
    .eq("user_id", userId);

  if (error) {
    console.error("[expo-push] Failed to fetch mobile push tokens:", error);
    return [];
  }

  // Filter out invalid tokens and return
  const tokens = data
    .map((row) => row.expo_push_token)
    .filter((token) => Expo.isExpoPushToken(token));

  return tokens;
}

/**
 * Remove invalid push tokens from the database
 */
async function removeInvalidToken(token: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  await supabase.from("mobile_push_tokens").delete().eq("expo_push_token", token);
}

export type ExpoPushNotificationPayload = {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: "default" | null;
  badge?: number;
  channelId?: string;
  categoryId?: string;
  priority?: "default" | "normal" | "high";
  ttl?: number;
};

/**
 * Send Expo push notifications to a user's mobile devices
 */
export async function sendExpoNotification(
  userId: string,
  notification: ExpoPushNotificationPayload
): Promise<{ success: boolean; sent: number; errors: string[] }> {
  try {
    // Get user's mobile push tokens
    const pushTokens = await getMobilePushTokens(userId);

    if (pushTokens.length === 0) {
      return { success: true, sent: 0, errors: [] };
    }

    // Prepare messages
    const messages: ExpoPushMessage[] = pushTokens.map((token) => ({
      to: token,
      sound: notification.sound ?? "default",
      title: notification.title,
      body: notification.body,
      data: notification.data ?? {},
      badge: notification.badge,
      channelId: notification.channelId,
      categoryId: notification.categoryId,
      priority: notification.priority ?? "high",
      ttl: notification.ttl,
    }));

    // Send notifications in chunks (Expo recommends chunks of 100)
    const chunks = expo.chunkPushNotifications(messages);
    const tickets: ExpoPushTicket[] = [];
    const errors: string[] = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error("[expo-push] Failed to send notification chunk:", error);
        errors.push(error instanceof Error ? error.message : "Unknown error");
      }
    }

    // Process tickets and remove invalid tokens
    let successCount = 0;
    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      const token = pushTokens[i];
      if (!ticket || !token) continue;

      if (ticket.status === "ok") {
        successCount++;
      } else if (ticket.status === "error") {
        console.error(`[expo-push] Error sending to ${token}:`, ticket.message);
        errors.push(ticket.message);

        // Remove invalid tokens
        if (
          ticket.details?.error === "DeviceNotRegistered" ||
          ticket.details?.error === "InvalidCredentials"
        ) {
          await removeInvalidToken(token);
        }
      }
    }

    return {
      success: true,
      sent: successCount,
      errors,
    };
  } catch (error) {
    console.error("[expo-push] Failed to send Expo notification:", error);
    return {
      success: false,
      sent: 0,
      errors: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}

/**
 * Send Expo push notifications to multiple users
 */
export async function sendExpoNotificationToMultipleUsers(
  userIds: string[],
  notification: ExpoPushNotificationPayload
): Promise<{ success: boolean; totalSent: number; errors: string[] }> {
  const results = await Promise.all(
    userIds.map((userId) => sendExpoNotification(userId, notification))
  );

  const totalSent = results.reduce((sum, result) => sum + result.sent, 0);
  const allErrors = results.flatMap((result) => result.errors);

  return {
    success: true,
    totalSent,
    errors: allErrors,
  };
}

/**
 * Send Push Notifications API
 * POST /api/notifications/send - Send push notification to user's devices
 *
 * REFACTORED: Complexity 18 → <15
 * - Extracted VAPID setup and sending logic to notification-send-service.ts
 * - Route now focuses on orchestration
 *
 * Note: Uses Node.js runtime because web-push doesn't work in edge runtime
 */

import { NextRequest, NextResponse } from "next/server";
import type {
  NotificationRequest,
  NotificationSubscription,
} from "@/lib/notifications/notification-send-service";
import {
  buildNotificationPayload,
  configureVAPIDKeys,
  countSuccessfulSends,
  saveNotificationHistory,
  sendToAllSubscriptions,
  validateNotificationRequest,
} from "@/lib/notifications/notification-send-service";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body using service
    const body = await request.json();
    const validation = validateNotificationRequest(body);

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const notificationRequest: NotificationRequest = body;

    // Get user's notification subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from("notification_subscriptions")
      .select("*")
      .eq("user_id", notificationRequest.userId);

    if (subError) {
      return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { success: true, sent: 0, message: "No subscriptions found" },
        { status: 200 }
      );
    }

    // Import web-push dynamically (only works in Node.js runtime)
    const webPush = (await import("web-push")).default;

    // Configure VAPID keys using service
    const vapidConfig = configureVAPIDKeys();
    if (!vapidConfig) {
      return NextResponse.json({ error: "Push notifications not configured" }, { status: 500 });
    }

    webPush.setVapidDetails(vapidConfig.subject, vapidConfig.publicKey, vapidConfig.privateKey);

    // Build payload and send to all subscriptions using service
    const payload = buildNotificationPayload(notificationRequest);
    const results = await sendToAllSubscriptions(
      webPush,
      subscriptions as NotificationSubscription[],
      payload,
      supabase
    );

    const successCount = countSuccessfulSends(results);

    // Save to history using service
    await saveNotificationHistory(supabase, notificationRequest);

    return NextResponse.json({
      success: true,
      sent: successCount,
      total: subscriptions.length,
      results,
    });
  } catch (_error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

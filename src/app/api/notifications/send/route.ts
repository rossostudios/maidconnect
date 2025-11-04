import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

// Note: This endpoint uses Node.js runtime because web-push doesn't work in edge runtime

// Send push notification to user(s)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // Check authentication (should be server-side or admin)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const { userId, title, body, url, tag, requireInteraction } = await request.json();

    if (!(userId && title && body)) {
      return NextResponse.json(
        { error: "Missing required fields: userId, title, body" },
        { status: 400 }
      );
    }

    // Get user's notification subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from("notification_subscriptions")
      .select("*")
      .eq("user_id", userId);

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

    // Configure web-push with VAPID keys
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT || "mailto:support@casaora.com";

    if (!(vapidPublicKey && vapidPrivateKey)) {
      return NextResponse.json({ error: "Push notifications not configured" }, { status: 500 });
    }

    webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    // Prepare notification payload
    const payload = JSON.stringify({
      title,
      body,
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
      url: url || "/dashboard/customer",
      tag: tag || "default",
      requireInteraction,
    });

    // Send to all user's subscriptions
    const sendPromises = subscriptions.map(async (sub) => {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        await webPush.sendNotification(pushSubscription, payload);
        return { success: true, endpoint: sub.endpoint };
      } catch (error: any) {
        // If subscription is invalid (410 Gone), delete it
        if (error.statusCode === 410) {
          await supabase.from("notification_subscriptions").delete().eq("id", sub.id);
        }

        return { success: false, endpoint: sub.endpoint, error: error.message };
      }
    });

    const results = await Promise.all(sendPromises);
    const successCount = results.filter((r) => r.success).length;

    // Save notification to history (use service role to bypass RLS)
    try {
      await supabase.from("notifications").insert({
        user_id: userId,
        title,
        body,
        url: url || null,
        tag: tag || null,
      });
    } catch (historyError) {
      // Intentionally suppress notification history errors - push notification was already sent
      console.warn("Failed to save notification to history:", historyError);
    }

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

// Helper function to send notifications (can be called from other API routes)
export async function sendPushNotification(
  userId: string,
  notification: {
    title: string;
    body: string;
    url?: string;
    tag?: string;
    requireInteraction?: boolean;
  }
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/notifications/send`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        ...notification,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to send push notification");
  }

  return await response.json();
}

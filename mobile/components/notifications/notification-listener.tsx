/**
 * Notification Listener
 * Handles incoming push notifications and navigates user to appropriate screens
 */

import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { useNotifications } from "@/providers/NotificationsProvider";

export function NotificationListener() {
  const { expoPushToken: _expoPushToken } = useNotifications();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Listener for notifications received while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log("[notifications] Received while in foreground:", notification);

      // You can show a custom in-app notification UI here if desired
    });

    // Listener for when user taps on a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("[notifications] User tapped notification:", response);

      const data = response.notification.request.content.data;

      // Handle navigation based on notification data
      handleNotificationNavigation(data);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // Handle last notification that opened the app (when app was closed)
  useEffect(() => {
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        console.log("[notifications] App opened from notification:", response);
        const data = response.notification.request.content.data;
        handleNotificationNavigation(data);
      }
    });
  }, []);

  return null; // This component doesn't render anything
}

/**
 * Navigate user to appropriate screen based on notification data
 */
function handleNotificationNavigation(data: Record<string, any>) {
  const { url, tag } = data;

  // Parse tag to determine notification type
  if (typeof tag === "string") {
    if (tag.startsWith("booking-")) {
      const bookingId = tag.replace("booking-", "");
      router.push(`/booking/${bookingId}` as any);
    } else if (tag.startsWith("message-")) {
      router.push("/messages");
    } else if (tag.startsWith("review-")) {
      router.push("/bookings");
    } else if (tag.startsWith("arriving-soon-")) {
      const bookingId = tag.replace("arriving-soon-", "");
      router.push(`/booking/${bookingId}` as any);
    }
  }

  // Fallback: use URL if provided
  if (typeof url === "string" && url.includes("dashboard/customer")) {
    // Parse web dashboard URLs to mobile routes
    if (url.includes("#bookings")) {
      router.push("/bookings");
    } else if (url.includes("#messages")) {
      router.push("/messages");
    } else {
      router.push("/");
    }
  }
}

"use client";

import { useState, useEffect, useCallback } from "react";

export type NotificationPermission = "default" | "granted" | "denied";

type PushSubscription = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if push notifications are supported
  useEffect(() => {
    const supported =
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;
    setIsSupported(supported);

    if (supported && typeof Notification !== "undefined") {
      setPermission(Notification.permission as NotificationPermission);
    }
  }, []);

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if (!isSupported) {
      throw new Error("Push notifications not supported");
    }

    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      console.log("[Push] Service Worker registered:", registration);
      return registration;
    } catch (err) {
      console.error("[Push] Service Worker registration failed:", err);
      throw err;
    }
  }, [isSupported]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      setError("Push notifications are not supported in this browser");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await Notification.requestPermission();
      setPermission(result as NotificationPermission);

      if (result === "granted") {
        await subscribe();
        return true;
      } else if (result === "denied") {
        setError("Notification permission denied");
        return false;
      }
      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to request permission";
      setError(message);
      console.error("[Push] Permission request failed:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!isSupported || permission !== "granted") {
      console.log("[Push] Cannot subscribe: not supported or no permission");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Register service worker first
      const registration = await registerServiceWorker();

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      // Get VAPID public key from environment
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new Error("VAPID public key not configured");
      }

      // Subscribe to push notifications
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Convert subscription to JSON
      const subscriptionJSON = pushSubscription.toJSON();

      if (!subscriptionJSON.endpoint || !subscriptionJSON.keys) {
        throw new Error("Invalid subscription");
      }

      const sub: PushSubscription = {
        endpoint: subscriptionJSON.endpoint,
        keys: {
          p256dh: subscriptionJSON.keys.p256dh || "",
          auth: subscriptionJSON.keys.auth || "",
        },
      };

      setSubscription(sub);

      // Save subscription to database
      await saveSubscription(sub);

      return sub;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to subscribe";
      setError(message);
      console.error("[Push] Subscription failed:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, permission, registerServiceWorker]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!isSupported) return false;

    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const pushSubscription = await registration.pushManager.getSubscription();

      if (pushSubscription) {
        await pushSubscription.unsubscribe();
        await deleteSubscription();
        setSubscription(null);
        return true;
      }
      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to unsubscribe";
      setError(message);
      console.error("[Push] Unsubscribe failed:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  // Load existing subscription on mount
  useEffect(() => {
    if (!isSupported || permission !== "granted") return;

    const loadSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const pushSubscription = await registration.pushManager.getSubscription();

        if (pushSubscription) {
          const subscriptionJSON = pushSubscription.toJSON();
          if (subscriptionJSON.endpoint && subscriptionJSON.keys) {
            setSubscription({
              endpoint: subscriptionJSON.endpoint,
              keys: {
                p256dh: subscriptionJSON.keys.p256dh || "",
                auth: subscriptionJSON.keys.auth || "",
              },
            });
          }
        }
      } catch (err) {
        console.error("[Push] Failed to load subscription:", err);
      }
    };

    loadSubscription();
  }, [isSupported, permission]);

  return {
    isSupported,
    permission,
    subscription,
    isLoading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length) as Uint8Array<ArrayBuffer>;

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Save subscription to database
async function saveSubscription(subscription: PushSubscription) {
  try {
    const response = await fetch("/api/notifications/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: navigator.userAgent,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save subscription");
    }

    console.log("[Push] Subscription saved to database");
  } catch (err) {
    console.error("[Push] Failed to save subscription:", err);
    throw err;
  }
}

// Delete subscription from database
async function deleteSubscription() {
  try {
    const response = await fetch("/api/notifications/subscribe", {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete subscription");
    }

    console.log("[Push] Subscription deleted from database");
  } catch (err) {
    console.error("[Push] Failed to delete subscription:", err);
  }
}

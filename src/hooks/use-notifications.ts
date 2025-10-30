import { useState, useEffect } from "react";

export type NotificationPermission = "default" | "granted" | "denied";

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if (typeof window !== "undefined" && "Notification" in window) {
      setSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!supported) {
      return "denied";
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error("Failed to request notification permission:", error);
      return "denied";
    }
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (!supported || permission !== "granted") {
      return null;
    }

    try {
      return new Notification(title, {
        icon: "/icon-192x192.png", // You'll need to add this icon
        badge: "/badge-72x72.png", // You'll need to add this badge
        ...options,
      });
    } catch (error) {
      console.error("Failed to show notification:", error);
      return null;
    }
  };

  return {
    permission,
    supported,
    requestPermission,
    showNotification,
  };
}

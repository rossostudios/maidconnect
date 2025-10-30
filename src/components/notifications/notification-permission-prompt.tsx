"use client";

import { Bell, BellOff, X } from "lucide-react";
import { useState } from "react";
import { usePushNotifications } from "@/hooks/use-push-notifications";

type NotificationPermissionPromptProps = {
  onDismiss?: () => void;
  variant?: "banner" | "card";
};

export function NotificationPermissionPrompt({
  onDismiss,
  variant = "banner",
}: NotificationPermissionPromptProps) {
  const { isSupported, permission, isLoading, error, requestPermission } = usePushNotifications();
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if dismissed, not supported, or already granted
  if (isDismissed || !isSupported || permission === "granted") {
    return null;
  }

  // Don't show if explicitly denied (user can enable in browser settings)
  if (permission === "denied") {
    return null;
  }

  const handleEnable = async () => {
    const granted = await requestPermission();
    if (granted) {
      setIsDismissed(true);
      onDismiss?.();
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (variant === "banner") {
    return (
      <div className="border-[#ebe5d8] border-b bg-[#ff5d46]/5 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#ff5d46]">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[#211f1a]">Stay updated with notifications</p>
              <p className="text-[#5d574b] text-sm">
                Get notified about bookings, messages, and important updates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="whitespace-nowrap rounded-full bg-[#ff5d46] px-6 py-2.5 font-semibold text-sm text-white shadow-[0_6px_18px_rgba(255,93,70,0.22)] transition hover:bg-[#eb6c65] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isLoading}
              onClick={handleEnable}
            >
              {isLoading ? "Enabling..." : "Enable Notifications"}
            </button>

            <button
              aria-label="Dismiss"
              className="rounded-full p-2 text-[#5d574b] transition hover:bg-white hover:text-[#211f1a]"
              onClick={handleDismiss}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-auto mt-3 max-w-5xl">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>
    );
  }

  // Card variant
  return (
    <div className="rounded-[28px] border border-[#ebe5d8] bg-white p-8 shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#ff5d46]/10">
            <Bell className="h-6 w-6 text-[#ff5d46]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#211f1a] text-xl">Enable push notifications</h3>
            <p className="mt-2 text-[#5d574b] text-base leading-relaxed">
              Stay informed about your bookings, new messages, and important updates even when
              you're not using the app.
            </p>

            <div className="mt-4 space-y-2 text-[#5d574b] text-sm">
              <div className="flex items-center gap-2">
                <span className="text-[#ff5d46]">•</span>
                <span>Booking confirmations and updates</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#ff5d46]">•</span>
                <span>New messages from professionals/customers</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#ff5d46]">•</span>
                <span>Service reminders and completion alerts</span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                className="inline-flex items-center justify-center rounded-full bg-[#ff5d46] px-6 py-3 font-semibold text-base text-white shadow-[0_6px_18px_rgba(255,93,70,0.22)] transition hover:bg-[#eb6c65] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isLoading}
                onClick={handleEnable}
              >
                {isLoading ? "Enabling..." : "Enable Notifications"}
              </button>

              <button
                className="inline-flex items-center justify-center rounded-full border-2 border-[#ebe5d8] bg-white px-6 py-3 font-semibold text-[#211f1a] text-base transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
                onClick={handleDismiss}
              >
                Maybe Later
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-xl bg-red-50 p-3 text-red-600 text-sm">{error}</div>
            )}
          </div>
        </div>

        <button
          aria-label="Dismiss"
          className="rounded-full p-2 text-[#5d574b] transition hover:bg-[#ebe5d8] hover:text-[#211f1a]"
          onClick={handleDismiss}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

// Component to show when notifications are disabled in browser settings
export function NotificationsDeniedMessage() {
  return (
    <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100">
          <BellOff className="h-5 w-5 text-yellow-700" />
        </div>
        <div>
          <h4 className="font-semibold text-yellow-900">Notifications are blocked</h4>
          <p className="mt-2 text-sm text-yellow-800 leading-relaxed">
            You've blocked notifications for this site. To enable them, click the lock icon in your
            browser's address bar and allow notifications.
          </p>
        </div>
      </div>
    </div>
  );
}

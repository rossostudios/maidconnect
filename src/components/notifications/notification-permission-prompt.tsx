"use client";

import {
  Cancel01Icon,
  Notification02Icon,
  NotificationOff02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
      <div className="border-[#e2e8f0] border-b bg-[#64748b]/5 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#64748b]">
              <HugeiconsIcon className="h-5 w-5 text-[#f8fafc]" icon={Notification02Icon} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[#0f172a]">Stay updated with notifications</p>
              <p className="text-[#94a3b8] text-sm">
                Get notified about bookings, messages, and important updates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="whitespace-nowrap rounded-full bg-[#64748b] px-6 py-2.5 font-semibold text-[#f8fafc] text-sm shadow-[0_6px_18px_rgba(244,74,34,0.22)] transition hover:bg-[#64748b] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isLoading}
              onClick={handleEnable}
              type="button"
            >
              {isLoading ? "Enabling..." : "Enable Notifications"}
            </button>

            <button
              aria-label="Dismiss"
              className="rounded-full p-2 text-[#94a3b8] transition hover:bg-[#f8fafc] hover:text-[#0f172a]"
              onClick={handleDismiss}
              type="button"
            >
              <HugeiconsIcon className="h-5 w-5" icon={Cancel01Icon} />
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-auto mt-3 max-w-5xl">
            <p className="text-[#64748b] text-sm">{error}</p>
          </div>
        )}
      </div>
    );
  }

  // Card variant
  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-8 shadow-[0_10px_40px_rgba(22,22,22,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#64748b]/10">
            <HugeiconsIcon className="h-6 w-6 text-[#64748b]" icon={Notification02Icon} />
          </div>
          <div>
            <h3 className="font-semibold text-[#0f172a] text-xl">Enable push notifications</h3>
            <p className="mt-2 text-[#94a3b8] text-base leading-relaxed">
              Stay informed about your bookings, new messages, and important updates even when
              you're not using the app.
            </p>

            <div className="mt-4 space-y-2 text-[#94a3b8] text-sm">
              <div className="flex items-center gap-2">
                <span className="text-[#64748b]">•</span>
                <span>Booking confirmations and updates</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#64748b]">•</span>
                <span>New messages from professionals/customers</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#64748b]">•</span>
                <span>Service reminders and completion alerts</span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                className="inline-flex items-center justify-center rounded-full bg-[#64748b] px-6 py-3 font-semibold text-[#f8fafc] text-base shadow-[0_6px_18px_rgba(244,74,34,0.22)] transition hover:bg-[#64748b] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isLoading}
                onClick={handleEnable}
                type="button"
              >
                {isLoading ? "Enabling..." : "Enable Notifications"}
              </button>

              <button
                className="inline-flex items-center justify-center rounded-full border-2 border-[#e2e8f0] bg-[#f8fafc] px-6 py-3 font-semibold text-[#0f172a] text-base transition hover:border-[#64748b] hover:text-[#64748b]"
                onClick={handleDismiss}
                type="button"
              >
                Maybe Later
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-xl bg-[#64748b]/10 p-3 text-[#64748b] text-sm">
                {error}
              </div>
            )}
          </div>
        </div>

        <button
          aria-label="Dismiss"
          className="rounded-full p-2 text-[#94a3b8] transition hover:bg-[#f8fafc] hover:text-[#0f172a]"
          onClick={handleDismiss}
          type="button"
        >
          <HugeiconsIcon className="h-5 w-5" icon={Cancel01Icon} />
        </button>
      </div>
    </div>
  );
}

// Component to show when notifications are disabled in browser settings
export function NotificationsDeniedMessage() {
  return (
    <div className="rounded-xl border border-[#64748b]/30 bg-[#64748b]/5 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#64748b]/10">
          <HugeiconsIcon className="h-5 w-5 text-[#64748b]" icon={NotificationOff02Icon} />
        </div>
        <div>
          <h4 className="font-semibold text-[#64748b]">Notifications are blocked</h4>
          <p className="mt-2 text-[#64748b] text-sm leading-relaxed">
            You've blocked notifications for this site. To enable them, click the lock icon in your
            browser's address bar and allow notifications.
          </p>
        </div>
      </div>
    </div>
  );
}

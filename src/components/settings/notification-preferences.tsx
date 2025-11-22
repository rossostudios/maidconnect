"use client";

import { Mail01Icon, Notification02Icon, SmartPhone01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState, useTransition } from "react";
import { geistSans } from "@/app/fonts";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { cn } from "@/lib/utils";

type NotificationPreferences = {
  email_booking_updates: boolean;
  email_messages: boolean;
  email_promotions: boolean;
  push_booking_updates: boolean;
  push_messages: boolean;
  push_reminders: boolean;
  sms_booking_updates: boolean;
  sms_reminders: boolean;
};

type Props = {
  initialPreferences: NotificationPreferences | null;
  onSave: (preferences: NotificationPreferences) => Promise<{ success: boolean; error?: string }>;
};

const defaultPreferences: NotificationPreferences = {
  email_booking_updates: true,
  email_messages: true,
  email_promotions: false,
  push_booking_updates: true,
  push_messages: true,
  push_reminders: true,
  sms_booking_updates: false,
  sms_reminders: false,
};

function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  id,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id: string;
}) {
  return (
    <button
      aria-checked={checked}
      className={cn(
        "relative h-6 w-11 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
        checked ? "bg-orange-500" : "bg-neutral-300",
        disabled && "cursor-not-allowed opacity-50"
      )}
      disabled={disabled}
      id={id}
      onClick={() => onChange(!checked)}
      role="switch"
      type="button"
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

function PreferenceRow({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="flex-1">
        <label className="font-medium text-neutral-900 text-sm" htmlFor={id}>
          {label}
        </label>
        <p className="mt-0.5 text-neutral-600 text-sm">{description}</p>
      </div>
      <ToggleSwitch checked={checked} disabled={disabled} id={id} onChange={onChange} />
    </div>
  );
}

export function NotificationPreferences({ initialPreferences, onSave }: Props) {
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    initialPreferences ?? defaultPreferences
  );
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const {
    isSupported: isPushSupported,
    permission: pushPermission,
    requestPermission,
  } = usePushNotifications();

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setMessage(null);
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await onSave(preferences);
      if (result.success) {
        setMessage({ type: "success", text: "Preferences saved successfully" });
      } else {
        setMessage({ type: "error", text: result.error ?? "Failed to save preferences" });
      }
    });
  };

  const handleEnablePush = async () => {
    const granted = await requestPermission();
    if (granted) {
      setPreferences((prev) => ({
        ...prev,
        push_booking_updates: true,
        push_messages: true,
        push_reminders: true,
      }));
    }
  };

  const pushEnabled = isPushSupported && pushPermission === "granted";
  const pushDenied = isPushSupported && pushPermission === "denied";

  return (
    <div className="space-y-8">
      {/* Email Notifications */}
      <div>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50">
            <HugeiconsIcon className="h-5 w-5 text-neutral-600" icon={Mail01Icon} />
          </div>
          <div>
            <h3 className={cn("font-semibold text-neutral-900", geistSans.className)}>
              Email Notifications
            </h3>
            <p className="text-neutral-600 text-sm">Manage your email preferences</p>
          </div>
        </div>
        <div className="divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white px-4">
          <PreferenceRow
            checked={preferences.email_booking_updates}
            description="Get notified about booking confirmations, changes, and completions"
            disabled={isPending}
            id="email_booking_updates"
            label="Booking Updates"
            onChange={(v) => updatePreference("email_booking_updates", v)}
          />
          <PreferenceRow
            checked={preferences.email_messages}
            description="Receive emails when you get new messages from professionals"
            disabled={isPending}
            id="email_messages"
            label="Messages"
            onChange={(v) => updatePreference("email_messages", v)}
          />
          <PreferenceRow
            checked={preferences.email_promotions}
            description="Receive promotional offers, tips, and platform updates"
            disabled={isPending}
            id="email_promotions"
            label="Promotions & Updates"
            onChange={(v) => updatePreference("email_promotions", v)}
          />
        </div>
      </div>

      {/* Push Notifications */}
      <div>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50">
            <HugeiconsIcon className="h-5 w-5 text-neutral-600" icon={Notification02Icon} />
          </div>
          <div>
            <h3 className={cn("font-semibold text-neutral-900", geistSans.className)}>
              Push Notifications
            </h3>
            <p className="text-neutral-600 text-sm">Real-time alerts in your browser</p>
          </div>
        </div>

        {!isPushSupported && (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-neutral-600 text-sm">
            Push notifications are not supported in this browser.
          </div>
        )}

        {pushDenied && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
            Push notifications are blocked. Enable them in your browser settings to receive alerts.
          </div>
        )}

        {isPushSupported && !pushEnabled && !pushDenied && (
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
            <p className="mb-3 text-neutral-700 text-sm">
              Enable push notifications to receive real-time updates about your bookings.
            </p>
            <button
              className="rounded-lg bg-orange-500 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-orange-600"
              onClick={handleEnablePush}
              type="button"
            >
              Enable Push Notifications
            </button>
          </div>
        )}

        {pushEnabled && (
          <div className="divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white px-4">
            <PreferenceRow
              checked={preferences.push_booking_updates}
              description="Instant alerts for booking confirmations and status changes"
              disabled={isPending}
              id="push_booking_updates"
              label="Booking Updates"
              onChange={(v) => updatePreference("push_booking_updates", v)}
            />
            <PreferenceRow
              checked={preferences.push_messages}
              description="Get notified immediately when you receive a message"
              disabled={isPending}
              id="push_messages"
              label="Messages"
              onChange={(v) => updatePreference("push_messages", v)}
            />
            <PreferenceRow
              checked={preferences.push_reminders}
              description="Reminders before upcoming appointments"
              disabled={isPending}
              id="push_reminders"
              label="Reminders"
              onChange={(v) => updatePreference("push_reminders", v)}
            />
          </div>
        )}
      </div>

      {/* SMS Notifications */}
      <div>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50">
            <HugeiconsIcon className="h-5 w-5 text-neutral-600" icon={SmartPhone01Icon} />
          </div>
          <div>
            <h3 className={cn("font-semibold text-neutral-900", geistSans.className)}>
              SMS Notifications
            </h3>
            <p className="text-neutral-600 text-sm">Text message alerts (standard rates apply)</p>
          </div>
        </div>
        <div className="divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white px-4">
          <PreferenceRow
            checked={preferences.sms_booking_updates}
            description="Receive SMS for booking confirmations and important updates"
            disabled={isPending}
            id="sms_booking_updates"
            label="Booking Updates"
            onChange={(v) => updatePreference("sms_booking_updates", v)}
          />
          <PreferenceRow
            checked={preferences.sms_reminders}
            description="Text reminders before your scheduled appointments"
            disabled={isPending}
            id="sms_reminders"
            label="Appointment Reminders"
            onChange={(v) => updatePreference("sms_reminders", v)}
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          className={cn(
            "rounded-lg bg-orange-500 px-6 py-2.5 font-semibold text-white transition-all hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50",
            geistSans.className
          )}
          disabled={isPending}
          onClick={handleSave}
          type="button"
        >
          {isPending ? "Saving..." : "Save Preferences"}
        </button>

        {message && (
          <p
            className={cn(
              "text-sm",
              message.type === "success" ? "text-green-600" : "text-red-600"
            )}
          >
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}

"use client";

import { Cancel01Icon, Edit02Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type BusinessSettings = {
  commission_rate: number;
  service_fee: number;
  cancellation_fees: {
    customer: number;
    professional: number;
    no_show: number;
  };
  booking_rules: {
    min_advance_hours: number;
    max_duration_hours: number;
    min_booking_amount: number;
    max_service_radius_km: number;
    auto_accept_threshold: number;
  };
  payout_settings: {
    schedule: "daily" | "weekly" | "monthly";
    min_threshold: number;
    currency: string;
    auto_payout: boolean;
  };
};

type Props = {
  initialSettings: BusinessSettings;
};

export function PlatformBusinessSettings({ initialSettings }: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState(initialSettings);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch("/api/admin/settings/business", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update settings");
      }

      setIsEditing(false);
      router.refresh();
    } catch (err) {
      console.error("Business settings update error:", err);
      setError(err instanceof Error ? err.message : "Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setSettings(initialSettings);
    setIsEditing(false);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-red-700 text-sm dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Commission & Fees */}
      <div>
        <h3 className="mb-4 font-semibold text-lg text-stone-900 dark:text-stone-100">
          Commission & Fees
        </h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 block font-semibold text-stone-600 text-xs uppercase tracking-wider dark:text-stone-400">
              Platform Commission (%)
            </label>
            {isEditing ? (
              <input
                className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:focus:ring-stone-400"
                max={50}
                min={0}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    commission_rate: Number.parseFloat(e.target.value),
                  })
                }
                step={0.1}
                type="number"
                value={settings.commission_rate}
              />
            ) : (
              <p className="text-stone-900 dark:text-stone-100">{settings.commission_rate}%</p>
            )}
            <p className="mt-1 text-stone-600 text-xs dark:text-stone-400">
              Commission charged to professionals per booking
            </p>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-stone-600 text-xs uppercase tracking-wider dark:text-stone-400">
              Customer Service Fee ($)
            </label>
            {isEditing ? (
              <input
                className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:focus:ring-stone-400"
                min={0}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    service_fee: Number.parseFloat(e.target.value),
                  })
                }
                step={0.01}
                type="number"
                value={settings.service_fee}
              />
            ) : (
              <p className="text-stone-900 dark:text-stone-100">
                ${settings.service_fee.toFixed(2)}
              </p>
            )}
            <p className="mt-1 text-stone-600 text-xs dark:text-stone-400">
              Fixed fee charged to customers per booking
            </p>
          </div>
        </div>
      </div>

      {/* Cancellation Fees */}
      <div>
        <h3 className="mb-4 font-semibold text-lg text-stone-900 dark:text-stone-100">
          Cancellation Fees ($)
        </h3>
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <label className="mb-2 block font-semibold text-stone-600 text-xs uppercase tracking-wider dark:text-stone-400">
              Customer Cancellation
            </label>
            {isEditing ? (
              <input
                className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:focus:ring-stone-400"
                min={0}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    cancellation_fees: {
                      ...settings.cancellation_fees,
                      customer: Number.parseFloat(e.target.value),
                    },
                  })
                }
                step={0.01}
                type="number"
                value={settings.cancellation_fees.customer}
              />
            ) : (
              <p className="text-stone-900 dark:text-stone-100">
                ${settings.cancellation_fees.customer.toFixed(2)}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block font-semibold text-stone-600 text-xs uppercase tracking-wider dark:text-stone-400">
              Professional Cancellation
            </label>
            {isEditing ? (
              <input
                className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:focus:ring-stone-400"
                min={0}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    cancellation_fees: {
                      ...settings.cancellation_fees,
                      professional: Number.parseFloat(e.target.value),
                    },
                  })
                }
                step={0.01}
                type="number"
                value={settings.cancellation_fees.professional}
              />
            ) : (
              <p className="text-stone-900 dark:text-stone-100">
                ${settings.cancellation_fees.professional.toFixed(2)}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block font-semibold text-stone-600 text-xs uppercase tracking-wider dark:text-stone-400">
              No-Show Fee
            </label>
            {isEditing ? (
              <input
                className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:focus:ring-stone-400"
                min={0}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    cancellation_fees: {
                      ...settings.cancellation_fees,
                      no_show: Number.parseFloat(e.target.value),
                    },
                  })
                }
                step={0.01}
                type="number"
                value={settings.cancellation_fees.no_show}
              />
            ) : (
              <p className="text-stone-900 dark:text-stone-100">
                ${settings.cancellation_fees.no_show.toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Booking Rules */}
      <div>
        <h3 className="mb-4 font-semibold text-lg text-stone-900 dark:text-stone-100">
          Booking Rules
        </h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 block font-semibold text-stone-600 text-xs uppercase tracking-wider dark:text-stone-400">
              Min Advance Notice (hours)
            </label>
            {isEditing ? (
              <input
                className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:focus:ring-stone-400"
                min={0}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    booking_rules: {
                      ...settings.booking_rules,
                      min_advance_hours: Number.parseInt(e.target.value, 10),
                    },
                  })
                }
                type="number"
                value={settings.booking_rules.min_advance_hours}
              />
            ) : (
              <p className="text-stone-900 dark:text-stone-100">
                {settings.booking_rules.min_advance_hours} hours
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block font-semibold text-stone-600 text-xs uppercase tracking-wider dark:text-stone-400">
              Max Booking Duration (hours)
            </label>
            {isEditing ? (
              <input
                className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:focus:ring-stone-400"
                min={1}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    booking_rules: {
                      ...settings.booking_rules,
                      max_duration_hours: Number.parseInt(e.target.value, 10),
                    },
                  })
                }
                type="number"
                value={settings.booking_rules.max_duration_hours}
              />
            ) : (
              <p className="text-stone-900 dark:text-stone-100">
                {settings.booking_rules.max_duration_hours} hours
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block font-semibold text-stone-600 text-xs uppercase tracking-wider dark:text-stone-400">
              Min Booking Amount ($)
            </label>
            {isEditing ? (
              <input
                className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:focus:ring-stone-400"
                min={0}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    booking_rules: {
                      ...settings.booking_rules,
                      min_booking_amount: Number.parseFloat(e.target.value),
                    },
                  })
                }
                step={0.01}
                type="number"
                value={settings.booking_rules.min_booking_amount}
              />
            ) : (
              <p className="text-stone-900 dark:text-stone-100">
                ${settings.booking_rules.min_booking_amount.toFixed(2)}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block font-semibold text-stone-600 text-xs uppercase tracking-wider dark:text-stone-400">
              Max Service Radius (km)
            </label>
            {isEditing ? (
              <input
                className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:focus:ring-stone-400"
                min={1}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    booking_rules: {
                      ...settings.booking_rules,
                      max_service_radius_km: Number.parseInt(e.target.value, 10),
                    },
                  })
                }
                type="number"
                value={settings.booking_rules.max_service_radius_km}
              />
            ) : (
              <p className="text-stone-900 dark:text-stone-100">
                {settings.booking_rules.max_service_radius_km} km
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Payout Settings */}
      <div>
        <h3 className="mb-4 font-semibold text-lg text-stone-900 dark:text-stone-100">
          Payout Settings
        </h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 block font-semibold text-stone-600 text-xs uppercase tracking-wider dark:text-stone-400">
              Payout Schedule
            </label>
            {isEditing ? (
              <select
                className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:focus:ring-stone-400"
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    payout_settings: {
                      ...settings.payout_settings,
                      schedule: e.target.value as "daily" | "weekly" | "monthly",
                    },
                  })
                }
                value={settings.payout_settings.schedule}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            ) : (
              <p className="text-stone-900 capitalize dark:text-stone-100">
                {settings.payout_settings.schedule}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block font-semibold text-stone-600 text-xs uppercase tracking-wider dark:text-stone-400">
              Min Payout Threshold ($)
            </label>
            {isEditing ? (
              <input
                className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:focus:ring-stone-400"
                min={0}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    payout_settings: {
                      ...settings.payout_settings,
                      min_threshold: Number.parseFloat(e.target.value),
                    },
                  })
                }
                step={0.01}
                type="number"
                value={settings.payout_settings.min_threshold}
              />
            ) : (
              <p className="text-stone-900 dark:text-stone-100">
                ${settings.payout_settings.min_threshold.toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4">
        {isEditing ? (
          <>
            <button
              className="flex items-center gap-2 rounded-lg bg-stone-900 px-6 py-2.5 font-semibold text-sm text-white transition-colors hover:bg-stone-900 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-stone-100 dark:bg-stone-100 dark:text-stone-950"
              disabled={isSaving}
              onClick={handleSave}
              type="button"
            >
              <HugeiconsIcon className="h-4 w-4" icon={Tick02Icon} />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <button
              className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-6 py-2.5 font-semibold text-stone-600 text-sm transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-800 dark:bg-stone-950 dark:bg-stone-950 dark:text-stone-400"
              disabled={isSaving}
              onClick={handleCancel}
              type="button"
            >
              <HugeiconsIcon className="h-4 w-4" icon={Cancel01Icon} />
              Cancel
            </button>
          </>
        ) : (
          <button
            className="flex items-center gap-2 rounded-lg bg-stone-900 px-6 py-2.5 font-semibold text-sm text-white transition-colors hover:bg-stone-900 dark:bg-stone-100 dark:bg-stone-100 dark:text-stone-950"
            onClick={() => setIsEditing(true)}
            type="button"
          >
            <HugeiconsIcon className="h-4 w-4" icon={Edit02Icon} />
            Edit Settings
          </button>
        )}
      </div>
    </div>
  );
}

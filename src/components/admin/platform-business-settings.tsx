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
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Commission & Fees */}
      <div>
        <h3 className="mb-4 font-semibold text-lg text-neutral-900">Commission & Fees</h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label
              className="mb-2 block font-medium text-neutral-500 text-sm"
              htmlFor="commission_rate"
            >
              Platform Commission (%)
            </label>
            {isEditing ? (
              <input
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2 text-neutral-900 focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20"
                id="commission_rate"
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
              <p className="text-neutral-900">{settings.commission_rate}%</p>
            )}
            <p className="mt-1 text-neutral-500 text-xs">
              Commission charged to professionals per booking
            </p>
          </div>

          <div>
            <label
              className="mb-2 block font-medium text-neutral-500 text-sm"
              htmlFor="service_fee"
            >
              Customer Service Fee ($)
            </label>
            {isEditing ? (
              <input
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2 text-neutral-900 focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20"
                id="service_fee"
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
              <p className="text-neutral-900">${settings.service_fee.toFixed(2)}</p>
            )}
            <p className="mt-1 text-neutral-500 text-xs">
              Fixed fee charged to customers per booking
            </p>
          </div>
        </div>
      </div>

      {/* Cancellation Fees */}
      <div>
        <h3 className="mb-4 font-semibold text-lg text-neutral-900">Cancellation Fees ($)</h3>
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <label
              className="mb-2 block font-medium text-neutral-500 text-sm"
              htmlFor="cancellation_customer"
            >
              Customer Cancellation
            </label>
            {isEditing ? (
              <input
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2 text-neutral-900 focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20"
                id="cancellation_customer"
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
              <p className="text-neutral-900">${settings.cancellation_fees.customer.toFixed(2)}</p>
            )}
          </div>

          <div>
            <label
              className="mb-2 block font-medium text-neutral-500 text-sm"
              htmlFor="cancellation_professional"
            >
              Professional Cancellation
            </label>
            {isEditing ? (
              <input
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2 text-neutral-900 focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20"
                id="cancellation_professional"
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
              <p className="text-neutral-900">
                ${settings.cancellation_fees.professional.toFixed(2)}
              </p>
            )}
          </div>

          <div>
            <label
              className="mb-2 block font-medium text-neutral-500 text-sm"
              htmlFor="cancellation_no_show"
            >
              No-Show Fee
            </label>
            {isEditing ? (
              <input
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2 text-neutral-900 focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20"
                id="cancellation_no_show"
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
              <p className="text-neutral-900">${settings.cancellation_fees.no_show.toFixed(2)}</p>
            )}
          </div>
        </div>
      </div>

      {/* Booking Rules */}
      <div>
        <h3 className="mb-4 font-semibold text-lg text-neutral-900">Booking Rules</h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label
              className="mb-2 block font-medium text-neutral-500 text-sm"
              htmlFor="min_advance_hours"
            >
              Min Advance Notice (hours)
            </label>
            {isEditing ? (
              <input
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2 text-neutral-900 focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20"
                id="min_advance_hours"
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
              <p className="text-neutral-900">{settings.booking_rules.min_advance_hours} hours</p>
            )}
          </div>

          <div>
            <label
              className="mb-2 block font-medium text-neutral-500 text-sm"
              htmlFor="max_duration_hours"
            >
              Max Booking Duration (hours)
            </label>
            {isEditing ? (
              <input
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2 text-neutral-900 focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20"
                id="max_duration_hours"
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
              <p className="text-neutral-900">{settings.booking_rules.max_duration_hours} hours</p>
            )}
          </div>

          <div>
            <label
              className="mb-2 block font-medium text-neutral-500 text-sm"
              htmlFor="min_booking_amount"
            >
              Min Booking Amount ($)
            </label>
            {isEditing ? (
              <input
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2 text-neutral-900 focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20"
                id="min_booking_amount"
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
              <p className="text-neutral-900">
                ${settings.booking_rules.min_booking_amount.toFixed(2)}
              </p>
            )}
          </div>

          <div>
            <label
              className="mb-2 block font-medium text-neutral-500 text-sm"
              htmlFor="max_service_radius_km"
            >
              Max Service Radius (km)
            </label>
            {isEditing ? (
              <input
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2 text-neutral-900 focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20"
                id="max_service_radius_km"
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
              <p className="text-neutral-900">{settings.booking_rules.max_service_radius_km} km</p>
            )}
          </div>
        </div>
      </div>

      {/* Payout Settings */}
      <div>
        <h3 className="mb-4 font-semibold text-lg text-neutral-900">Payout Settings</h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label
              className="mb-2 block font-medium text-neutral-500 text-sm"
              htmlFor="payout_schedule"
            >
              Payout Schedule
            </label>
            {isEditing ? (
              <select
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2 text-neutral-900 focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20"
                id="payout_schedule"
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
              <p className="text-neutral-900 capitalize">{settings.payout_settings.schedule}</p>
            )}
          </div>

          <div>
            <label
              className="mb-2 block font-medium text-neutral-500 text-sm"
              htmlFor="min_threshold"
            >
              Min Payout Threshold ($)
            </label>
            {isEditing ? (
              <input
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2 text-neutral-900 focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20"
                id="min_threshold"
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
              <p className="text-neutral-900">
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
              className="flex items-center gap-2 rounded-lg bg-rausch-500 px-6 py-2.5 font-semibold text-sm text-white transition-colors hover:bg-rausch-600 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSaving}
              onClick={handleSave}
              type="button"
            >
              <HugeiconsIcon className="h-4 w-4" icon={Tick02Icon} />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <button
              className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-6 py-2.5 font-semibold text-neutral-700 text-sm transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
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
            className="flex items-center gap-2 rounded-lg bg-neutral-900 px-6 py-2.5 font-semibold text-sm text-white transition-colors hover:bg-neutral-700"
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

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type FeatureFlags = {
  recurring_bookings: boolean;
  amara_ai: boolean;
  auto_translate: boolean;
  gps_verification: boolean;
  one_tap_rebook: boolean;
  professional_bidding: boolean;
  customer_reviews: boolean;
  tips: boolean;
};

type Props = {
  initialFlags: FeatureFlags;
};

export function FeatureFlagsSettings({ initialFlags }: Props) {
  const router = useRouter();
  const [flags, setFlags] = useState(initialFlags);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleToggle = async (featureKey: keyof FeatureFlags, currentValue: boolean) => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      const newValue = !currentValue;

      const response = await fetch("/api/admin/settings/features", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feature: featureKey,
          enabled: newValue,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update feature");
      }

      // Update local state
      setFlags((prev) => ({
        ...prev,
        [featureKey]: newValue,
      }));

      setSuccessMessage(`Feature ${newValue ? "enabled" : "disabled"} successfully`);
      setTimeout(() => setSuccessMessage(null), 3000);

      router.refresh();
    } catch (err) {
      console.error("Feature toggle error:", err);
      setError(err instanceof Error ? err.message : "Failed to update feature");
    } finally {
      setIsSaving(false);
    }
  };

  const features = [
    {
      key: "recurring_bookings" as const,
      name: "Recurring Bookings",
      description: "Allow customers to schedule recurring cleaning services",
    },
    {
      key: "amara_ai" as const,
      name: "Amara AI Assistant",
      description: "Enable AI-powered booking assistant for customers",
    },
    {
      key: "auto_translate" as const,
      name: "Auto-Translate Chat",
      description: "Automatically translate messages between English and Spanish",
    },
    {
      key: "gps_verification" as const,
      name: "GPS Verification",
      description: "Require GPS check-in for professionals at job locations",
    },
    {
      key: "one_tap_rebook" as const,
      name: "One-Tap Rebook",
      description: "Quick rebooking feature for repeat customers",
    },
    {
      key: "professional_bidding" as const,
      name: "Professional Bidding",
      description: "Allow professionals to bid on customer job requests",
      beta: true,
    },
    {
      key: "customer_reviews" as const,
      name: "Customer Reviews",
      description: "Enable customer ratings and reviews for professionals",
    },
    {
      key: "tips" as const,
      name: "Tip Functionality",
      description: "Allow customers to tip professionals after service",
    },
  ];

  return (
    <div className="space-y-6">
      {error && (
        <div className="border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-red-700 text-sm dark:text-red-200">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="border border-neutral-900 bg-neutral-900 p-4 dark:border-neutral-100/40 dark:bg-neutral-100/10">
          <p className="text-red-700 text-sm dark:text-red-200">{successMessage}</p>
        </div>
      )}

      <div className="space-y-4">
        {features.map((feature) => (
          <div
            className="flex items-center justify-between border border-neutral-200 bg-white p-4 transition-colors hover:bg-white dark:border-neutral-800 dark:bg-neutral-950 dark:bg-neutral-950"
            key={feature.key}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-red-700 text-sm dark:text-red-200">
                  {feature.name}
                </h4>
                {feature.beta && (
                  <span className="bg-neutral-900 px-2 py-0.5 font-semibold text-white text-xs dark:bg-neutral-100/10 dark:text-neutral-100">
                    BETA
                  </span>
                )}
              </div>
              <p className="mt-1 text-neutral-600 text-xs dark:text-neutral-300">
                {feature.description}
              </p>
            </div>

            <button
              aria-label={`Toggle ${feature.name}`}
              className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
                flags[feature.key] ? "bg-neutral-900 dark:bg-neutral-100" : "bg-[neutral-200]"
              } ${isSaving ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
              disabled={isSaving}
              onClick={() => handleToggle(feature.key, flags[feature.key])}
              type="button"
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform dark:bg-neutral-950 ${
                  flags[feature.key] ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <div className="border border-neutral-900 bg-white p-4 dark:border-neutral-100 dark:bg-neutral-950">
        <p className="text-red-700 text-sm dark:text-red-200">
          <strong>Note:</strong> Changes to feature flags take effect immediately across the entire
          platform. Use with caution in production.
        </p>
      </div>
    </div>
  );
}

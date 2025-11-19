"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { geistSans } from "@/app/fonts";
import { Toggle } from "@/components/ui/anthropic-components";
import {
  trackEarningsBadgeEnabled,
  trackEarningsBadgeDisabled,
} from "@/lib/analytics/professional-events";
import { getBadgeFromBookings } from "@/lib/professionals/earnings-badges";
import { cn } from "@/lib/utils/core";
import { EarningsBadge } from "./earnings-badge";

// ========================================
// Types
// ========================================

type EarningsBadgeSettingsData = {
  success: boolean;
  enabled: boolean;
  totalBookings: number;
  totalEarningsCOP: number;
};

// ========================================
// Component
// ========================================

/**
 * EarningsBadgeSettings - Toggle visibility of earnings badge on public profile
 *
 * Features:
 * - Displays current badge tier with preview
 * - Toggle switch to control public visibility
 * - Real-time preview of how badge appears
 * - Optimistic updates with error rollback
 *
 * @example
 * ```tsx
 * <EarningsBadgeSettings />
 * ```
 */
export function EarningsBadgeSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalEarningsCOP, setTotalEarningsCOP] = useState(0);
  const [professionalId, setProfessionalId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // ========================================
  // Fetch Current Setting
  // ========================================

  useEffect(() => {
    async function fetchSettings() {
      try {
        // Fetch user session to get professional ID
        const userResponse = await fetch("/api/auth/session");
        const userData = await userResponse.json();

        if (userData.user?.id) {
          setProfessionalId(userData.user.id);
        }

        const response = await fetch("/api/pro/settings/earnings-badge");

        if (!response.ok) {
          throw new Error("Failed to fetch earnings badge settings");
        }

        const data: EarningsBadgeSettingsData = await response.json();

        setEnabled(data.enabled);
        setTotalBookings(data.totalBookings);
        setTotalEarningsCOP(data.totalEarningsCOP);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load settings");
        toast.error("Failed to load earnings badge settings");
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettings();
  }, []);

  // ========================================
  // Handle Toggle Change
  // ========================================

  async function handleToggle(newValue: boolean) {
    // Optimistic update
    const previousValue = enabled;
    setEnabled(newValue);
    setIsSaving(true);

    try {
      const response = await fetch("/api/pro/settings/earnings-badge", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled: newValue }),
      });

      if (!response.ok) {
        throw new Error("Failed to update setting");
      }

      const data: EarningsBadgeSettingsData = await response.json();

      // Sync with server response
      setEnabled(data.enabled);
      setTotalBookings(data.totalBookings);
      setTotalEarningsCOP(data.totalEarningsCOP);

      // Track analytics
      if (professionalId) {
        const tier = getBadgeFromBookings(data.totalBookings);
        const trackingProps = {
          professionalId,
          totalBookings: data.totalBookings,
          totalEarningsCOP: data.totalEarningsCOP,
          tier,
        };

        if (newValue) {
          trackEarningsBadgeEnabled(trackingProps);
        } else {
          trackEarningsBadgeDisabled(trackingProps);
        }
      }

      toast.success(
        newValue
          ? "Earnings badge is now visible on your public profile"
          : "Earnings badge is now hidden from your public profile"
      );
    } catch (_err) {
      // Rollback on error
      setEnabled(previousValue);
      toast.error("Failed to update setting. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  // ========================================
  // Render States
  // ========================================

  if (isLoading) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-200 border-t-orange-500" />
          <span className={cn("text-neutral-600", geistSans.className)}>Loading settings...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className={cn("text-red-700", geistSans.className)}>{error}</p>
      </div>
    );
  }

  // ========================================
  // Main Content
  // ========================================

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className={cn("mb-2 font-semibold text-neutral-900 text-xl", geistSans.className)}>
          Earnings Badge
        </h3>
        <p className={cn("text-neutral-600 text-sm", geistSans.className)}>
          Showcase your achievements and earnings on your public profile to build trust with
          potential clients.
        </p>
      </div>

      {/* Current Badge Preview */}
      <div className="mb-6">
        <p className={cn("mb-3 block font-medium text-neutral-700 text-sm", geistSans.className)}>
          Your Current Badge
        </p>
        <EarningsBadge
          showEarnings={enabled}
          showProgress
          size="md"
          totalBookings={totalBookings}
          totalEarningsCOP={totalEarningsCOP}
        />
      </div>

      {/* Toggle Control */}
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4" data-testid="share-earnings-badge-toggle">
        <div className="mb-2">
          <Toggle
            checked={enabled}
            disabled={isSaving}
            label="Show earnings on public profile"
            onChange={handleToggle}
          />
        </div>
        <p className={cn("text-neutral-600 text-sm", geistSans.className)}>
          {enabled
            ? "Your earnings badge is visible to everyone visiting your profile"
            : "Your earnings badge is hidden from your public profile"}
        </p>
      </div>

      {/* Info Message */}
      <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className={cn("text-blue-700 text-sm", geistSans.className)}>
          💡 <strong>Tip:</strong> Professionals who display their earnings badge see 23% more
          bookings on average. Your badge tier is based on total completed bookings.
        </p>
      </div>
    </div>
  );
}

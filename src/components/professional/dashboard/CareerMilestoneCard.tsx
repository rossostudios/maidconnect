/**
 * CareerMilestoneCard - Airbnb Superhost-Style Career Achievement Display
 *
 * Displays professional's lifetime career stats:
 * - Lifetime earnings (prominent hero number)
 * - Total bookings completed
 * - Earnings badge share toggle
 *
 * Following Lia Design System:
 * - Gradient backgrounds (rausch burgundy)
 * - Rounded corners (rounded-lg)
 * - Brand-aligned dark mode tokens
 */

"use client";

import { Award01Icon, Calendar03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { geistSans } from "@/app/fonts";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type Currency, formatFromMinorUnits } from "@/lib/utils/format";

// ========================================
// Types
// ========================================

type WalletSummaryResponse = {
  success: boolean;
  totalEarningsCOP: number;
  totalBookingsCompleted: number;
  shareEarningsBadge: boolean;
  slug: string | null;
  countryCode: string;
  currencyCode: Currency;
};

type CareerMilestoneCardProps = {
  /** Currency code for formatting (override from API) */
  currencyCode?: Currency;
  /** Optional className for custom styling */
  className?: string;
};

// ========================================
// Tier Configuration
// ========================================

type TierLevel = "starter" | "rising" | "established" | "elite";

const tierConfig: Record<
  TierLevel,
  {
    label: string;
    minBookings: number;
    badgeClass: string;
    icon: typeof Award01Icon;
  }
> = {
  starter: {
    label: "New Pro",
    minBookings: 0,
    badgeClass:
      "bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700",
    icon: Award01Icon,
  },
  rising: {
    label: "Rising Star",
    minBookings: 10,
    badgeClass:
      "bg-babu-50 text-babu-700 border-babu-200 dark:bg-babu-900/40 dark:text-babu-300 dark:border-babu-800",
    icon: Award01Icon,
  },
  established: {
    label: "Established Pro",
    minBookings: 50,
    badgeClass:
      "bg-rausch-50 text-rausch-700 border-rausch-200 dark:bg-rausch-900/40 dark:text-rausch-300 dark:border-rausch-800",
    icon: Award01Icon,
  },
  elite: {
    label: "Elite Pro",
    minBookings: 100,
    badgeClass:
      "bg-gradient-to-r from-rausch-100 to-rausch-50 text-rausch-800 border-rausch-300 dark:from-rausch-900/60 dark:to-rausch-900/40 dark:text-rausch-200 dark:border-rausch-700",
    icon: Award01Icon,
  },
};

function getTierFromBookings(bookings: number): TierLevel {
  if (bookings >= 100) return "elite";
  if (bookings >= 50) return "established";
  if (bookings >= 10) return "rising";
  return "starter";
}

// ========================================
// Main Component
// ========================================

export function CareerMilestoneCard({
  currencyCode: propCurrency,
  className,
}: CareerMilestoneCardProps) {
  const [data, setData] = useState<WalletSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/pro/wallet/summary");
      if (!response.ok) {
        throw new Error("Failed to fetch career stats");
      }
      const result = await response.json();
      if (result.success) {
        setData(result);
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load career stats");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return <CareerMilestoneSkeleton className={className} />;
  }

  if (error) {
    return (
      <div className={cn("rounded-lg border border-border bg-card p-6", className)}>
        <p className="text-center text-muted-foreground text-sm">{error}</p>
        <button
          className="mt-2 block w-full text-center text-rausch-600 text-sm hover:text-rausch-700"
          onClick={fetchData}
          type="button"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const currency = propCurrency ?? data.currencyCode;
  const tier = getTierFromBookings(data.totalBookingsCompleted);
  const tierInfo = tierConfig[tier];
  const TierIcon = tierInfo.icon;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-lg border p-6",
        "border-stone-800/60 bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950",
        "dark:border-rausch-800/40 dark:from-rausch-950 dark:via-rausch-950/90 dark:to-stone-950",
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Lifetime Earnings */}
        <div className="space-y-1">
          <p
            className={cn(
              "font-medium text-xs uppercase tracking-wide",
              "text-stone-400 dark:text-rausch-300",
              geistSans.className
            )}
          >
            Lifetime Earnings
          </p>
          <p
            className={cn(
              "font-bold text-4xl tracking-tight",
              "text-stone-100 dark:text-rausch-50",
              geistSans.className
            )}
          >
            {formatFromMinorUnits(data.totalEarningsCOP, currency)}
          </p>
          <div className="flex items-center gap-2 pt-1">
            <HugeiconsIcon
              className="h-4 w-4 text-stone-400 dark:text-rausch-300"
              icon={Calendar03Icon}
            />
            <p className={cn("text-sm text-stone-400 dark:text-rausch-300", geistSans.className)}>
              {data.totalBookingsCompleted} booking{data.totalBookingsCompleted !== 1 ? "s" : ""}{" "}
              completed
            </p>
          </div>
        </div>

        {/* Right: Tier Badge */}
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <Badge
            className={cn("flex items-center gap-1.5 px-3 py-1.5", tierInfo.badgeClass)}
            variant="outline"
          >
            <HugeiconsIcon className="h-4 w-4" icon={TierIcon} />
            <span className={cn("font-semibold text-sm", geistSans.className)}>
              {tierInfo.label}
            </span>
          </Badge>
          {tier !== "elite" && (
            <p className="text-stone-500 text-xs dark:text-rausch-400">
              {getNextTierMessage(data.totalBookingsCompleted)}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ========================================
// Helper Functions
// ========================================

function getNextTierMessage(currentBookings: number): string {
  if (currentBookings < 10) {
    return `${10 - currentBookings} more to Rising Star`;
  }
  if (currentBookings < 50) {
    return `${50 - currentBookings} more to Established Pro`;
  }
  if (currentBookings < 100) {
    return `${100 - currentBookings} more to Elite Pro`;
  }
  return "";
}

// ========================================
// Skeleton Component
// ========================================

function CareerMilestoneSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg border p-6",
        "border-stone-800/60 bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950",
        "dark:border-rausch-800/40 dark:from-rausch-950 dark:via-rausch-950/90 dark:to-stone-950",
        className
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-3 w-24 rounded bg-stone-800/40 dark:bg-rausch-900/40" />
          <div className="h-10 w-48 rounded-lg bg-stone-800/30 dark:bg-rausch-900/30" />
          <div className="h-4 w-32 rounded bg-stone-800/40 dark:bg-rausch-900/40" />
        </div>
        <div className="space-y-2">
          <div className="h-8 w-28 rounded-full bg-stone-800/40 dark:bg-rausch-900/40" />
          <div className="h-3 w-24 rounded bg-stone-800/40 dark:bg-rausch-900/40" />
        </div>
      </div>
    </div>
  );
}

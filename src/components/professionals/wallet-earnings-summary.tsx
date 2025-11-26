"use client";

import {
  Award01Icon,
  LinkSquare01Icon,
  TrendingUp01Icon,
  Wallet02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useLocale } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import { geistSans } from "@/app/fonts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils/core";
import { formatCurrency } from "@/lib/utils/format";
import { EarningsBadge } from "./earnings-badge";

// ========================================
// Types
// ========================================

type WalletSummaryData = {
  success: boolean;
  totalEarningsCOP: number;
  totalBookingsCompleted: number;
  shareEarningsBadge: boolean;
  slug: string | null;
  countryCode?: string;
  currencyCode?: "COP" | "PYG" | "UYU" | "ARS";
};

// ========================================
// Wallet/Earnings Summary Component
// ========================================

type WalletEarningsSummaryProps = {
  /**
   * Optional className for custom styling
   */
  className?: string;
};

/**
 * WalletEarningsSummary - Displays professional's career earnings and achievements
 *
 * Features:
 * - Shows total career earnings
 * - Displays earnings badge tier with progress
 * - Shows total completed bookings
 * - Link to public profile (if public)
 * - Auto-refreshes on mount
 *
 * @example
 * ```tsx
 * <WalletEarningsSummary />
 * ```
 */
export function WalletEarningsSummary({ className }: WalletEarningsSummaryProps) {
  const locale = useLocale();

  const [data, setData] = useState<WalletSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ========================================
  // Fetch Wallet Summary Data
  // ========================================

  const fetchSummary = useCallback(async () => {
    try {
      const response = await fetch("/api/pro/wallet/summary");

      if (!response.ok) {
        throw new Error("Failed to fetch wallet summary");
      }

      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // ========================================
  // Loading State
  // ========================================

  if (isLoading) {
    return (
      <Card className={cn("border-neutral-200 bg-white shadow-sm", className)}>
        <CardHeader className="p-8 pb-6">
          <div className="h-6 w-48 animate-pulse rounded-lg bg-neutral-200" />
        </CardHeader>
        <CardContent className="space-y-6 p-8 pt-0">
          <div className="h-24 w-full animate-pulse rounded-lg bg-neutral-100" />
          <div className="h-20 w-full animate-pulse rounded-lg bg-neutral-100" />
        </CardContent>
      </Card>
    );
  }

  // ========================================
  // Empty State (No Data or Error)
  // ========================================

  if (error || !data) {
    return (
      <Card className={cn("border-neutral-200 bg-white", className)}>
        <CardContent className="flex flex-col items-center justify-center p-12">
          <div className="mb-4 flex size-16 items-center justify-center rounded-lg bg-neutral-100">
            <HugeiconsIcon className="size-8 text-neutral-400" icon={Wallet02Icon} />
          </div>
          <h3 className={cn("font-semibold text-base text-neutral-900", geistSans.className)}>
            No earnings yet
          </h3>
          <p className={cn("mt-1 text-center text-neutral-500 text-sm", geistSans.className)}>
            Complete bookings to see your earnings here
          </p>
        </CardContent>
      </Card>
    );
  }

  const {
    totalEarningsCOP,
    totalBookingsCompleted,
    shareEarningsBadge,
    slug,
    currencyCode = "COP",
  } = data;

  return (
    <Card className={cn("border-neutral-200 bg-white shadow-sm", className)}>
      {/* Header */}
      <CardHeader className="p-8 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-100">
              <HugeiconsIcon className="size-5 text-green-600" icon={Wallet02Icon} />
            </div>
            <h2 className={cn("font-semibold text-neutral-900 text-xl", geistSans.className)}>
              Career Earnings
            </h2>
          </div>
          {slug && (
            <Link href={`/pro/${slug}`}>
              <Button className="gap-2" size="sm" variant="outline">
                <HugeiconsIcon className="size-4" icon={LinkSquare01Icon} />
                View Profile
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-8 pt-0">
        {/* Total Earnings - Large Display */}
        <div className="rounded-lg border border-neutral-200 bg-gradient-to-br from-green-50 to-babu-50 p-6">
          <div className="flex items-baseline justify-between">
            <div className="flex-1">
              <p
                className={cn(
                  "font-semibold text-neutral-700 text-xs uppercase tracking-wider",
                  geistSans.className
                )}
              >
                Total Earnings
              </p>
              <p
                className={cn(
                  "mt-2 font-semibold text-5xl text-neutral-900 tracking-tighter",
                  geistSans.className
                )}
              >
                {formatCurrency(totalEarningsCOP, currencyCode, locale)}
              </p>
              <p className={cn("mt-2 text-neutral-600 text-sm", geistSans.className)}>
                From {totalBookingsCompleted} completed{" "}
                {totalBookingsCompleted === 1 ? "booking" : "bookings"}
              </p>
            </div>
            <HugeiconsIcon className="size-8 text-green-600" icon={TrendingUp01Icon} />
          </div>
        </div>

        {/* Earnings Badge Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <HugeiconsIcon className="size-5 text-rausch-600" icon={Award01Icon} />
            <h3
              className={cn(
                "font-semibold text-neutral-900 text-sm uppercase tracking-wider",
                geistSans.className
              )}
            >
              Achievement Badge
            </h3>
          </div>

          {/* Badge Display */}
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <EarningsBadge
              showEarnings={shareEarningsBadge && totalEarningsCOP > 0}
              showProgress
              size="md"
              totalBookings={totalBookingsCompleted}
              totalEarningsCOP={totalEarningsCOP}
            />
          </div>

          {/* Badge Visibility Info */}
          <div className="flex items-start gap-3 rounded-lg border border-babu-200 bg-babu-50 p-4">
            <div className="flex-1">
              <p className={cn("font-medium text-babu-900 text-sm", geistSans.className)}>
                {shareEarningsBadge
                  ? "✓ Badge visible on your public profile"
                  : "Badge hidden from public profile"}
              </p>
              <p className={cn("mt-1 text-babu-700 text-xs", geistSans.className)}>
                {shareEarningsBadge
                  ? "Visitors can see your achievement tier and earnings"
                  : "Update visibility in Profile Settings"}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 border-neutral-200 border-t pt-6">
          <div>
            <p
              className={cn(
                "font-semibold text-neutral-700 text-xs uppercase tracking-wider",
                geistSans.className
              )}
            >
              Completed Bookings
            </p>
            <p className={cn("mt-2 font-bold text-3xl text-neutral-900", geistSans.className)}>
              {totalBookingsCompleted}
            </p>
          </div>
          <div>
            <p
              className={cn(
                "font-semibold text-neutral-700 text-xs uppercase tracking-wider",
                geistSans.className
              )}
            >
              Average Per Booking
            </p>
            <p className={cn("mt-2 font-bold text-3xl text-neutral-900", geistSans.className)}>
              {totalBookingsCompleted > 0
                ? formatCurrency(
                    Math.floor(totalEarningsCOP / totalBookingsCompleted),
                    currencyCode,
                    locale
                  )
                : formatCurrency(0, currencyCode, locale)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { AlertCircle, Clock, DollarSign, TrendingUp, Wallet, Zap } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import { geistSans } from "@/app/fonts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/core";
import { formatFromMinorUnits, type Currency } from "@/lib/utils/format";

// ========================================
// Types
// ========================================

type BalanceEligibilityResponse = {
  success: boolean;
  balance: {
    availableCop: number;
    pendingCop: number;
    totalCop: number;
  };
  eligibility: {
    isEligible: boolean;
    reasons: string[];
  };
  feeInfo: {
    feePercentage: number;
    minThresholdCop: number;
    dailyLimit: number;
    usedToday: number;
    remainingToday: number;
  };
  estimate: {
    grossAmountCop: number;
    feeAmountCop: number;
    netAmountCop: number;
  };
  pendingClearances: Array<{
    bookingId: string;
    amountCop: number;
    completedAt: string;
    clearanceAt: string;
    hoursRemaining: number;
  }>;
};

// ========================================
// Balance Card Component
// ========================================

type BalanceCardProps = {
  /**
   * Callback when instant payout button is clicked
   */
  onRequestPayout?: () => void;
  /**
   * Optional className for custom styling
   */
  className?: string;
  /**
   * Currency code for balance display (COP, PYG, UYU, ARS)
   */
  currencyCode: Currency;
};

/**
 * BalanceCard - Displays professional's balance with instant payout capabilities
 *
 * Features:
 * - Shows available and pending balance
 * - Displays instant payout eligibility
 * - Shows pending clearances with countdown timers
 * - Rate limit status and fee information
 * - Auto-refreshes every 30 seconds
 *
 * @example
 * ```tsx
 * <BalanceCard onRequestPayout={() => setShowPayoutModal(true)} />
 * ```
 */
export function BalanceCard({ onRequestPayout, className, currencyCode }: BalanceCardProps) {
  const t = useTranslations("dashboard.pro.balance");
  const locale = useLocale();

  const [data, setData] = useState<BalanceEligibilityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ========================================
  // Fetch Balance Data
  // ========================================

  const fetchBalance = useCallback(async () => {
    try {
      const response = await fetch("/api/pro/payouts/instant");

      if (!response.ok) {
        throw new Error("Failed to fetch balance data");
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

  // Initial fetch and auto-refresh every 30 seconds
  useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [fetchBalance]);

  // ========================================
  // Loading State
  // ========================================

  if (isLoading) {
    return (
      <Card className={cn("border-neutral-200 bg-white shadow-sm", className)}>
        <CardHeader className="p-8 pb-6">
          <div className="h-6 w-32 animate-pulse bg-neutral-200 rounded-lg" />
        </CardHeader>
        <CardContent className="space-y-6 p-8 pt-0">
          <div className="h-20 w-full animate-pulse bg-neutral-100 rounded-lg" />
          <div className="h-20 w-full animate-pulse bg-neutral-100 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  // ========================================
  // Error State
  // ========================================

  if (error || !data) {
    return (
      <Card className={cn("border-red-200 bg-red-50", className)}>
        <CardContent className="flex items-center gap-4 p-6">
          <AlertCircle className="size-5 text-red-600" />
          <div>
            <p className={cn("font-semibold text-red-900 text-sm", geistSans.className)}>
              {t("error.title")}
            </p>
            <p className={cn("text-red-700 text-sm", geistSans.className)}>
              {error || t("error.unknown")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { balance, eligibility, feeInfo, estimate, pendingClearances } = data;

  return (
    <Card className={cn("border-neutral-200 bg-white shadow-sm", className)} data-testid="balance-card">
      {/* Header */}
      <CardHeader className="p-8 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center bg-orange-100 rounded-lg">
              <Wallet className="size-5 text-orange-600" />
            </div>
            <h2 className={cn("font-semibold text-neutral-900 text-xl", geistSans.className)}>
              {t("title")}
            </h2>
          </div>
          <Button
            disabled={!eligibility.isEligible}
            onClick={onRequestPayout}
            size="sm"
            variant="default"
            className="gap-2"
            data-testid="instant-payout-button"
          >
            <Zap className="size-4" />
            {t("actions.instantPayout")}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-8 pt-0">
        {/* Available Balance - Large Display */}
        <div className="border-neutral-200 bg-neutral-50 border p-6 rounded-lg">
          <div className="flex items-baseline justify-between">
            <div>
              <p
                className={cn(
                  "font-semibold text-neutral-700 text-xs uppercase tracking-wider",
                  geistSans.className
                )}
              >
                {t("available.label")}
              </p>
              <p
                className={cn(
                  "mt-2 font-semibold text-4xl text-neutral-900 tracking-tighter",
                  geistSans.className
                )}
                data-testid="available-balance"
              >
                {formatFromMinorUnits(balance.availableCop, currencyCode)}
              </p>
              <p className={cn("mt-1 text-neutral-600 text-sm", geistSans.className)}>
                {t("available.description")}
              </p>
            </div>
            <DollarSign className="size-8 text-neutral-400" />
          </div>

          {/* Instant Payout Fee Estimate */}
          {balance.availableCop >= feeInfo.minThresholdCop && (
            <div className="mt-4 border-neutral-200 bg-white border-t pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className={cn("text-neutral-600", geistSans.className)}>
                  {t("estimate.fee", { percentage: feeInfo.feePercentage })}
                </span>
                <span className={cn("font-medium text-neutral-900", geistSans.className)}>
                  -{formatFromMinorUnits(estimate.feeAmountCop, currencyCode)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between font-semibold text-sm">
                <span className={cn("text-neutral-900", geistSans.className)}>
                  {t("estimate.youReceive")}
                </span>
                <span className={cn("text-green-700", geistSans.className)}>
                  {formatFromMinorUnits(estimate.netAmountCop, currencyCode)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Pending Balance */}
        <div className="flex items-center justify-between border-neutral-200 bg-blue-50 border p-4 rounded-lg" data-testid="pending-balance">
          <div className="flex items-center gap-3">
            <Clock className="size-5 text-blue-600" />
            <div>
              <p
                className={cn("font-semibold text-blue-900 text-sm", geistSans.className)}
              >
                {t("pending.label")}
              </p>
              <p className={cn("text-blue-700 text-xs", geistSans.className)}>
                {t("pending.description")}
              </p>
            </div>
          </div>
          <p className={cn("font-bold text-blue-900 text-lg", geistSans.className)}>
            {formatFromMinorUnits(balance.pendingCop, currencyCode)}
          </p>
        </div>

        {/* Pending Clearances */}
        {pendingClearances.length > 0 && (
          <div className="space-y-3">
            <h3
              className={cn(
                "font-semibold text-neutral-900 text-sm uppercase tracking-wider",
                geistSans.className
              )}
            >
              {t("clearances.title")}
            </h3>
            <div className="space-y-2">
              {pendingClearances.slice(0, 3).map((clearance) => (
                <div
                  key={clearance.bookingId}
                  className="flex items-center justify-between border-neutral-200 bg-neutral-50 border p-3 rounded-lg text-sm"
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="size-4 text-neutral-500" />
                    <span className={cn("text-neutral-900", geistSans.className)}>
                      {formatFromMinorUnits(clearance.amountCop, currencyCode)}
                    </span>
                  </div>
                  <span className={cn("text-neutral-600 text-xs", geistSans.className)}>
                    {t("clearances.available")}{" "}
                    {formatDistanceToNow(new Date(clearance.clearanceAt), {
                      addSuffix: true,
                      locale: locale === "es" ? es : undefined,
                    })}
                  </span>
                </div>
              ))}
              {pendingClearances.length > 3 && (
                <p className={cn("text-center text-neutral-600 text-xs", geistSans.className)}>
                  +{pendingClearances.length - 3} {t("clearances.more")}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Eligibility Status */}
        {!eligibility.isEligible && eligibility.reasons.length > 0 && (
          <div className="border-amber-200 bg-amber-50 border p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 size-5 text-amber-600" />
              <div className="flex-1">
                <p
                  className={cn("font-semibold text-amber-900 text-sm", geistSans.className)}
                >
                  {t("ineligible.title")}
                </p>
                <ul className="mt-2 space-y-1">
                  {eligibility.reasons.map((reason, index) => (
                    <li
                      key={index}
                      className={cn("text-amber-800 text-xs", geistSans.className)}
                    >
                      • {reason}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Rate Limit Status */}
        <div className="flex items-center justify-between border-neutral-200 border-t pt-4 text-sm">
          <span className={cn("text-neutral-600", geistSans.className)}>
            {t("rateLimit.label")}
          </span>
          <span className={cn("font-medium text-neutral-900", geistSans.className)}>
            {feeInfo.remainingToday} / {feeInfo.dailyLimit} {t("rateLimit.remaining")}
          </span>
        </div>

        {/* Total Balance Summary */}
        <div className="flex items-center justify-between border-neutral-200 border-t pt-4">
          <span
            className={cn(
              "font-semibold text-neutral-700 text-sm uppercase tracking-wider",
              geistSans.className
            )}
          >
            {t("total.label")}
          </span>
          <span className={cn("font-bold text-neutral-900 text-xl", geistSans.className)}>
            {formatFromMinorUnits(balance.totalCop, currencyCode)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { AlertCircleIcon, Clock01Icon, FlashIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import { geistSans } from "@/app/fonts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/core";
import { type Currency, formatFromMinorUnits } from "@/lib/utils/format";

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

type HeroBalanceSectionProps = {
  /** Callback when Get Paid button is clicked */
  onRequestPayout?: () => void;
  /** Currency code for balance display */
  currencyCode: Currency;
  /** Optional className for custom styling */
  className?: string;
};

// ========================================
// Hero Balance Section Component
// ========================================

/**
 * HeroBalanceSection - Airbnb-inspired large balance display
 *
 * Ultra-minimal design with:
 * - Large hero balance number (text-5xl)
 * - Single "Get Paid" CTA
 * - Pending balance as subtle subtitle
 * - Next clearance date
 *
 * @example
 * ```tsx
 * <HeroBalanceSection
 *   currencyCode="COP"
 *   onRequestPayout={() => setShowPayoutModal(true)}
 * />
 * ```
 */
export function HeroBalanceSection({
  onRequestPayout,
  currencyCode,
  className,
}: HeroBalanceSectionProps) {
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
    const interval = setInterval(fetchBalance, 30_000);
    return () => clearInterval(interval);
  }, [fetchBalance]);

  // ========================================
  // Loading State
  // ========================================

  if (isLoading) {
    return (
      <div
        className={cn(
          "rounded-lg border p-8",
          "border-stone-800/60 bg-gradient-to-br from-stone-900 to-stone-950",
          "dark:border-border dark:from-rausch-950 dark:via-rausch-950/80 dark:to-rausch-950/60",
          className
        )}
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-stone-800/40 dark:bg-rausch-900/40" />
            <div className="h-14 w-64 animate-pulse rounded-lg bg-stone-800/30 dark:bg-rausch-900/30" />
            <div className="h-4 w-48 animate-pulse rounded bg-stone-800/40 dark:bg-rausch-900/40" />
          </div>
          <div className="h-12 w-36 animate-pulse rounded-lg bg-stone-800/40 dark:bg-rausch-900/40" />
        </div>
      </div>
    );
  }

  // ========================================
  // Error State
  // ========================================

  if (error || !data) {
    return (
      <div
        className={cn(
          "rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-900/20",
          className
        )}
      >
        <div className="flex items-center gap-4">
          <HugeiconsIcon className="size-5 text-red-600" icon={AlertCircleIcon} />
          <div>
            <p
              className={cn(
                "font-semibold text-red-900 text-sm dark:text-red-200",
                geistSans.className
              )}
            >
              {t("error.title")}
            </p>
            <p className={cn("text-red-700 text-sm dark:text-red-300", geistSans.className)}>
              {error || t("error.unknown")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { balance, eligibility, pendingClearances } = data;

  // Find the next clearance date
  const nextClearance = pendingClearances[0];
  const nextClearanceDate = nextClearance
    ? formatDistanceToNow(new Date(nextClearance.clearanceAt), {
        addSuffix: true,
        locale: locale === "es" ? es : undefined,
      })
    : null;

  return (
    <div
      className={cn(
        "rounded-lg border p-8",
        "border-stone-800/60 bg-gradient-to-br from-stone-900 to-stone-950",
        "dark:border-border dark:from-rausch-950 dark:via-rausch-950/80 dark:to-rausch-950/60",
        className
      )}
      data-testid="hero-balance-section"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        {/* Balance Display */}
        <div className="space-y-1">
          <p
            className={cn(
              "font-medium text-sm tracking-wide",
              "text-stone-400 dark:text-rausch-300",
              geistSans.className
            )}
          >
            {t("title")}
          </p>
          <p
            className={cn(
              "font-bold text-5xl tracking-tight",
              "text-stone-100 dark:text-rausch-50",
              geistSans.className
            )}
            data-testid="hero-balance-amount"
          >
            {formatFromMinorUnits(balance.availableCop, currencyCode)}
          </p>

          {/* Pending Balance Subtitle */}
          {balance.pendingCop > 0 && (
            <div className="flex items-center gap-2 pt-1">
              <HugeiconsIcon
                className="size-4 text-stone-400 dark:text-rausch-300"
                icon={Clock01Icon}
              />
              <p className={cn("text-sm text-stone-400 dark:text-rausch-300", geistSans.className)}>
                {formatFromMinorUnits(balance.pendingCop, currencyCode)}{" "}
                {t("pending.label").toLowerCase()}
                {nextClearanceDate && (
                  <span className="text-stone-500 dark:text-rausch-400">
                    {" "}
                    · Clears {nextClearanceDate}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Get Paid CTA - 44px+ touch target */}
        <div className="flex flex-col items-start gap-3 md:items-end">
          <Button
            className="min-h-[44px] gap-2 px-8"
            data-testid="hero-get-paid-button"
            disabled={!eligibility.isEligible}
            onClick={onRequestPayout}
            size="lg"
            variant="default"
          >
            <HugeiconsIcon className="size-5" icon={FlashIcon} />
            {t("actions.instantPayout")}
          </Button>

          {/* Eligibility Warning */}
          {!eligibility.isEligible && eligibility.reasons.length > 0 && (
            <p className={cn("text-amber-500 text-xs dark:text-amber-400", geistSans.className)}>
              {eligibility.reasons[0]}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

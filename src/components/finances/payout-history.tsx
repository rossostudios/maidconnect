"use client";

import {
  ArrowUpRight01Icon,
  Calendar02Icon,
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  FilterIcon,
  FlashIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { format, parseISO } from "date-fns";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { geistSans } from "@/app/fonts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trackPayoutHistoryFiltered } from "@/lib/analytics/professional-events";
import { cn } from "@/lib/utils/core";
import { type Currency, formatFromMinorUnits } from "@/lib/utils/format";

// ========================================
// Types
// ========================================

type PayoutTransfer = {
  id: string;
  professional_id: string;
  amount_cop: number;
  payout_type: "instant" | "batch";
  fee_amount_cop: number | null;
  fee_percentage: number | null;
  requested_at: string;
  processed_at: string | null;
  status: "processing" | "pending" | "completed" | "failed";
  stripe_payout_id: string | null;
  error_message: string | null;
  created_at: string;
};

type PayoutHistoryProps = {
  /**
   * Array of payout transfer records
   */
  transfers: PayoutTransfer[];
  /**
   * Whether the component is in a loading state
   */
  isLoading?: boolean;
  /**
   * Custom class name for styling
   */
  className?: string;
  /**
   * Professional ID for analytics tracking
   */
  professionalId?: string;
  /**
   * Currency code for formatting (COP, PYG, UYU, ARS)
   */
  currencyCode: Currency;
  /**
   * Variant for different contexts:
   * - "default": Card wrapper with border (standalone on page)
   * - "sheet": No card wrapper (used inside Sheet component)
   */
  variant?: "default" | "sheet";
};

type PayoutFilter = "all" | "instant" | "batch";
type StatusFilter = "all" | "completed" | "pending" | "processing" | "failed";

// ========================================
// Payout History Component
// ========================================

/**
 * PayoutHistory - Displays payout transaction history with filters
 *
 * Features:
 * - Filter by payout type (instant vs. batch)
 * - Filter by status
 * - Display fee information for instant payouts
 * - Status badges with color coding
 * - Responsive table layout
 * - Empty state when no transactions
 *
 * @example
 * ```tsx
 * <PayoutHistory
 *   transfers={payoutTransfers}
 *   isLoading={false}
 * />
 * ```
 */
export function PayoutHistory({
  transfers,
  isLoading = false,
  className,
  professionalId,
  currencyCode,
  variant = "default",
}: PayoutHistoryProps) {
  const isSheet = variant === "sheet";
  const t = useTranslations("dashboard.pro.payoutHistory");
  const locale = useLocale();

  const [payoutFilter, setPayoutFilter] = useState<PayoutFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // ========================================
  // Filtered Data
  // ========================================

  const filteredTransfers = useMemo(() => {
    const filtered = transfers.filter((transfer) => {
      const matchesPayoutType = payoutFilter === "all" || transfer.payout_type === payoutFilter;
      const matchesStatus = statusFilter === "all" || transfer.status === statusFilter;
      return matchesPayoutType && matchesStatus;
    });

    // Track analytics when filters are applied
    if ((payoutFilter !== "all" || statusFilter !== "all") && professionalId) {
      trackPayoutHistoryFiltered({
        professionalId,
        payoutTypeFilter: payoutFilter,
        statusFilter,
        resultCount: filtered.length,
      });
    }

    return filtered;
  }, [transfers, payoutFilter, statusFilter, professionalId]);

  // ========================================
  // Stats
  // ========================================

  const stats = useMemo(() => {
    const instantCount = transfers.filter((t) => t.payout_type === "instant").length;
    const batchCount = transfers.filter((t) => t.payout_type === "batch").length;
    const totalFees = transfers
      .filter((t) => t.payout_type === "instant" && t.fee_amount_cop)
      .reduce((sum, t) => sum + (t.fee_amount_cop || 0), 0);
    const totalPayouts = transfers
      .filter((t) => t.status === "completed")
      .reduce((sum, t) => sum + t.amount_cop, 0);

    return {
      instantCount,
      batchCount,
      totalFees,
      totalPayouts,
    };
  }, [transfers]);

  // ========================================
  // Render
  // ========================================

  if (isLoading) {
    const loadingContent = (
      <>
        <div className={isSheet ? "pb-4" : "p-6 pb-4"}>
          <div className="h-7 w-48 animate-pulse rounded bg-neutral-200" />
        </div>
        <div className={isSheet ? "pt-0" : "p-6 pt-0"}>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div className="h-16 animate-pulse rounded bg-neutral-100" key={i} />
            ))}
          </div>
        </div>
      </>
    );

    if (isSheet) {
      return <div className={className}>{loadingContent}</div>;
    }

    return (
      <Card className={cn("border-neutral-200 bg-white shadow-sm", className)}>
        <CardHeader className="p-6 pb-4">
          <div className="h-7 w-48 animate-pulse rounded bg-neutral-200" />
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div className="h-16 animate-pulse rounded bg-neutral-100" key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // ========================================
  // Shared Content Components
  // ========================================

  const headerContent = (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Only show title in default variant (sheet has its own SheetTitle) */}
        {!isSheet && (
          <div>
            <h2 className={cn("font-semibold text-neutral-900 text-xl", geistSans.className)}>
              {t("title")}
            </h2>
            <p className={cn("mt-1 text-neutral-600 text-sm", geistSans.className)}>
              {t("description")}
            </p>
          </div>
        )}

        {/* Filters */}
        <div className={cn("flex gap-2", isSheet && "w-full")}>
          <Select onValueChange={(v) => setPayoutFilter(v as PayoutFilter)} value={payoutFilter}>
            <SelectTrigger className={cn(isSheet ? "flex-1" : "w-36")}>
              <SelectValue placeholder={t("filters.type.placeholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.type.all")}</SelectItem>
              <SelectItem value="instant">
                <span className="flex items-center gap-2">
                  <HugeiconsIcon className="size-4" icon={FlashIcon} />
                  {t("filters.type.instant")}
                </span>
              </SelectItem>
              <SelectItem value="batch">
                <span className="flex items-center gap-2">
                  <HugeiconsIcon className="size-4" icon={Calendar02Icon} />
                  {t("filters.type.batch")}
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={(v) => setStatusFilter(v as StatusFilter)} value={statusFilter}>
            <SelectTrigger className={cn(isSheet ? "flex-1" : "w-36")}>
              <SelectValue placeholder={t("filters.status.placeholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.status.all")}</SelectItem>
              <SelectItem value="completed">{t("filters.status.completed")}</SelectItem>
              <SelectItem value="pending">{t("filters.status.pending")}</SelectItem>
              <SelectItem value="processing">{t("filters.status.processing")}</SelectItem>
              <SelectItem value="failed">{t("filters.status.failed")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Summary - 2 cols on mobile, 4 cols on desktop */}
      {transfers.length > 0 && (
        <div className={cn("mt-4 grid gap-4", isSheet ? "grid-cols-2" : "sm:grid-cols-4")}>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <div className={cn("text-neutral-600 text-xs", geistSans.className)}>
              {t("stats.totalPayouts")}
            </div>
            <div className={cn("mt-1 font-semibold text-neutral-900", geistSans.className)}>
              {formatFromMinorUnits(stats.totalPayouts, currencyCode)}
            </div>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <div className={cn("text-neutral-600 text-xs", geistSans.className)}>
              {t("stats.instantPayouts")}
            </div>
            <div className={cn("mt-1 font-semibold text-neutral-900", geistSans.className)}>
              {stats.instantCount}
            </div>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <div className={cn("text-neutral-600 text-xs", geistSans.className)}>
              {t("stats.batchPayouts")}
            </div>
            <div className={cn("mt-1 font-semibold text-neutral-900", geistSans.className)}>
              {stats.batchCount}
            </div>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <div className={cn("text-neutral-600 text-xs", geistSans.className)}>
              {t("stats.totalFees")}
            </div>
            <div className={cn("mt-1 font-semibold text-neutral-900", geistSans.className)}>
              {formatFromMinorUnits(stats.totalFees, currencyCode)}
            </div>
          </div>
        </div>
      )}
    </>
  );

  const bodyContent = (
    <>
      {/* Empty State */}
      {filteredTransfers.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-neutral-100">
            <HugeiconsIcon className="size-6 text-neutral-400" icon={FilterIcon} />
          </div>
          <div>
            <p className={cn("font-medium text-neutral-900", geistSans.className)}>
              {t("empty.title")}
            </p>
            <p className={cn("mt-1 text-neutral-600 text-sm", geistSans.className)}>
              {t("empty.description")}
            </p>
          </div>
          {(payoutFilter !== "all" || statusFilter !== "all") && (
            <Button
              className="mt-2"
              onClick={() => {
                setPayoutFilter("all");
                setStatusFilter("all");
              }}
              size="sm"
              variant="outline"
            >
              {t("empty.clearFilters")}
            </Button>
          )}
        </div>
      )}

      {/* Transactions List */}
      {filteredTransfers.length > 0 && (
        <div className="space-y-3">
          {filteredTransfers.map((transfer) => (
            <TransferRow
              currencyCode={currencyCode}
              key={transfer.id}
              locale={locale}
              t={t}
              transfer={transfer}
            />
          ))}
        </div>
      )}
    </>
  );

  // ========================================
  // Render based on variant
  // ========================================

  // Sheet variant: no card wrapper, sheet provides container
  if (isSheet) {
    return (
      <div className={className}>
        <div className="pb-4">{headerContent}</div>
        <div className="pt-2">{bodyContent}</div>
      </div>
    );
  }

  // Default variant: with Card wrapper
  return (
    <Card className={cn("border-neutral-200 bg-white shadow-sm", className)}>
      <CardHeader className="p-6 pb-4">{headerContent}</CardHeader>
      <CardContent className="p-6 pt-0">{bodyContent}</CardContent>
    </Card>
  );
}

// ========================================
// Transfer Row Component
// ========================================

function TransferRow({
  transfer,
  locale,
  t,
  currencyCode,
}: {
  transfer: PayoutTransfer;
  locale: string;
  t: any;
  currencyCode: Currency;
}) {
  const statusConfig = {
    completed: {
      icon: CheckmarkCircle02Icon,
      color: "text-green-700",
      bg: "bg-green-50",
      border: "border-green-200",
      label: t("status.completed"),
    },
    pending: {
      icon: Clock01Icon,
      color: "text-babu-700",
      bg: "bg-babu-50",
      border: "border-babu-200",
      label: t("status.pending"),
    },
    processing: {
      icon: Clock01Icon,
      color: "text-rausch-700",
      bg: "bg-rausch-50",
      border: "border-rausch-200",
      label: t("status.processing"),
    },
    failed: {
      icon: CancelCircleIcon,
      color: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-200",
      label: t("status.failed"),
    },
  };

  const config = statusConfig[transfer.status];
  const isInstant = transfer.payout_type === "instant";

  return (
    <div
      className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 transition-colors hover:bg-neutral-100"
      data-testid="payout-entry"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {/* Payout Type Badge */}
            {isInstant ? (
              <Badge className="gap-1" variant="default">
                <HugeiconsIcon className="size-3" icon={FlashIcon} />
                {t("type.instant")}
              </Badge>
            ) : (
              <Badge className="gap-1" variant="secondary">
                <HugeiconsIcon className="size-3" icon={Calendar02Icon} />
                {t("type.batch")}
              </Badge>
            )}

            {/* Status Badge */}
            <Badge
              className={cn("gap-1", config.bg, config.border, config.color)}
              variant="outline"
            >
              <HugeiconsIcon className="size-3" icon={config.icon} />
              {config.label}
            </Badge>
          </div>

          {/* Amount and Fee */}
          <div className="mt-2">
            <p className={cn("font-semibold text-lg text-neutral-900", geistSans.className)}>
              {formatFromMinorUnits(transfer.amount_cop, currencyCode)}
            </p>
            {isInstant && transfer.fee_amount_cop && (
              <p className={cn("mt-0.5 text-neutral-600 text-sm", geistSans.className)}>
                {t("fee")}: -{formatFromMinorUnits(transfer.fee_amount_cop, currencyCode)} (
                {transfer.fee_percentage}%)
              </p>
            )}
          </div>

          {/* Date */}
          <p className={cn("mt-2 text-neutral-500 text-sm", geistSans.className)}>
            {t("requestedAt")}:{" "}
            {format(parseISO(transfer.requested_at), "MMM dd, yyyy 'at' h:mm a")}
          </p>

          {transfer.processed_at && (
            <p className={cn("mt-1 text-neutral-500 text-sm", geistSans.className)}>
              {t("processedAt")}:{" "}
              {format(parseISO(transfer.processed_at), "MMM dd, yyyy 'at' h:mm a")}
            </p>
          )}

          {/* Error Message */}
          {transfer.error_message && (
            <p className={cn("mt-2 text-red-600 text-sm", geistSans.className)}>
              {transfer.error_message}
            </p>
          )}
        </div>

        {/* External Link Icon */}
        {transfer.stripe_payout_id && (
          <div className="flex-shrink-0">
            <HugeiconsIcon className="size-5 text-neutral-400" icon={ArrowUpRight01Icon} />
          </div>
        )}
      </div>
    </div>
  );
}

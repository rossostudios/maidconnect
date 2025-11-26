"use client";

/**
 * EnhancedAddonCard - Service Add-on Card with Analytics
 *
 * Airbnb-style add-on card showing service details plus performance metrics.
 * Designed to help professionals understand which add-ons perform best.
 *
 * Features:
 * - Price and duration display
 * - Booking count
 * - Total revenue generated
 * - Last booked date
 * - Active/inactive toggle
 * - Edit and delete actions
 *
 * Following Lia Design System:
 * - rounded-lg containers
 * - rausch-500 primary accent
 * - neutral color palette
 */

import {
  Calendar03Icon,
  Clock01Icon,
  Delete02Icon,
  Edit02Icon,
  MoneyBag01Icon,
  MoreHorizontalIcon,
  ShoppingBasket01Icon,
  ToggleOffIcon,
  ToggleOnIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { formatDistanceToNow } from "date-fns";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { geistSans } from "@/app/fonts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils/core";
import type { Currency } from "@/lib/utils/format";
import { formatFromMinorUnits } from "@/lib/utils/format";

// ============================================================================
// Types
// ============================================================================

export type AddonAnalyticsData = {
  /** Total number of bookings for this add-on */
  bookingCount: number;
  /** Total revenue in cents */
  totalRevenueCents: number;
  /** Last time this add-on was booked */
  lastBookedAt?: string;
};

export type EnhancedAddonCardProps = {
  /** Add-on details */
  addon: {
    id: string;
    name: string;
    description?: string;
    priceCents: number;
    durationMinutes: number;
    isActive: boolean;
    createdAt: string;
  };
  /** Analytics data for this add-on */
  analytics?: AddonAnalyticsData;
  /** Currency for display */
  currency: Currency;
  /** Whether action is in progress */
  isLoading?: boolean;
  /** Called when edit is clicked */
  onEdit?: () => void;
  /** Called when toggle active is clicked */
  onToggleActive?: () => void;
  /** Called when delete is clicked */
  onDelete?: () => void;
  /** Additional CSS classes */
  className?: string;
};

// ============================================================================
// Main Component
// ============================================================================

export function EnhancedAddonCard({
  addon,
  analytics,
  currency,
  isLoading = false,
  onEdit,
  onToggleActive,
  onDelete,
  className,
}: EnhancedAddonCardProps) {
  const t = useTranslations("dashboard.pro.serviceAddons");
  const [showAnalytics, setShowAnalytics] = useState(true);

  const durationFormatted =
    addon.durationMinutes > 0
      ? addon.durationMinutes === 60
        ? "1 hour"
        : `${addon.durationMinutes} min`
      : "No extra time";

  return (
    <div
      className={cn(
        "rounded-lg border bg-white transition-all",
        addon.isActive ? "border-neutral-200 shadow-sm" : "border-neutral-200 opacity-70",
        className
      )}
    >
      {/* Main Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Left: Details */}
          <div className="flex-1">
            {/* Header with Name and Status */}
            <div className="flex items-center gap-2">
              <h4 className={cn("font-semibold text-neutral-900", geistSans.className)}>
                {addon.name}
              </h4>
              {!addon.isActive && (
                <Badge className="bg-neutral-100 text-neutral-500" variant="secondary">
                  {t("inactive")}
                </Badge>
              )}
            </div>

            {/* Description */}
            {addon.description && (
              <p className="mt-1 line-clamp-2 text-neutral-500 text-sm">{addon.description}</p>
            )}

            {/* Price and Duration */}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className={cn("font-semibold text-neutral-900", geistSans.className)}>
                {formatFromMinorUnits(addon.priceCents, currency)}
              </span>
              <span className="flex items-center gap-1 text-neutral-500 text-sm">
                <HugeiconsIcon className="h-3.5 w-3.5" icon={Clock01Icon} />
                {durationFormatted}
              </span>
            </div>
          </div>

          {/* Right: Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-8 w-8" isDisabled={isLoading} size="icon" variant="ghost">
                <HugeiconsIcon className="h-4 w-4" icon={MoreHorizontalIcon} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={onEdit}>
                <HugeiconsIcon className="mr-2 h-4 w-4" icon={Edit02Icon} />
                {t("actions.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onToggleActive}>
                <HugeiconsIcon
                  className="mr-2 h-4 w-4"
                  icon={addon.isActive ? ToggleOffIcon : ToggleOnIcon}
                />
                {addon.isActive ? t("actions.deactivate") : t("actions.activate")}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600 focus:text-red-600" onSelect={onDelete}>
                <HugeiconsIcon className="mr-2 h-4 w-4" icon={Delete02Icon} />
                {t("actions.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Analytics Section */}
      {showAnalytics && analytics && (
        <div className="border-neutral-100 border-t bg-neutral-50 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              className="flex items-center gap-1 text-neutral-500 text-xs hover:text-neutral-700"
              onClick={() => setShowAnalytics(false)}
              type="button"
            >
              <span>Performance</span>
            </button>
            <div className="flex items-center gap-4 text-xs">
              {/* Bookings */}
              <div className="flex items-center gap-1.5">
                <HugeiconsIcon
                  className="h-3.5 w-3.5 text-neutral-400"
                  icon={ShoppingBasket01Icon}
                />
                <span className="text-neutral-500">
                  {analytics.bookingCount} {analytics.bookingCount === 1 ? "booking" : "bookings"}
                </span>
              </div>

              {/* Revenue */}
              <div className="flex items-center gap-1.5">
                <HugeiconsIcon className="h-3.5 w-3.5 text-neutral-400" icon={MoneyBag01Icon} />
                <span className={cn("font-medium text-neutral-700", geistSans.className)}>
                  {formatFromMinorUnits(analytics.totalRevenueCents, currency)}
                </span>
              </div>

              {/* Last Booked */}
              {analytics.lastBookedAt && (
                <div className="flex items-center gap-1.5">
                  <HugeiconsIcon className="h-3.5 w-3.5 text-neutral-400" icon={Calendar03Icon} />
                  <span className="text-neutral-500">
                    {formatDistanceToNow(new Date(analytics.lastBookedAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Collapsed Analytics Toggle */}
      {!showAnalytics && analytics && (
        <button
          className="flex w-full items-center justify-center gap-1 border-neutral-100 border-t bg-neutral-50 px-4 py-2 text-neutral-500 text-xs hover:bg-neutral-100"
          onClick={() => setShowAnalytics(true)}
          type="button"
        >
          Show performance
        </button>
      )}
    </div>
  );
}

// ============================================================================
// Compact Addon Pill (for inline display)
// ============================================================================

export type AddonPillProps = {
  name: string;
  priceCents: number;
  currency: Currency;
  isActive?: boolean;
  className?: string;
};

export function AddonPill({
  name,
  priceCents,
  currency,
  isActive = true,
  className,
}: AddonPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm",
        isActive
          ? "border-rausch-200 bg-rausch-50 text-rausch-700"
          : "border-neutral-200 bg-neutral-50 text-neutral-500",
        className
      )}
    >
      <span className={cn("font-medium", geistSans.className)}>{name}</span>
      <span className="text-xs opacity-75">{formatFromMinorUnits(priceCents, currency)}</span>
    </span>
  );
}

// ============================================================================
// Addon Card Skeleton
// ============================================================================

export function AddonCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-lg border border-neutral-200 bg-white p-4", className)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-5 w-32 rounded bg-neutral-200" />
          <div className="h-4 w-48 rounded bg-neutral-100" />
          <div className="flex gap-3">
            <div className="h-4 w-16 rounded bg-neutral-200" />
            <div className="h-4 w-20 rounded bg-neutral-100" />
          </div>
        </div>
        <div className="h-8 w-8 rounded bg-neutral-100" />
      </div>
      <div className="mt-4 border-neutral-100 border-t pt-3">
        <div className="flex gap-4">
          <div className="h-3 w-16 rounded bg-neutral-100" />
          <div className="h-3 w-20 rounded bg-neutral-100" />
          <div className="h-3 w-24 rounded bg-neutral-100" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Addon Summary Card (for dashboard overview)
// ============================================================================

export type AddonSummaryCardProps = {
  totalAddons: number;
  activeAddons: number;
  totalRevenueCents: number;
  currency: Currency;
  onClick?: () => void;
  className?: string;
};

export function AddonSummaryCard({
  totalAddons,
  activeAddons,
  totalRevenueCents,
  currency,
  onClick,
  className,
}: AddonSummaryCardProps) {
  return (
    <button
      className={cn(
        "flex w-full items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 text-left transition-all",
        "hover:border-rausch-200 hover:shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500 focus-visible:ring-offset-2",
        className
      )}
      onClick={onClick}
      type="button"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rausch-50">
          <HugeiconsIcon className="h-5 w-5 text-rausch-500" icon={ShoppingBasket01Icon} />
        </div>
        <div>
          <p className={cn("font-semibold text-neutral-900", geistSans.className)}>
            Service Add-ons
          </p>
          <p className="text-neutral-500 text-sm">
            {activeAddons} of {totalAddons} active
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={cn("font-semibold text-green-600", geistSans.className)}>
          {formatFromMinorUnits(totalRevenueCents, currency)}
        </p>
        <p className="text-neutral-500 text-xs">Total revenue</p>
      </div>
    </button>
  );
}

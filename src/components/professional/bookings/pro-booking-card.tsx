"use client";

/**
 * ProBookingCard - Professional Booking Card Component
 *
 * Airbnb-style booking card designed for professionals with:
 * - Customer avatar and info (customer-centric view)
 * - Status-based primary action (Accept, Check In, Check Out)
 * - Urgency indicators (urgent, important, normal)
 * - Time labels ("Starting in 15m", "Past Due", etc.)
 * - Service details and pricing
 *
 * Following Lia Design System:
 * - rounded-lg containers
 * - rausch-500 primary actions
 * - neutral color palette
 */

import {
  Calendar03Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Location01Icon,
  Message01Icon,
  MoreHorizontalIcon,
  SmartPhone01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import { geistSans } from "@/app/fonts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProBookingWithCustomer } from "@/hooks/use-pro-bookings";
import { cn } from "@/lib/utils/core";
import { formatFromMinorUnits } from "@/lib/utils/format";

// ============================================================================
// Types
// ============================================================================

export type UrgencyLevel = "urgent" | "important" | "normal";

type ProBookingCardProps = {
  /** Booking data */
  booking: ProBookingWithCustomer;
  /** Urgency level for visual treatment */
  urgency?: UrgencyLevel;
  /** Loading state for action in progress */
  isLoading?: boolean;
  /** Accept booking (pending only) */
  onAccept?: (bookingId: string) => void;
  /** Decline booking (pending only) */
  onDecline?: (bookingId: string) => void;
  /** Check in to start service (confirmed only) */
  onCheckIn?: (bookingId: string) => void;
  /** Check out to complete service (in_progress only) */
  onCheckOut?: (bookingId: string) => void;
  /** Open message thread with customer */
  onMessage?: (bookingId: string) => void;
  /** View full booking details */
  onViewDetails?: (bookingId: string) => void;
  /** Cancel booking */
  onCancel?: (bookingId: string) => void;
  /** Additional CSS classes */
  className?: string;
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get time label for booking (e.g., "Starting in 15m", "Past Due")
 */
function getTimeLabel(booking: ProBookingWithCustomer): string | null {
  if (booking.status === "in_progress") {
    return "In Progress";
  }

  if (booking.status === "completed") {
    return "Completed";
  }

  if (booking.status === "cancelled") {
    return "Cancelled";
  }

  if (booking.status === "pending" || booking.status === "confirmed") {
    const date = new Date(booking.scheduledStart);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();

    if (diffMs < 0) {
      return "Past Due";
    }

    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 60) {
      return `Starting in ${diffMinutes}m`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `Starting in ${diffHours}h`;
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) {
      return "Tomorrow";
    }

    return null;
  }

  return null;
}

/**
 * Format date for display
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

/**
 * Format time for display
 */
function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Get initials from name
 */
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Get urgency color classes
 */
function getUrgencyStyles(urgency: UrgencyLevel): {
  border: string;
  indicator: string;
  badge: string;
} {
  switch (urgency) {
    case "urgent":
      return {
        border: "border-l-4 border-l-red-500",
        indicator: "bg-red-500",
        badge: "border-red-200 bg-red-50 text-red-700",
      };
    case "important":
      return {
        border: "border-l-4 border-l-rausch-500",
        indicator: "bg-rausch-500",
        badge: "border-rausch-200 bg-rausch-50 text-rausch-700",
      };
    default:
      return {
        border: "",
        indicator: "bg-neutral-400",
        badge: "border-neutral-200 bg-neutral-50 text-neutral-600",
      };
  }
}

/**
 * Get status badge variant
 */
function getStatusVariant(
  status: string
): "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" | "outline" {
  switch (status) {
    case "pending":
      return "pending";
    case "confirmed":
      return "confirmed";
    case "in_progress":
      return "in_progress";
    case "completed":
      return "completed";
    case "cancelled":
      return "cancelled";
    default:
      return "outline";
  }
}

// ============================================================================
// Component
// ============================================================================

export function ProBookingCard({
  booking,
  urgency = "normal",
  isLoading = false,
  onAccept,
  onDecline,
  onCheckIn,
  onCheckOut,
  onMessage,
  onViewDetails,
  onCancel,
  className,
}: ProBookingCardProps) {
  const timeLabel = getTimeLabel(booking);
  const urgencyStyles = getUrgencyStyles(urgency);
  const formatPrice = (amount: number) => formatFromMinorUnits(amount, booking.currency);

  // Determine primary action based on status
  const renderPrimaryAction = () => {
    switch (booking.status) {
      case "pending":
        return (
          <div className="flex gap-2">
            <Button
              className="flex-1"
              isDisabled={isLoading || !onAccept}
              onPress={() => onAccept?.(booking.id)}
              size="sm"
              variant="default"
            >
              <HugeiconsIcon className="mr-1.5 h-4 w-4" icon={CheckmarkCircle02Icon} />
              Accept
            </Button>
            <Button
              className="border-red-200 text-red-600 hover:bg-red-50"
              isDisabled={isLoading || !onDecline}
              onPress={() => onDecline?.(booking.id)}
              size="sm"
              variant="outline"
            >
              <HugeiconsIcon className="mr-1.5 h-4 w-4" icon={Cancel01Icon} />
              Decline
            </Button>
          </div>
        );
      case "confirmed":
        return (
          <Button
            className="w-full"
            isDisabled={isLoading || !onCheckIn}
            onPress={() => onCheckIn?.(booking.id)}
            size="sm"
            variant="default"
          >
            <HugeiconsIcon className="mr-1.5 h-4 w-4" icon={Clock01Icon} />
            Check In
          </Button>
        );
      case "in_progress":
        return (
          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            isDisabled={isLoading || !onCheckOut}
            onPress={() => onCheckOut?.(booking.id)}
            size="sm"
            variant="default"
          >
            <HugeiconsIcon className="mr-1.5 h-4 w-4" icon={CheckmarkCircle02Icon} />
            Check Out
          </Button>
        );
      case "completed":
        return (
          <Button
            className="w-full"
            isDisabled={!onViewDetails}
            onPress={() => onViewDetails?.(booking.id)}
            size="sm"
            variant="outline"
          >
            View Details
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group rounded-lg border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-md",
        urgencyStyles.border,
        className
      )}
      exit={{ opacity: 0, y: -8 }}
      initial={{ opacity: 0, y: 8 }}
    >
      {/* Card Content */}
      <div className="p-4">
        {/* Header: Customer + Time Label */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {booking.customer?.avatarUrl && (
                <AvatarImage alt={booking.customer.fullName} src={booking.customer.avatarUrl} />
              )}
              <AvatarFallback>
                {booking.customer ? getInitials(booking.customer.fullName) : "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className={cn("font-semibold text-neutral-900", geistSans.className)}>
                {booking.customer?.fullName || "Unknown Customer"}
              </h3>
              <p className="text-neutral-500 text-sm">{booking.serviceName || "Service"}</p>
            </div>
          </div>

          {/* Time Label Badge */}
          {timeLabel && (
            <Badge
              className={cn(
                urgency === "urgent" && "border-red-200 bg-red-50 text-red-700",
                urgency === "important" && "border-rausch-200 bg-rausch-50 text-rausch-700"
              )}
              size="sm"
              variant="outline"
            >
              {timeLabel}
            </Badge>
          )}
        </div>

        {/* Details Row */}
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-neutral-600 text-sm">
          {/* Date & Time */}
          <div className="flex items-center gap-1.5">
            <HugeiconsIcon className="h-3.5 w-3.5 text-neutral-400" icon={Calendar03Icon} />
            <span>{formatDate(booking.scheduledStart)}</span>
            <span className="text-neutral-300">•</span>
            <span>{formatTime(booking.scheduledStart)}</span>
          </div>

          {/* Duration */}
          {booking.durationMinutes && (
            <div className="flex items-center gap-1.5">
              <HugeiconsIcon className="h-3.5 w-3.5 text-neutral-400" icon={Clock01Icon} />
              <span>{booking.durationMinutes}min</span>
            </div>
          )}
        </div>

        {/* Location */}
        {booking.address && (
          <div className="mb-3 flex items-start gap-1.5 text-neutral-600 text-sm">
            <HugeiconsIcon
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400"
              icon={Location01Icon}
            />
            <span className="line-clamp-1">{booking.address}</span>
          </div>
        )}

        {/* Special Instructions Preview */}
        {booking.specialInstructions && (
          <div className="mb-3 rounded-lg bg-neutral-50 p-2.5">
            <p className="line-clamp-2 text-neutral-600 text-xs">
              <span className="font-medium text-neutral-700">Note:</span>{" "}
              {booking.specialInstructions}
            </p>
          </div>
        )}

        {/* Price + Status Row */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge size="sm" variant={getStatusVariant(booking.status)}>
              {booking.status.replace("_", " ")}
            </Badge>
          </div>
          <span className={cn("font-bold text-lg text-neutral-900", geistSans.className)}>
            {formatPrice(booking.amount)}
          </span>
        </div>

        {/* Primary Action */}
        {renderPrimaryAction()}
      </div>

      {/* Footer: Secondary Actions */}
      <div className="flex items-center justify-between border-neutral-100 border-t px-4 py-2">
        <div className="flex items-center gap-1">
          {/* Message Button */}
          {onMessage && booking.customer && (
            <button
              aria-label="Message customer"
              className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500"
              onClick={() => onMessage(booking.id)}
              type="button"
            >
              <HugeiconsIcon className="h-4 w-4" icon={Message01Icon} />
            </button>
          )}

          {/* Call Button (if phone available) */}
          {booking.customer?.phone && (
            <a
              aria-label="Call customer"
              className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500"
              href={`tel:${booking.customer.phone}`}
            >
              <HugeiconsIcon className="h-4 w-4" icon={SmartPhone01Icon} />
            </a>
          )}
        </div>

        {/* More Options */}
        <div className="flex items-center gap-1">
          {onViewDetails && booking.status !== "completed" && (
            <button
              className="rounded-lg px-2.5 py-1.5 text-neutral-500 text-xs transition-colors hover:bg-neutral-100 hover:text-neutral-700"
              onClick={() => onViewDetails(booking.id)}
              type="button"
            >
              Details
            </button>
          )}
          {onCancel && (booking.status === "pending" || booking.status === "confirmed") && (
            <button
              aria-label="More options"
              className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-red-600"
              onClick={() => onCancel(booking.id)}
              type="button"
            >
              <HugeiconsIcon className="h-4 w-4" icon={MoreHorizontalIcon} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Compact Variant (for list views)
// ============================================================================

type ProBookingCardCompactProps = Omit<ProBookingCardProps, "onCancel"> & {
  /** Show condensed layout */
  compact?: boolean;
};

export function ProBookingCardCompact({
  booking,
  urgency = "normal",
  isLoading = false,
  onAccept,
  onDecline,
  onCheckIn,
  onCheckOut,
  onMessage,
  onViewDetails,
  className,
}: ProBookingCardCompactProps) {
  const timeLabel = getTimeLabel(booking);
  const urgencyStyles = getUrgencyStyles(urgency);
  const formatPrice = (amount: number) => formatFromMinorUnits(amount, booking.currency);

  const renderQuickAction = () => {
    switch (booking.status) {
      case "pending":
        return (
          <div className="flex gap-1.5">
            <Button
              className="h-8 px-3 text-xs"
              isDisabled={isLoading || !onAccept}
              onPress={() => onAccept?.(booking.id)}
              size="sm"
              variant="default"
            >
              Accept
            </Button>
            <Button
              className="h-8 border-red-200 px-3 text-red-600 text-xs hover:bg-red-50"
              isDisabled={isLoading || !onDecline}
              onPress={() => onDecline?.(booking.id)}
              size="sm"
              variant="outline"
            >
              Decline
            </Button>
          </div>
        );
      case "confirmed":
        return (
          <Button
            className="h-8 px-3 text-xs"
            isDisabled={isLoading || !onCheckIn}
            onPress={() => onCheckIn?.(booking.id)}
            size="sm"
            variant="default"
          >
            Check In
          </Button>
        );
      case "in_progress":
        return (
          <Button
            className="h-8 bg-green-600 px-3 text-xs hover:bg-green-700"
            isDisabled={isLoading || !onCheckOut}
            onPress={() => onCheckOut?.(booking.id)}
            size="sm"
            variant="default"
          >
            Check Out
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-lg border border-neutral-200 bg-white px-4 py-3 transition-colors hover:bg-neutral-50",
        urgencyStyles.border,
        className
      )}
    >
      {/* Avatar */}
      <Avatar className="h-9 w-9 shrink-0">
        {booking.customer?.avatarUrl && (
          <AvatarImage alt={booking.customer.fullName} src={booking.customer.avatarUrl} />
        )}
        <AvatarFallback className="text-xs">
          {booking.customer ? getInitials(booking.customer.fullName) : "?"}
        </AvatarFallback>
      </Avatar>

      {/* Main Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn("truncate font-medium text-neutral-900 text-sm", geistSans.className)}
          >
            {booking.customer?.fullName || "Unknown"}
          </span>
          {timeLabel && (
            <Badge
              className={cn("shrink-0 text-xs", urgencyStyles.badge)}
              size="sm"
              variant="outline"
            >
              {timeLabel}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-neutral-500 text-xs">
          <span>{booking.serviceName || "Service"}</span>
          <span>•</span>
          <span>{formatTime(booking.scheduledStart)}</span>
        </div>
      </div>

      {/* Price */}
      <span className={cn("shrink-0 font-semibold text-neutral-900 text-sm", geistSans.className)}>
        {formatPrice(booking.amount)}
      </span>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        {onMessage && booking.customer && (
          <button
            aria-label="Message customer"
            className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
            onClick={() => onMessage(booking.id)}
            type="button"
          >
            <HugeiconsIcon className="h-4 w-4" icon={Message01Icon} />
          </button>
        )}
        {renderQuickAction()}
        {onViewDetails && (
          <button
            className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
            onClick={() => onViewDetails(booking.id)}
            type="button"
          >
            <HugeiconsIcon className="h-4 w-4" icon={MoreHorizontalIcon} />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Skeleton Loaders
// ============================================================================

export function ProBookingCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-neutral-200 bg-white p-4">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-neutral-200" />
          <div>
            <div className="mb-1 h-4 w-24 rounded bg-neutral-200" />
            <div className="h-3 w-16 rounded bg-neutral-100" />
          </div>
        </div>
        <div className="h-5 w-16 rounded-full bg-neutral-100" />
      </div>
      <div className="mb-3 flex gap-4">
        <div className="h-3 w-20 rounded bg-neutral-100" />
        <div className="h-3 w-12 rounded bg-neutral-100" />
      </div>
      <div className="mb-4 flex items-center justify-between">
        <div className="h-5 w-16 rounded-full bg-neutral-100" />
        <div className="h-6 w-20 rounded bg-neutral-200" />
      </div>
      <div className="h-9 w-full rounded-lg bg-neutral-100" />
    </div>
  );
}

export function ProBookingCardCompactSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-4 rounded-lg border border-neutral-200 bg-white px-4 py-3">
      <div className="h-9 w-9 shrink-0 rounded-full bg-neutral-200" />
      <div className="flex-1">
        <div className="mb-1 h-4 w-24 rounded bg-neutral-200" />
        <div className="h-3 w-32 rounded bg-neutral-100" />
      </div>
      <div className="h-4 w-16 rounded bg-neutral-200" />
      <div className="h-8 w-20 rounded-lg bg-neutral-100" />
    </div>
  );
}

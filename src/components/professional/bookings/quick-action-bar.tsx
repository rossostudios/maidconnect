"use client";

/**
 * QuickActionBar - Floating Action Bar for Professional Bookings
 *
 * Airbnb-style sticky action bar showing urgent items that need attention.
 * Appears at the bottom of the screen on mobile, at the top on desktop.
 *
 * Key Features:
 * - Animated entry/exit
 * - Badge counts for pending items
 * - Direct navigation to relevant sections
 * - Auto-hides when no urgent items
 *
 * Following Lia Design System:
 * - rounded-lg containers
 * - rausch-500 primary actions
 * - neutral color palette
 */

import {
  ArrowRight01Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Message01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo } from "react";
import { geistSans } from "@/app/fonts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import type { HugeIcon } from "@/types/icons";

// ============================================================================
// Types
// ============================================================================

export type UrgentAction = {
  id: string;
  type: "pending_bookings" | "upcoming_checkins" | "unread_messages" | "pending_checkouts";
  label: string;
  count: number;
  icon: HugeIcon;
  href: string;
  urgency: "urgent" | "important" | "normal";
};

export type QuickActionBarProps = {
  /** Number of pending booking requests */
  pendingBookings?: number;
  /** Number of check-ins due within 30 minutes */
  upcomingCheckIns?: number;
  /** Number of bookings in progress needing checkout */
  pendingCheckouts?: number;
  /** Number of unread messages */
  unreadMessages?: number;
  /** Variant for positioning */
  variant?: "floating" | "sticky" | "inline";
  /** Additional CSS classes */
  className?: string;
  /** Callback when an action is clicked */
  onActionClick?: (action: UrgentAction) => void;
};

// ============================================================================
// Component
// ============================================================================

export function QuickActionBar({
  pendingBookings = 0,
  upcomingCheckIns = 0,
  pendingCheckouts = 0,
  unreadMessages = 0,
  variant = "floating",
  className,
  onActionClick,
}: QuickActionBarProps) {
  const actions = useMemo(() => {
    const items: UrgentAction[] = [];

    // Pending bookings - highest priority (need response)
    if (pendingBookings > 0) {
      items.push({
        id: "pending_bookings",
        type: "pending_bookings",
        label: `${pendingBookings} request${pendingBookings > 1 ? "s" : ""} pending`,
        count: pendingBookings,
        icon: Calendar03Icon,
        href: "/dashboard/pro/bookings?status=pending",
        urgency: "urgent",
      });
    }

    // In-progress bookings needing checkout
    if (pendingCheckouts > 0) {
      items.push({
        id: "pending_checkouts",
        type: "pending_checkouts",
        label: `${pendingCheckouts} checkout${pendingCheckouts > 1 ? "s" : ""} due`,
        count: pendingCheckouts,
        icon: CheckmarkCircle02Icon,
        href: "/dashboard/pro/bookings?status=in_progress",
        urgency: "urgent",
      });
    }

    // Upcoming check-ins (within 30 minutes)
    if (upcomingCheckIns > 0) {
      items.push({
        id: "upcoming_checkins",
        type: "upcoming_checkins",
        label: `${upcomingCheckIns} check-in${upcomingCheckIns > 1 ? "s" : ""} soon`,
        count: upcomingCheckIns,
        icon: Clock01Icon,
        href: "/dashboard/pro/bookings?date=today",
        urgency: "important",
      });
    }

    // Unread messages
    if (unreadMessages > 0) {
      items.push({
        id: "unread_messages",
        type: "unread_messages",
        label: `${unreadMessages} message${unreadMessages > 1 ? "s" : ""}`,
        count: unreadMessages,
        icon: Message01Icon,
        href: "/dashboard/pro/messages",
        urgency: unreadMessages > 3 ? "important" : "normal",
      });
    }

    // Sort by urgency
    const urgencyOrder = { urgent: 0, important: 1, normal: 2 };
    items.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

    return items;
  }, [pendingBookings, upcomingCheckIns, pendingCheckouts, unreadMessages]);

  const totalUrgent = actions.filter((a) => a.urgency === "urgent").length;
  const hasUrgentItems = actions.length > 0;

  if (!hasUrgentItems) {
    return null;
  }

  const containerClasses = cn(
    "z-50",
    variant === "floating" && "fixed right-4 bottom-4 left-4 md:right-auto md:bottom-6 md:left-4",
    variant === "sticky" && "sticky top-0 z-40",
    variant === "inline" && "relative",
    className
  );

  return (
    <AnimatePresence>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className={containerClasses}
        exit={{ opacity: 0, y: 20 }}
        initial={{ opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        <div
          className={cn(
            "overflow-hidden rounded-lg border bg-white shadow-lg",
            totalUrgent > 0 ? "border-red-200" : "border-neutral-200"
          )}
        >
          {/* Header */}
          <div
            className={cn(
              "flex items-center justify-between border-b px-4 py-3",
              totalUrgent > 0
                ? "border-red-100 bg-gradient-to-r from-red-50 to-rausch-50"
                : "border-neutral-100 bg-neutral-50"
            )}
          >
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full",
                  totalUrgent > 0 ? "bg-red-100" : "bg-neutral-100"
                )}
              >
                <HugeiconsIcon
                  className={cn(
                    "h-3.5 w-3.5",
                    totalUrgent > 0 ? "text-red-600" : "text-neutral-500"
                  )}
                  icon={Clock01Icon}
                />
              </div>
              <span
                className={cn(
                  "font-semibold text-sm",
                  totalUrgent > 0 ? "text-red-900" : "text-neutral-900",
                  geistSans.className
                )}
              >
                {totalUrgent > 0 ? "Action Required" : "Updates"}
              </span>
            </div>
            {totalUrgent > 0 && (
              <Badge className="border-red-200 bg-red-100 text-red-700" size="sm" variant="outline">
                {totalUrgent} urgent
              </Badge>
            )}
          </div>

          {/* Actions List */}
          <div className="divide-y divide-neutral-100">
            {actions.slice(0, 4).map((action) => (
              <QuickActionItem
                action={action}
                key={action.id}
                onClick={() => onActionClick?.(action)}
              />
            ))}
          </div>

          {/* Footer - View All */}
          {actions.length > 4 && (
            <div className="border-neutral-100 border-t bg-neutral-50 px-4 py-2">
              <Button asChild className="w-full" size="sm" variant="ghost">
                <Link href="/dashboard/pro/bookings">
                  View all {actions.length} items
                  <HugeiconsIcon className="ml-1 h-3.5 w-3.5" icon={ArrowRight01Icon} />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

type QuickActionItemProps = {
  action: UrgentAction;
  onClick?: () => void;
};

function QuickActionItem({ action, onClick }: QuickActionItemProps) {
  const urgencyStyles = {
    urgent: {
      icon: "bg-red-100 text-red-600",
      badge: "border-red-200 bg-red-50 text-red-700",
      hover: "hover:bg-red-50/50",
    },
    important: {
      icon: "bg-rausch-100 text-rausch-600",
      badge: "border-rausch-200 bg-rausch-50 text-rausch-700",
      hover: "hover:bg-rausch-50/50",
    },
    normal: {
      icon: "bg-neutral-100 text-neutral-600",
      badge: "border-neutral-200 bg-neutral-50 text-neutral-600",
      hover: "hover:bg-neutral-50",
    },
  };

  const styles = urgencyStyles[action.urgency];

  return (
    <Link
      className={cn(
        "group flex items-center justify-between px-4 py-3 transition-colors",
        styles.hover
      )}
      href={action.href}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", styles.icon)}>
          <HugeiconsIcon className="h-4 w-4" icon={action.icon} />
        </div>
        <span className={cn("font-medium text-neutral-900 text-sm", geistSans.className)}>
          {action.label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={styles.badge} size="sm" variant="outline">
          {action.count}
        </Badge>
        <HugeiconsIcon
          className="h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:text-neutral-600"
          icon={ArrowRight01Icon}
        />
      </div>
    </Link>
  );
}

// ============================================================================
// Compact Variant (for mobile bottom bar)
// ============================================================================

export function QuickActionBarCompact({
  pendingBookings = 0,
  upcomingCheckIns = 0,
  pendingCheckouts = 0,
  unreadMessages = 0,
  className,
}: Omit<QuickActionBarProps, "variant">) {
  const totalPending = pendingBookings + pendingCheckouts;
  const totalItems = totalPending + upcomingCheckIns + unreadMessages;

  if (totalItems === 0) {
    return null;
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn("fixed right-4 bottom-4 left-4 z-50 md:hidden", className)}
      exit={{ opacity: 0, y: 20 }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
    >
      <Button
        asChild
        className={cn(
          "w-full shadow-lg",
          totalPending > 0 ? "bg-red-600 hover:bg-red-700" : "bg-rausch-500 hover:bg-rausch-600"
        )}
        size="lg"
      >
        <Link href="/dashboard/pro/bookings">
          <HugeiconsIcon className="mr-2 h-5 w-5" icon={Clock01Icon} />
          {totalPending > 0
            ? `${totalPending} action${totalPending > 1 ? "s" : ""} required`
            : `${totalItems} item${totalItems > 1 ? "s" : ""} to review`}
          <Badge
            className="ml-2 border-white/20 bg-white/20 text-white"
            size="sm"
            variant="outline"
          >
            {totalItems}
          </Badge>
        </Link>
      </Button>
    </motion.div>
  );
}

// ============================================================================
// Hook for calculating urgent actions from bookings
// ============================================================================

export function useQuickActionCounts(bookings: Array<{ status: string; scheduledStart: string }>) {
  return useMemo(() => {
    const now = new Date();
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);

    let pendingBookings = 0;
    let upcomingCheckIns = 0;
    let pendingCheckouts = 0;

    for (const booking of bookings) {
      if (booking.status === "pending") {
        pendingBookings++;
      } else if (booking.status === "in_progress") {
        pendingCheckouts++;
      } else if (booking.status === "confirmed") {
        const startTime = new Date(booking.scheduledStart);
        if (startTime >= now && startTime <= thirtyMinutesFromNow) {
          upcomingCheckIns++;
        }
      }
    }

    return {
      pendingBookings,
      upcomingCheckIns,
      pendingCheckouts,
    };
  }, [bookings]);
}

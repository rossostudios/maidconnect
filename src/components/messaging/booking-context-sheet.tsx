"use client";

/**
 * BookingContextSheet - Lightweight Booking Details Panel for Messaging
 *
 * Airbnb-style sheet that shows booking context within a conversation.
 * Designed for quick reference and actions without leaving the chat.
 *
 * Key Features:
 * - Booking status badge
 * - Service and schedule info
 * - Customer/Professional details
 * - Quick actions based on status
 * - Pricing breakdown
 *
 * Following Lia Design System:
 * - rounded-lg containers
 * - orange-500 primary actions
 * - neutral color palette
 */

import {
  ArrowRight01Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Location01Icon,
  Message01Icon,
  MoneyBag01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { format, formatDistanceToNow } from "date-fns";
import { geistSans } from "@/app/fonts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils/core";
import { formatCurrency } from "@/lib/utils/format";
import type { HugeIcon } from "@/types/icons";

// ============================================================================
// Types
// ============================================================================

export type BookingStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";

export type BookingContextData = {
  id: string;
  status: BookingStatus;
  serviceName: string;
  scheduledStart: string;
  scheduledEnd: string;
  amountCents?: number;
  currency?: string;
  address?: string;
  specialInstructions?: string;
};

export type UserContextData = {
  id: string;
  fullName: string;
  avatarUrl?: string;
  phone?: string;
  email?: string;
};

type BookingContextSheetProps = {
  /** Whether the sheet is open */
  isOpen: boolean;
  /** Called when sheet should close */
  onClose: () => void;
  /** Booking data to display */
  booking: BookingContextData | null;
  /** Other user in the conversation */
  otherUser: UserContextData | null;
  /** Current user role */
  userRole: "customer" | "professional";
  /** Action callbacks */
  onAccept?: () => void;
  onDecline?: () => void;
  onCheckIn?: () => void;
  onCheckOut?: () => void;
  onCancel?: () => void;
  /** Loading states */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
};

// ============================================================================
// Status Configuration
// ============================================================================

type StatusConfig = {
  label: string;
  variant: "default" | "secondary" | "outline" | "destructive";
  bgColor: string;
  textColor: string;
  borderColor: string;
};

const STATUS_CONFIG: Record<BookingStatus, StatusConfig> = {
  pending: {
    label: "Pending",
    variant: "outline",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
  },
  confirmed: {
    label: "Confirmed",
    variant: "outline",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
  },
  in_progress: {
    label: "In Progress",
    variant: "outline",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
  },
  completed: {
    label: "Completed",
    variant: "outline",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200",
  },
  cancelled: {
    label: "Cancelled",
    variant: "outline",
    bgColor: "bg-neutral-50",
    textColor: "text-neutral-500",
    borderColor: "border-neutral-200",
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

function getStatusBadge(status: BookingStatus) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge
      className={cn(config.bgColor, config.textColor, config.borderColor)}
      variant={config.variant}
    >
      {config.label}
    </Badge>
  );
}

function formatTimeRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return `${format(startDate, "h:mm a")} - ${format(endDate, "h:mm a")}`;
}

function getTimeLabel(scheduledStart: string, status: BookingStatus): string {
  if (status === "completed") {
    return "Completed";
  }
  if (status === "cancelled") {
    return "Cancelled";
  }

  const date = new Date(scheduledStart);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();

  if (diffMs < 0 && status !== "in_progress") {
    return "Past due";
  }

  if (status === "in_progress") {
    return "Now";
  }

  return formatDistanceToNow(date, { addSuffix: true });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ============================================================================
// Main Component
// ============================================================================

export function BookingContextSheet({
  isOpen,
  onClose,
  booking,
  otherUser,
  userRole,
  onAccept,
  onDecline,
  onCheckIn,
  onCheckOut,
  onCancel,
  isLoading = false,
  className,
}: BookingContextSheetProps) {
  if (!(booking && otherUser)) {
    return null;
  }

  const status = booking.status as BookingStatus;
  const isProfessional = userRole === "professional";

  return (
    <Sheet onOpenChange={(open) => !open && onClose()} open={isOpen}>
      <SheetContent className={cn("w-full sm:max-w-md", className)} side="right">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <SheetTitle>Booking Details</SheetTitle>
            {getStatusBadge(status)}
          </div>
          <SheetDescription>{getTimeLabel(booking.scheduledStart, status)}</SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Other User Info */}
          <InfoSection icon={UserIcon} title={isProfessional ? "Customer" : "Professional"}>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage alt={otherUser.fullName} src={otherUser.avatarUrl} />
                <AvatarFallback className="bg-orange-100 text-orange-700">
                  {getInitials(otherUser.fullName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className={cn("font-medium text-neutral-900", geistSans.className)}>
                  {otherUser.fullName}
                </p>
                {otherUser.phone && <p className="text-neutral-500 text-sm">{otherUser.phone}</p>}
              </div>
            </div>
          </InfoSection>

          {/* Service Info */}
          <InfoSection icon={CheckmarkCircle02Icon} title="Service">
            <p className={cn("font-medium text-neutral-900", geistSans.className)}>
              {booking.serviceName}
            </p>
          </InfoSection>

          {/* Schedule */}
          <InfoSection icon={Calendar03Icon} title="Schedule">
            <div className="space-y-1">
              <p className={cn("font-medium text-neutral-900", geistSans.className)}>
                {format(new Date(booking.scheduledStart), "EEEE, MMMM d, yyyy")}
              </p>
              <p className="flex items-center gap-1.5 text-neutral-500 text-sm">
                <HugeiconsIcon className="h-3.5 w-3.5" icon={Clock01Icon} />
                {formatTimeRange(booking.scheduledStart, booking.scheduledEnd)}
              </p>
            </div>
          </InfoSection>

          {/* Address */}
          {booking.address && (
            <InfoSection icon={Location01Icon} title="Location">
              <p className="text-neutral-700 text-sm">{booking.address}</p>
            </InfoSection>
          )}

          {/* Amount */}
          {booking.amountCents && (
            <InfoSection icon={MoneyBag01Icon} title="Amount">
              <p className={cn("font-semibold text-lg text-neutral-900", geistSans.className)}>
                {formatCurrency(booking.amountCents / 100, {
                  currency: (booking.currency || "COP") as "COP" | "USD" | "EUR",
                })}
              </p>
            </InfoSection>
          )}

          {/* Special Instructions */}
          {booking.specialInstructions && (
            <InfoSection icon={Message01Icon} title="Special Instructions">
              <p className="text-neutral-700 text-sm">{booking.specialInstructions}</p>
            </InfoSection>
          )}

          {/* Quick Actions */}
          <div className="space-y-3 border-neutral-200 border-t pt-6">
            {isProfessional && status === "pending" && (
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  disabled={isLoading}
                  onPress={onAccept}
                  variant="default"
                >
                  {isLoading ? "Processing..." : "Accept"}
                </Button>
                <Button
                  className="flex-1"
                  disabled={isLoading}
                  onPress={onDecline}
                  variant="outline"
                >
                  Decline
                </Button>
              </div>
            )}

            {isProfessional && status === "confirmed" && (
              <Button className="w-full" disabled={isLoading} onPress={onCheckIn} variant="default">
                <HugeiconsIcon className="mr-2 h-4 w-4" icon={CheckmarkCircle02Icon} />
                {isLoading ? "Processing..." : "Check In"}
              </Button>
            )}

            {isProfessional && status === "in_progress" && (
              <Button
                className="w-full"
                disabled={isLoading}
                onPress={onCheckOut}
                variant="default"
              >
                <HugeiconsIcon className="mr-2 h-4 w-4" icon={CheckmarkCircle02Icon} />
                {isLoading ? "Processing..." : "Check Out"}
              </Button>
            )}

            {/* View Full Details */}
            <Button asChild className="w-full" variant="outline">
              <Link
                href={`/dashboard/${userRole === "professional" ? "pro" : "customer"}/bookings/${booking.id}`}
              >
                View Full Details
                <HugeiconsIcon className="ml-2 h-4 w-4" icon={ArrowRight01Icon} />
              </Link>
            </Button>

            {/* Cancel (for pending/confirmed only) */}
            {(status === "pending" || status === "confirmed") && onCancel && (
              <Button
                className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                disabled={isLoading}
                onPress={onCancel}
                variant="ghost"
              >
                Cancel Booking
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

type InfoSectionProps = {
  title: string;
  icon: HugeIcon;
  children: React.ReactNode;
};

function InfoSection({ title, icon, children }: InfoSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <HugeiconsIcon className="h-4 w-4 text-neutral-400" icon={icon} />
        <h3
          className={cn(
            "font-medium text-neutral-500 text-xs uppercase tracking-wide",
            geistSans.className
          )}
        >
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

// ============================================================================
// Compact Trigger Button
// ============================================================================

type BookingContextTriggerProps = {
  booking: BookingContextData | null;
  onClick: () => void;
  className?: string;
};

export function BookingContextTrigger({ booking, onClick, className }: BookingContextTriggerProps) {
  if (!booking) {
    return null;
  }

  const status = booking.status as BookingStatus;
  const config = STATUS_CONFIG[status];

  return (
    <button
      className={cn(
        "flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 transition-colors",
        "hover:border-orange-200 hover:bg-orange-50/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
        className
      )}
      onClick={onClick}
      type="button"
    >
      <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", config.bgColor)}>
        <HugeiconsIcon className={cn("h-4 w-4", config.textColor)} icon={Calendar03Icon} />
      </div>
      <div className="flex-1 text-left">
        <p className={cn("font-medium text-neutral-900 text-sm", geistSans.className)}>
          {booking.serviceName}
        </p>
        <p className="text-neutral-500 text-xs">
          {format(new Date(booking.scheduledStart), "MMM d 'at' h:mm a")}
        </p>
      </div>
      <Badge
        className={cn("text-xs", config.bgColor, config.textColor, config.borderColor)}
        variant="outline"
      >
        {config.label}
      </Badge>
    </button>
  );
}

/**
 * TripCard - Airbnb-Inspired Booking Card
 *
 * Displays a single booking as a "trip" with:
 * - Status indicators
 * - Professional info
 * - Service details
 * - Quick actions
 *
 * Inspired by Airbnb's 2025 "Trips" living itinerary.
 *
 * Following Lia Design System.
 */

"use client";

import {
  ArrowRight01Icon,
  Calendar03Icon,
  Cancel01Icon,
  Clock01Icon,
  Location01Icon,
  Message01Icon,
  MoreHorizontalIcon,
  StarIcon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns";
import { motion } from "motion/react";
import { geistSans } from "@/app/fonts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils/core";

export type Trip = {
  id: string;
  status: string;
  scheduled_start: string | null;
  duration_minutes: number | null;
  service_name: string | null;
  amount_authorized: number | null;
  amount_captured: number | null;
  currency: string | null;
  created_at: string;
  professional: {
    full_name: string | null;
    profile_id: string;
    avatar_url?: string | null;
  } | null;
  address?: {
    street?: string;
    city?: string;
  } | null;
};

type TripCardProps = {
  trip: Trip;
  variant?: "upcoming" | "past";
  index?: number;
  className?: string;
};

function getStatusConfig(status: string) {
  switch (status) {
    case "pending":
      return {
        label: "Pending",
        color: "bg-amber-50 text-amber-700 border-amber-200",
        dotColor: "bg-amber-500",
      };
    case "confirmed":
      return {
        label: "Confirmed",
        color: "bg-green-50 text-green-700 border-green-200",
        dotColor: "bg-green-500",
      };
    case "in_progress":
      return {
        label: "In Progress",
        color: "bg-blue-50 text-blue-700 border-blue-200",
        dotColor: "bg-blue-500 animate-pulse",
      };
    case "completed":
      return {
        label: "Completed",
        color: "bg-neutral-50 text-neutral-700 border-neutral-200",
        dotColor: "bg-neutral-500",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        color: "bg-red-50 text-red-700 border-red-200",
        dotColor: "bg-red-500",
      };
    default:
      return {
        label: status,
        color: "bg-neutral-50 text-neutral-700 border-neutral-200",
        dotColor: "bg-neutral-500",
      };
  }
}

function getTimeLabel(dateString: string | null): string {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (isToday(date)) {
    return `Today at ${format(date, "h:mm a")}`;
  }
  if (isTomorrow(date)) {
    return `Tomorrow at ${format(date, "h:mm a")}`;
  }
  if (isPast(date)) {
    return format(date, "MMMM d, yyyy");
  }

  // For future dates, show relative time if within a week
  const daysDiff = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (daysDiff <= 7) {
    return `${formatDistanceToNow(date, { addSuffix: true })} at ${format(date, "h:mm a")}`;
  }

  return format(date, "EEEE, MMMM d 'at' h:mm a");
}

function getCountdown(dateString: string | null): { label: string; urgent: boolean } | null {
  if (!dateString) return null;

  const date = new Date(dateString);
  if (isPast(date)) return null;

  const diffMs = date.getTime() - Date.now();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return { label: `${diffMins}m`, urgent: true };
  }
  if (diffHours < 24) {
    return { label: `${diffHours}h`, urgent: diffHours < 3 };
  }
  if (diffDays <= 7) {
    return { label: `${diffDays}d`, urgent: false };
  }

  return null;
}

export function TripCard({ trip, variant = "upcoming", index = 0, className }: TripCardProps) {
  const statusConfig = getStatusConfig(trip.status);
  const timeLabel = getTimeLabel(trip.scheduled_start);
  const countdown = variant === "upcoming" ? getCountdown(trip.scheduled_start) : null;
  const isActive = trip.status === "in_progress";
  const isPending = trip.status === "pending";

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <div
        className={cn(
          "group relative rounded-lg border bg-white transition-all hover:shadow-md",
          isActive ? "border-blue-300 ring-2 ring-blue-100" : "border-neutral-200",
          className
        )}
      >
        {/* Active Indicator */}
        {isActive && (
          <div className="absolute -top-px left-1/2 h-1 w-16 -translate-x-1/2 rounded-b-full bg-blue-500" />
        )}

        <div className="p-5">
          {/* Header: Status + Countdown */}
          <div className="mb-4 flex items-center justify-between">
            <Badge className={cn("flex items-center gap-1.5 border", statusConfig.color)} size="sm">
              <span className={cn("h-1.5 w-1.5 rounded-full", statusConfig.dotColor)} />
              {statusConfig.label}
            </Badge>

            {countdown && (
              <span
                className={cn(
                  "flex items-center gap-1 rounded-full px-2.5 py-1 font-medium text-xs",
                  countdown.urgent
                    ? "bg-red-100 text-red-700"
                    : "bg-neutral-100 text-neutral-600"
                )}
              >
                <HugeiconsIcon className="h-3 w-3" icon={Clock01Icon} />
                {countdown.label}
              </span>
            )}
          </div>

          {/* Service Info */}
          <div className="mb-4">
            <h3 className={cn("font-semibold text-neutral-900 text-lg", geistSans.className)}>
              {trip.service_name || "Service"}
            </h3>
            <p className={cn("mt-1 flex items-center gap-1.5 text-neutral-600 text-sm", geistSans.className)}>
              <HugeiconsIcon className="h-4 w-4" icon={Calendar03Icon} />
              {timeLabel}
            </p>
            {trip.address?.city && (
              <p className={cn("mt-1 flex items-center gap-1.5 text-neutral-500 text-sm", geistSans.className)}>
                <HugeiconsIcon className="h-4 w-4" icon={Location01Icon} />
                {trip.address.street ? `${trip.address.street}, ${trip.address.city}` : trip.address.city}
              </p>
            )}
          </div>

          {/* Professional Info */}
          {trip.professional && (
            <div className="mb-4 flex items-center gap-3 rounded-lg bg-neutral-50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200">
                {trip.professional.avatar_url ? (
                  <img
                    alt={trip.professional.full_name || "Professional"}
                    className="h-full w-full rounded-full object-cover"
                    src={trip.professional.avatar_url}
                  />
                ) : (
                  <HugeiconsIcon className="h-5 w-5 text-neutral-500" icon={UserCircleIcon} />
                )}
              </div>
              <div className="flex-1">
                <p className={cn("font-medium text-neutral-900 text-sm", geistSans.className)}>
                  {trip.professional.full_name || "Professional"}
                </p>
                <p className={cn("text-neutral-500 text-xs", geistSans.className)}>
                  Your service provider
                </p>
              </div>
              {variant === "upcoming" && (
                <Button
                  asChild
                  className="h-8 w-8 rounded-full p-0"
                  size="sm"
                  variant="ghost"
                >
                  <Link href="/dashboard/customer/messages">
                    <HugeiconsIcon className="h-4 w-4" icon={Message01Icon} />
                    <span className="sr-only">Message</span>
                  </Link>
                </Button>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
            {variant === "upcoming" ? (
              <>
                <div className="flex gap-2">
                  {isPending && (
                    <Button
                      className="h-8 gap-1.5 border-red-200 text-red-600 text-xs hover:bg-red-50"
                      size="sm"
                      variant="outline"
                    >
                      <HugeiconsIcon className="h-3.5 w-3.5" icon={Cancel01Icon} />
                      Cancel
                    </Button>
                  )}
                  <Button asChild className="h-8 text-xs" size="sm" variant="outline">
                    <Link href={`/dashboard/customer/bookings`}>
                      View Details
                      <HugeiconsIcon className="ml-1 h-3.5 w-3.5" icon={ArrowRight01Icon} />
                    </Link>
                  </Button>
                </div>
                <Button className="h-8 w-8 rounded-full p-0" size="sm" variant="ghost">
                  <HugeiconsIcon className="h-4 w-4" icon={MoreHorizontalIcon} />
                </Button>
              </>
            ) : (
              <>
                <Button
                  asChild
                  className="h-8 gap-1.5 text-xs"
                  size="sm"
                  variant="outline"
                >
                  <Link href={`/dashboard/customer/bookings`}>
                    <HugeiconsIcon className="h-3.5 w-3.5" icon={StarIcon} />
                    Leave Review
                  </Link>
                </Button>
                <Button
                  asChild
                  className="h-8 gap-1.5 border-orange-200 bg-orange-50 text-orange-600 text-xs hover:bg-orange-100"
                  size="sm"
                  variant="outline"
                >
                  <Link href={`/professionals/${trip.professional?.profile_id}`}>
                    Book Again
                    <HugeiconsIcon className="ml-1 h-3.5 w-3.5" icon={ArrowRight01Icon} />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

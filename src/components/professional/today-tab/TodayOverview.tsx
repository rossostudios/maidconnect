/**
 * TodayOverview - Airbnb-Inspired Daily Dashboard
 *
 * Main component for the professional's "Today" view featuring:
 * - Urgent tasks banner
 * - Daily task checklist
 * - Hour-by-hour schedule
 * - Quick action buttons
 *
 * Inspired by Airbnb's 2025 Summer Release "Today" tab which highlights
 * daily tasks, check-ins, and communication prompts.
 *
 * Following Lia Design System.
 */

"use client";

import {
  ArrowRight01Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  DollarCircleIcon,
  Message01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import { useMemo } from "react";
import { geistSans } from "@/app/fonts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { DailyScheduleCompact, type ScheduledBooking } from "./DailySchedule";
import { NoTasksCard, TodayTaskCard, type TodayTask } from "./TodayTaskCard";

type Booking = {
  id: string;
  status: string;
  scheduled_start: string | null;
  scheduled_end: string | null;
  duration_minutes: number | null;
  service_name: string | null;
  customer?: { id: string; full_name?: string } | null;
};

type TodayOverviewProps = {
  bookings: Booking[];
  pendingMessages?: number;
  pendingReviews?: number;
  userName: string;
  className?: string;
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getTimeUntil(dateString: string): string {
  const now = new Date();
  const target = new Date(dateString);
  const diffMs = target.getTime() - now.getTime();

  if (diffMs < 0) return "Started";

  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${Math.floor(diffHours / 24)}d`;
}

function buildTasks(
  bookings: Booking[],
  pendingMessages: number,
  pendingReviews: number
): TodayTask[] {
  const tasks: TodayTask[] = [];
  const now = new Date();
  const today = now.toDateString();

  // Today's bookings - highest priority
  const todayBookings = bookings.filter((b) => {
    if (!b.scheduled_start || b.status === "completed" || b.status === "cancelled") return false;
    return new Date(b.scheduled_start).toDateString() === today;
  });

  for (const booking of todayBookings) {
    const scheduledTime = booking.scheduled_start
      ? new Date(booking.scheduled_start).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : undefined;

    const timeUntil = booking.scheduled_start ? getTimeUntil(booking.scheduled_start) : undefined;

    // Determine urgency based on time
    let urgency: TodayTask["urgency"] = "normal";
    if (booking.scheduled_start) {
      const diffMins =
        (new Date(booking.scheduled_start).getTime() - now.getTime()) / (1000 * 60);
      if (diffMins < 30 && diffMins > 0) urgency = "urgent";
      else if (diffMins < 120 && diffMins > 0) urgency = "important";
    }

    if (booking.status === "in_progress") {
      urgency = "urgent";
    }

    tasks.push({
      id: `booking-${booking.id}`,
      type: booking.status === "in_progress" ? "check_in" : "booking_today",
      title:
        booking.status === "in_progress"
          ? "Booking in progress"
          : `Upcoming: ${booking.service_name || "Service"}`,
      subtitle: booking.service_name || undefined,
      customerName: booking.customer?.full_name,
      scheduledTime,
      timeUntil: booking.status === "in_progress" ? "Now" : timeUntil,
      urgency,
      actionLabel: booking.status === "in_progress" ? "Complete Check-out" : "View Details",
      actionHref: `/dashboard/pro/bookings`,
    });
  }

  // Pending bookings that need confirmation
  const pendingBookings = bookings.filter((b) => b.status === "pending").slice(0, 3);
  for (const booking of pendingBookings) {
    tasks.push({
      id: `pending-${booking.id}`,
      type: "pending_response",
      title: "Booking request",
      subtitle: booking.service_name || "New service request",
      customerName: booking.customer?.full_name,
      scheduledTime: booking.scheduled_start
        ? new Date(booking.scheduled_start).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : undefined,
      urgency: "important",
      actionLabel: "Respond",
      actionHref: `/dashboard/pro/bookings`,
    });
  }

  // Pending messages
  if (pendingMessages > 0) {
    tasks.push({
      id: "messages",
      type: "pending_response",
      title: `${pendingMessages} unread message${pendingMessages > 1 ? "s" : ""}`,
      subtitle: "Respond to keep customers engaged",
      urgency: pendingMessages > 3 ? "urgent" : "important",
      actionLabel: "View Messages",
      actionHref: "/dashboard/pro/messages",
    });
  }

  // Pending reviews
  if (pendingReviews > 0) {
    tasks.push({
      id: "reviews",
      type: "pending_review",
      title: `${pendingReviews} customer${pendingReviews > 1 ? "s" : ""} to rate`,
      subtitle: "Rate customers from completed bookings",
      urgency: "normal",
      actionLabel: "Rate Customers",
      actionHref: "/dashboard/pro/bookings",
    });
  }

  // Sort by urgency
  const urgencyOrder = { urgent: 0, important: 1, normal: 2 };
  tasks.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

  return tasks;
}

function buildSchedule(bookings: Booking[]): ScheduledBooking[] {
  const now = new Date();
  const today = now.toDateString();

  return bookings
    .filter((b) => {
      if (!b.scheduled_start) return false;
      const bookingDate = new Date(b.scheduled_start);
      return (
        bookingDate.toDateString() === today &&
        (b.status === "confirmed" || b.status === "in_progress" || b.status === "completed")
      );
    })
    .map((b) => {
      const start = new Date(b.scheduled_start!);
      return {
        id: b.id,
        customerName: b.customer?.full_name || "Customer",
        serviceName: b.service_name || "Service",
        startHour: start.getHours(),
        startMinute: start.getMinutes(),
        durationMinutes: b.duration_minutes || 60,
        status: b.status as ScheduledBooking["status"],
      };
    })
    .sort((a, b) => a.startHour * 60 + a.startMinute - (b.startHour * 60 + b.startMinute));
}

export function TodayOverview({
  bookings,
  pendingMessages = 0,
  pendingReviews = 0,
  userName,
  className,
}: TodayOverviewProps) {
  const tasks = useMemo(
    () => buildTasks(bookings, pendingMessages, pendingReviews),
    [bookings, pendingMessages, pendingReviews]
  );

  const schedule = useMemo(() => buildSchedule(bookings), [bookings]);

  const urgentCount = tasks.filter((t) => t.urgency === "urgent").length;
  const todayBookingsCount = schedule.length;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Greeting */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
        initial={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h1 className={cn("font-bold text-3xl text-neutral-900", geistSans.className)}>
            {getGreeting()}, {userName}
          </h1>
          <p className={cn("mt-1 text-neutral-600 text-sm", geistSans.className)}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Today's Stats */}
        <div className="flex items-center gap-3">
          {urgentCount > 0 && (
            <Badge className="border-red-200 bg-red-50 text-red-600" size="sm" variant="outline">
              {urgentCount} urgent
            </Badge>
          )}
          <Badge
            className="border-blue-200 bg-blue-50 text-blue-600"
            size="sm"
            variant="outline"
          >
            <HugeiconsIcon className="mr-1 h-3 w-3" icon={Calendar03Icon} />
            {todayBookingsCount} today
          </Badge>
        </div>
      </motion.div>

      {/* Urgent Tasks Banner */}
      {urgentCount > 0 && (
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          initial={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="rounded-lg border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <HugeiconsIcon className="h-5 w-5 text-red-600" icon={Clock01Icon} />
              </div>
              <div className="flex-1">
                <h3 className={cn("font-semibold text-red-900 text-sm", geistSans.className)}>
                  {urgentCount} item{urgentCount > 1 ? "s" : ""} need{urgentCount === 1 ? "s" : ""}{" "}
                  your attention
                </h3>
                <p className={cn("text-red-700 text-xs", geistSans.className)}>
                  Act now to avoid delays
                </p>
              </div>
              <Button
                asChild
                className="border-red-200 bg-white text-red-600 hover:bg-red-50"
                size="sm"
                variant="outline"
              >
                <Link href="/dashboard/pro/bookings">
                  Take Action
                  <HugeiconsIcon className="ml-1 h-4 w-4" icon={ArrowRight01Icon} />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tasks Section */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className={cn("font-semibold text-neutral-900 text-sm", geistSans.className)}>
              <HugeiconsIcon className="mr-2 inline h-4 w-4 text-neutral-500" icon={CheckmarkCircle02Icon} />
              Tasks
            </h2>
            <span className="text-neutral-500 text-xs">{tasks.length} pending</span>
          </div>

          <div className="space-y-3">
            {tasks.length > 0 ? (
              tasks.slice(0, 5).map((task, index) => (
                <TodayTaskCard index={index} key={task.id} task={task} />
              ))
            ) : (
              <NoTasksCard />
            )}

            {tasks.length > 5 && (
              <Button asChild className="w-full" variant="ghost">
                <Link href="/dashboard/pro/bookings">
                  View all {tasks.length} tasks
                  <HugeiconsIcon className="ml-1 h-4 w-4" icon={ArrowRight01Icon} />
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Schedule Section */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className={cn("font-semibold text-neutral-900 text-sm", geistSans.className)}>
              <HugeiconsIcon className="mr-2 inline h-4 w-4 text-neutral-500" icon={Calendar03Icon} />
              Today&apos;s Schedule
            </h2>
            <Link
              className="text-orange-600 text-xs hover:text-orange-700"
              href="/dashboard/pro/bookings"
            >
              Full calendar →
            </Link>
          </div>

          <DailyScheduleCompact bookings={schedule} />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2
          className={cn("mb-4 font-semibold text-neutral-900 text-sm", geistSans.className)}
        >
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <QuickActionCard
            href="/dashboard/pro/bookings"
            icon={Calendar03Icon}
            label="Bookings"
            variant="primary"
          />
          <QuickActionCard
            href="/dashboard/pro/messages"
            icon={Message01Icon}
            label="Messages"
            badge={pendingMessages > 0 ? pendingMessages : undefined}
          />
          <QuickActionCard
            href="/dashboard/pro/finances"
            icon={DollarCircleIcon}
            label="Earnings"
          />
          <QuickActionCard
            href="/dashboard/pro/availability"
            icon={Clock01Icon}
            label="Availability"
          />
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({
  icon,
  label,
  href,
  badge,
  variant = "default",
}: {
  icon: React.ComponentType;
  label: string;
  href: string;
  badge?: number;
  variant?: "default" | "primary";
}) {
  return (
    <Link
      className={cn(
        "group relative flex flex-col items-center gap-2 rounded-lg border p-4 transition-all hover:shadow-md",
        variant === "primary"
          ? "border-orange-200 bg-orange-50 hover:border-orange-300"
          : "border-neutral-200 bg-white hover:border-orange-200"
      )}
      href={href}
    >
      {badge !== undefined && (
        <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 font-semibold text-white text-xs">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
          variant === "primary"
            ? "bg-orange-100 text-orange-600 group-hover:bg-orange-200"
            : "bg-neutral-100 text-neutral-600 group-hover:bg-orange-50 group-hover:text-orange-600"
        )}
      >
        <HugeiconsIcon className="h-5 w-5" icon={icon} />
      </div>
      <span
        className={cn(
          "font-medium text-xs",
          variant === "primary" ? "text-orange-700" : "text-neutral-700"
        )}
      >
        {label}
      </span>
    </Link>
  );
}

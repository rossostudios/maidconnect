/**
 * DailySchedule - Airbnb-Inspired Hour-by-Hour Schedule
 *
 * Visual timeline showing today's bookings by hour with
 * current time indicator. Inspired by Airbnb's 2025 redesigned
 * calendar with daily/hourly views.
 *
 * Following Lia Design System.
 */

"use client";

import { Calendar03Icon, Clock01Icon, UserIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { geistSans } from "@/app/fonts";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ScheduledBooking = {
  id: string;
  customerName: string;
  serviceName: string;
  startHour: number;
  startMinute: number;
  durationMinutes: number;
  status: "confirmed" | "in_progress" | "completed";
};

type DailyScheduleProps = {
  bookings: ScheduledBooking[];
  startHour?: number;
  endHour?: number;
  className?: string;
};

const statusStyles: Record<ScheduledBooking["status"], { bg: string; border: string; text: string }> =
  {
    confirmed: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
    },
    in_progress: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-700",
    },
    completed: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
    },
  };

function formatHour(hour: number): string {
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour} ${ampm}`;
}

function formatTime(hour: number, minute: number): string {
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute.toString().padStart(2, "0")} ${ampm}`;
}

export function DailySchedule({
  bookings,
  startHour = 7,
  endHour = 20,
  className,
}: DailyScheduleProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  // Calculate position of current time indicator (percentage from top)
  const totalMinutes = (endHour - startHour + 1) * 60;
  const minutesFromStart = (currentHour - startHour) * 60 + currentMinute;
  const currentTimePosition = Math.max(0, Math.min(100, (minutesFromStart / totalMinutes) * 100));

  // Check if we should show current time indicator
  const showCurrentTime = currentHour >= startHour && currentHour <= endHour;

  return (
    <div className={cn("rounded-lg border border-neutral-200 bg-white", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 p-4">
        <div className="flex items-center gap-2">
          <HugeiconsIcon className="h-5 w-5 text-neutral-500" icon={Calendar03Icon} />
          <h3 className={cn("font-semibold text-neutral-900 text-sm", geistSans.className)}>
            Today&apos;s Schedule
          </h3>
        </div>
        <Badge size="sm" variant="outline">
          <HugeiconsIcon className="mr-1 h-3 w-3" icon={Clock01Icon} />
          {currentTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })}
        </Badge>
      </div>

      {/* Schedule Grid */}
      <div className="relative p-4">
        {/* Current Time Indicator */}
        {showCurrentTime && (
          <motion.div
            animate={{ opacity: 1 }}
            className="pointer-events-none absolute right-4 left-16 z-10"
            initial={{ opacity: 0 }}
            style={{ top: `calc(${currentTimePosition}% + 16px)` }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-orange-500 shadow-sm" />
              <div className="h-px flex-1 bg-orange-500" />
            </div>
          </motion.div>
        )}

        {/* Hour Slots */}
        <div className="space-y-0">
          {hours.map((hour) => {
            const hourBookings = bookings.filter((b) => {
              const bookingEndHour = b.startHour + Math.floor((b.startMinute + b.durationMinutes) / 60);
              return b.startHour <= hour && bookingEndHour > hour;
            });

            const isCurrentHour = hour === currentHour;

            return (
              <div
                className={cn(
                  "relative flex min-h-[60px] border-b border-neutral-100 last:border-b-0",
                  isCurrentHour && "bg-orange-50/30"
                )}
                key={hour}
              >
                {/* Hour Label */}
                <div
                  className={cn(
                    "w-12 flex-shrink-0 py-2 pr-3 text-right text-xs",
                    isCurrentHour ? "font-semibold text-orange-600" : "text-neutral-400"
                  )}
                >
                  {formatHour(hour)}
                </div>

                {/* Booking Slots */}
                <div className="flex flex-1 flex-col gap-1 border-l border-neutral-100 py-2 pl-3">
                  {hourBookings.map((booking) => {
                    // Only render at the start hour of the booking
                    if (booking.startHour !== hour) return null;

                    const styles = statusStyles[booking.status];

                    return (
                      <motion.div
                        animate={{ opacity: 1, x: 0 }}
                        initial={{ opacity: 0, x: -10 }}
                        key={booking.id}
                        transition={{ duration: 0.2 }}
                      >
                        <div
                          className={cn(
                            "rounded-lg border p-2",
                            styles.bg,
                            styles.border
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p
                                className={cn(
                                  "truncate font-medium text-xs",
                                  styles.text,
                                  geistSans.className
                                )}
                              >
                                {booking.serviceName}
                              </p>
                              <div className="mt-0.5 flex items-center gap-2 text-xs text-neutral-500">
                                <span className="flex items-center gap-0.5">
                                  <HugeiconsIcon className="h-3 w-3" icon={UserIcon} />
                                  {booking.customerName}
                                </span>
                                <span>
                                  {formatTime(booking.startHour, booking.startMinute)}
                                </span>
                              </div>
                            </div>
                            <Badge
                              className="flex-shrink-0 capitalize"
                              size="sm"
                              variant={
                                booking.status === "in_progress"
                                  ? "warning"
                                  : booking.status === "completed"
                                    ? "success"
                                    : "outline"
                              }
                            >
                              {booking.status.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Empty hour slot indicator */}
                  {hourBookings.length === 0 && (
                    <div className="py-1 text-xs text-neutral-300">Available</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Compact version for dashboard overview
 */
export function DailyScheduleCompact({ bookings }: { bookings: ScheduledBooking[] }) {
  const upcomingBookings = bookings
    .filter((b) => b.status !== "completed")
    .sort((a, b) => a.startHour * 60 + a.startMinute - (b.startHour * 60 + b.startMinute))
    .slice(0, 3);

  if (upcomingBookings.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-4 text-center">
        <p className={cn("text-neutral-600 text-sm", geistSans.className)}>
          No bookings scheduled for today
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {upcomingBookings.map((booking, index) => {
        const styles = statusStyles[booking.status];
        return (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 10 }}
            key={booking.id}
            transition={{ delay: index * 0.1, duration: 0.2 }}
          >
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3",
                styles.bg,
                styles.border
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white"
                )}
              >
                <span className={cn("font-semibold text-sm", styles.text, geistSans.className)}>
                  {formatTime(booking.startHour, booking.startMinute).split(" ")[0]}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "truncate font-medium text-neutral-900 text-sm",
                    geistSans.className
                  )}
                >
                  {booking.serviceName}
                </p>
                <p className="flex items-center gap-1 text-xs text-neutral-500">
                  <HugeiconsIcon className="h-3 w-3" icon={UserIcon} />
                  {booking.customerName}
                </p>
              </div>
              <Badge
                className="flex-shrink-0 capitalize"
                size="sm"
                variant={booking.status === "in_progress" ? "warning" : "outline"}
              >
                {booking.status.replace("_", " ")}
              </Badge>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

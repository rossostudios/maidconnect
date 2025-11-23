/**
 * TodayTaskCard - Airbnb-Inspired Task Card
 *
 * Individual task card with urgency indicators, action buttons,
 * and time-sensitive badges. Following Lia Design System.
 *
 * Inspired by Airbnb's 2025 Summer Release "Today" tab.
 */

"use client";

import {
  Alert02Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Message01Icon,
  StarIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import { geistSans } from "@/app/fonts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type TaskType =
  | "booking_today"
  | "pending_response"
  | "pending_review"
  | "check_in"
  | "payment_pending";

export type TaskUrgency = "urgent" | "important" | "normal";

export type TodayTask = {
  id: string;
  type: TaskType;
  title: string;
  subtitle?: string;
  customerName?: string;
  scheduledTime?: string;
  timeUntil?: string;
  urgency: TaskUrgency;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
};

const taskIcons: Record<TaskType, React.ComponentType> = {
  booking_today: Calendar03Icon,
  pending_response: Message01Icon,
  pending_review: StarIcon,
  check_in: CheckmarkCircle02Icon,
  payment_pending: Alert02Icon,
};

const urgencyStyles: Record<TaskUrgency, { badge: string; border: string; icon: string }> = {
  urgent: {
    badge: "bg-red-50 text-red-600 border-red-200",
    border: "border-l-red-500",
    icon: "text-red-500",
  },
  important: {
    badge: "bg-orange-50 text-orange-600 border-orange-200",
    border: "border-l-orange-500",
    icon: "text-orange-500",
  },
  normal: {
    badge: "bg-blue-50 text-blue-600 border-blue-200",
    border: "border-l-blue-500",
    icon: "text-blue-500",
  },
};

const cardVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export function TodayTaskCard({ task, index = 0 }: { task: TodayTask; index?: number }) {
  const Icon = taskIcons[task.type];
  const styles = urgencyStyles[task.urgency];

  return (
    <motion.div
      animate="visible"
      initial="hidden"
      transition={{ delay: index * 0.1 }}
      variants={cardVariants}
    >
      <div
        className={cn(
          "rounded-lg border border-neutral-200 border-l-4 bg-white p-4 transition-all hover:shadow-md",
          styles.border
        )}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={cn(
              "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-50"
            )}
          >
            <HugeiconsIcon className={cn("h-5 w-5", styles.icon)} icon={Icon} />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4
                  className={cn(
                    "font-semibold text-neutral-900 text-sm leading-tight",
                    geistSans.className
                  )}
                >
                  {task.title}
                </h4>
                {task.subtitle && (
                  <p className={cn("mt-0.5 text-neutral-600 text-xs", geistSans.className)}>
                    {task.subtitle}
                  </p>
                )}
              </div>

              {/* Time Until Badge */}
              {task.timeUntil && (
                <Badge
                  className={cn("flex-shrink-0 border", styles.badge)}
                  size="sm"
                  variant="outline"
                >
                  <HugeiconsIcon className="mr-1 h-3 w-3" icon={Clock01Icon} />
                  {task.timeUntil}
                </Badge>
              )}
            </div>

            {/* Customer Info & Time */}
            {(task.customerName || task.scheduledTime) && (
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                {task.customerName && (
                  <span className="flex items-center gap-1">
                    <HugeiconsIcon className="h-3 w-3" icon={UserIcon} />
                    {task.customerName}
                  </span>
                )}
                {task.scheduledTime && (
                  <span className="flex items-center gap-1">
                    <HugeiconsIcon className="h-3 w-3" icon={Clock01Icon} />
                    {task.scheduledTime}
                  </span>
                )}
              </div>
            )}

            {/* Action Button */}
            {task.actionLabel && (
              <div className="mt-3">
                <Button
                  className="h-8 px-3 text-xs"
                  onClick={task.onAction}
                  size="sm"
                  variant="outline"
                >
                  {task.actionLabel}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Empty state for when there are no tasks
 */
export function NoTasksCard() {
  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      initial={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
          <HugeiconsIcon className="h-6 w-6 text-green-500" icon={CheckmarkCircle02Icon} />
        </div>
        <h3
          className={cn("font-semibold text-neutral-900 text-sm leading-none", geistSans.className)}
        >
          All caught up!
        </h3>
        <p className={cn("mt-1 text-neutral-600 text-xs", geistSans.className)}>
          No pending tasks for today
        </p>
      </div>
    </motion.div>
  );
}

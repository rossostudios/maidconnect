/**
 * UrgencyTaskBoard - Airbnb-Style Urgency-Grouped Task Display
 *
 * Displays professional tasks grouped by urgency level:
 * - Requires Action (urgent) - Red accent, immediate attention needed
 * - Important - Orange accent, should be addressed today
 * - Upcoming - Blue accent, can wait but should be noted
 *
 * Following Lia Design System:
 * - Rounded corners (rounded-lg)
 * - Color-coded urgency indicators
 * - Action buttons for each task
 */

"use client";

import {
  ArrowRight01Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Message01Icon,
  StarIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { geistSans } from "@/app/fonts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import type { HugeIcon } from "@/types/icons";

type UrgencyLevel = "urgent" | "important" | "normal";

type TaskType =
  | "booking_in_progress"
  | "booking_starting_soon"
  | "booking_today"
  | "pending_request"
  | "unread_messages"
  | "pending_review"
  | "upcoming_booking";

type Task = {
  id: string;
  type: TaskType;
  title: string;
  subtitle?: string;
  customerName?: string;
  scheduledTime?: string;
  timeUntil?: string;
  urgency: UrgencyLevel;
  actionLabel: string;
  actionHref: string;
  bookingId?: string;
};

type TaskGroup = {
  level: UrgencyLevel;
  label: string;
  tasks: Task[];
};

type ApiResponse = {
  success: boolean;
  summary: {
    total: number;
    urgent: number;
    important: number;
    normal: number;
  };
  groups: TaskGroup[];
  tasks: Task[];
};

type UrgencyTaskBoardProps = {
  className?: string;
};

const urgencyConfig: Record<
  UrgencyLevel,
  {
    label: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
    badgeClass: string;
    icon: HugeIcon;
  }
> = {
  urgent: {
    label: "Requires Action",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-900/50",
    textColor: "text-red-700 dark:text-red-400",
    badgeClass:
      "border-red-200 dark:border-red-900/50 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
    icon: Clock01Icon,
  },
  important: {
    label: "Important",
    bgColor: "bg-rausch-50 dark:bg-rausch-900/20",
    borderColor: "border-rausch-200 dark:border-rausch-900/50",
    textColor: "text-rausch-700 dark:text-rausch-400",
    badgeClass:
      "border-rausch-200 dark:border-rausch-900/50 bg-rausch-100 dark:bg-rausch-900/40 text-rausch-700 dark:text-rausch-300",
    icon: Calendar03Icon,
  },
  normal: {
    label: "Upcoming",
    bgColor: "bg-babu-50 dark:bg-babu-900/20",
    borderColor: "border-babu-200 dark:border-babu-900/50",
    textColor: "text-babu-700 dark:text-babu-400",
    badgeClass:
      "border-babu-200 dark:border-babu-900/50 bg-babu-100 dark:bg-babu-900/40 text-babu-700 dark:text-babu-300",
    icon: CheckmarkCircle02Icon,
  },
};

const taskTypeIcons: Record<TaskType, HugeIcon> = {
  booking_in_progress: Clock01Icon,
  booking_starting_soon: Clock01Icon,
  booking_today: Calendar03Icon,
  pending_request: Calendar03Icon,
  unread_messages: Message01Icon,
  pending_review: StarIcon,
  upcoming_booking: Calendar03Icon,
};

export function UrgencyTaskBoard({ className }: UrgencyTaskBoardProps) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTasks() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/pro/tasks/urgent");
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const result = await response.json();
        if (result.success) {
          setData(result);
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tasks");
      } finally {
        setIsLoading(false);
      }
    }

    fetchTasks();
  }, []);

  if (isLoading) {
    return <UrgencyTaskBoardSkeleton className={className} />;
  }

  if (error) {
    return (
      <div className={cn("rounded-lg border border-border bg-card p-6", className)}>
        <p className="text-center text-muted-foreground text-sm">{error}</p>
      </div>
    );
  }

  // No tasks at all - "All caught up!" state
  if (!data || data.summary.total === 0) {
    return <NoTasksState className={className} />;
  }

  // Airbnb-style: Extract the SINGLE most urgent task as hero
  const heroTask = data.tasks[0]; // First task is most urgent (API returns sorted)
  const remainingTasksCount = data.summary.total - 1;
  const heroUrgency = heroTask?.urgency || "normal";

  return (
    <div className={cn("space-y-3", className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className={cn("font-semibold text-foreground text-lg", geistSans.className)}>
          Next Up
        </h2>
        {remainingTasksCount > 0 && (
          <Link
            className="flex items-center gap-1 font-medium text-rausch-600 text-sm hover:text-rausch-700"
            href="/dashboard/pro/bookings"
          >
            {remainingTasksCount} more task{remainingTasksCount !== 1 ? "s" : ""}
            <HugeiconsIcon className="h-4 w-4" icon={ArrowRight01Icon} />
          </Link>
        )}
      </div>

      {/* Hero Task Card - Prominent single task */}
      {heroTask && <HeroTaskCard task={heroTask} urgency={heroUrgency} />}
    </div>
  );
}

type HeroTaskCardProps = {
  task: Task;
  urgency: UrgencyLevel;
};

function HeroTaskCard({ task, urgency }: HeroTaskCardProps) {
  const config = urgencyConfig[urgency];
  const TaskIcon = taskTypeIcons[task.type] || Calendar03Icon;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-lg border p-5", config.borderColor, config.bgColor)}
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg",
            urgency === "urgent"
              ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
              : urgency === "important"
                ? "bg-rausch-100 text-rausch-600 dark:bg-rausch-900/40 dark:text-rausch-400"
                : "bg-babu-100 text-babu-600 dark:bg-babu-900/40 dark:text-babu-400"
          )}
        >
          <HugeiconsIcon className="h-6 w-6" icon={TaskIcon} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className={cn("font-semibold text-base text-foreground", geistSans.className)}>
                {task.title}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                {task.customerName && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <HugeiconsIcon className="h-4 w-4" icon={UserIcon} />
                    {task.customerName}
                  </span>
                )}
                {task.scheduledTime && (
                  <span className="text-muted-foreground">• {task.scheduledTime}</span>
                )}
              </div>
              {task.timeUntil && (
                <Badge
                  className={cn(
                    "mt-2",
                    urgency === "urgent"
                      ? "border-red-200 bg-red-100 text-red-700 dark:border-red-900/50 dark:bg-red-900/40 dark:text-red-300"
                      : urgency === "important"
                        ? "border-rausch-200 bg-rausch-100 text-rausch-700 dark:border-rausch-900/50 dark:bg-rausch-900/40 dark:text-rausch-300"
                        : "border-babu-200 bg-babu-100 text-babu-700 dark:border-babu-900/50 dark:bg-babu-900/40 dark:text-babu-300"
                  )}
                  size="sm"
                  variant="outline"
                >
                  {task.timeUntil}
                </Badge>
              )}
            </div>

            {/* CTA Button - Prominent on right */}
            <Button
              asChild
              className="flex-shrink-0"
              size="default"
              variant={urgency === "urgent" ? "default" : "outline"}
            >
              <Link href={task.actionHref}>
                {task.actionLabel}
                <HugeiconsIcon className="ml-1.5 h-4 w-4" icon={ArrowRight01Icon} />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function NoTasksState({ className }: { className?: string }) {
  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-900/50 dark:bg-green-900/20",
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
          <HugeiconsIcon
            className="h-6 w-6 text-green-600 dark:text-green-400"
            icon={CheckmarkCircle02Icon}
          />
        </div>
        <h3
          className={cn(
            "font-semibold text-green-800 text-sm dark:text-green-300",
            geistSans.className
          )}
        >
          All caught up!
        </h3>
        <p className="mt-1 max-w-xs text-green-700 text-xs dark:text-green-400">
          No tasks requiring your attention right now. Check your bookings calendar for upcoming
          work.
        </p>
        <Button asChild className="mt-4" size="sm" variant="outline">
          <Link href="/dashboard/pro/bookings">
            View Bookings
            <HugeiconsIcon className="ml-1 h-4 w-4" icon={ArrowRight01Icon} />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}

function UrgencyTaskBoardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {[0, 1].map((i) => (
        <div className="animate-pulse rounded-lg border border-border bg-muted/50 p-4" key={i}>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-muted" />
            <div className="h-4 w-24 rounded bg-muted" />
          </div>
          <div className="space-y-3">
            {[0, 1].map((j) => (
              <div className="flex items-center justify-between rounded-lg bg-card p-3" key={j}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 rounded bg-muted" />
                    <div className="h-3 w-24 rounded bg-muted" />
                  </div>
                </div>
                <div className="h-8 w-20 rounded-lg bg-muted" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

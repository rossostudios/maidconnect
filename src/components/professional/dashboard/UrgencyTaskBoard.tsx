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
    icon: React.ComponentType;
  }
> = {
  urgent: {
    label: "Requires Action",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-700",
    badgeClass: "border-red-200 bg-red-100 text-red-700",
    icon: Clock01Icon,
  },
  important: {
    label: "Important",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    textColor: "text-orange-700",
    badgeClass: "border-orange-200 bg-orange-100 text-orange-700",
    icon: Calendar03Icon,
  },
  normal: {
    label: "Upcoming",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
    badgeClass: "border-blue-200 bg-blue-100 text-blue-700",
    icon: CheckmarkCircle02Icon,
  },
};

const taskTypeIcons: Record<TaskType, React.ComponentType> = {
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
      <div className={cn("rounded-lg border border-neutral-200 bg-white p-6", className)}>
        <p className="text-center text-neutral-500 text-sm">{error}</p>
      </div>
    );
  }

  // No tasks at all
  if (!data || data.summary.total === 0) {
    return <NoTasksState className={className} />;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {data.groups.map((group, groupIndex) => (
        <TaskGroupSection key={group.level} group={group} index={groupIndex} />
      ))}
    </div>
  );
}

type TaskGroupSectionProps = {
  group: TaskGroup;
  index: number;
};

function TaskGroupSection({ group, index }: TaskGroupSectionProps) {
  const config = urgencyConfig[group.level];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={cn("rounded-lg border", config.borderColor, config.bgColor)}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={config.icon} className={cn("h-4 w-4", config.textColor)} />
          <h3 className={cn("font-semibold text-sm", config.textColor, geistSans.className)}>
            {config.label}
          </h3>
          <Badge className={cn("ml-1", config.badgeClass)} size="sm" variant="outline">
            {group.tasks.length}
          </Badge>
        </div>
      </div>

      {/* Task List */}
      <div className="divide-y divide-neutral-200/50">
        {group.tasks.map((task, taskIndex) => (
          <TaskCard key={task.id} task={task} urgency={group.level} index={taskIndex} />
        ))}
      </div>
    </motion.div>
  );
}

type TaskCardProps = {
  task: Task;
  urgency: UrgencyLevel;
  index: number;
};

function TaskCard({ task, urgency, index }: TaskCardProps) {
  const TaskIcon = taskTypeIcons[task.type] || Calendar03Icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="flex items-center justify-between bg-white/80 px-4 py-3"
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            urgency === "urgent"
              ? "bg-red-100 text-red-600"
              : urgency === "important"
                ? "bg-orange-100 text-orange-600"
                : "bg-blue-100 text-blue-600"
          )}
        >
          <HugeiconsIcon icon={TaskIcon} className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className={cn("font-medium text-neutral-900 text-sm", geistSans.className)}>
            {task.title}
          </p>
          <div className="flex items-center gap-2 text-xs">
            {task.customerName && (
              <span className="flex items-center gap-1 text-neutral-600">
                <HugeiconsIcon icon={UserIcon} className="h-3 w-3" />
                {task.customerName}
              </span>
            )}
            {task.scheduledTime && (
              <span className="text-neutral-500">• {task.scheduledTime}</span>
            )}
            {task.timeUntil && (
              <Badge
                className={cn(
                  "ml-1",
                  urgency === "urgent"
                    ? "border-red-200 bg-red-100 text-red-700"
                    : "border-neutral-200 bg-neutral-100 text-neutral-600"
                )}
                size="sm"
                variant="outline"
              >
                {task.timeUntil}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Button asChild size="sm" variant={urgency === "urgent" ? "default" : "outline"}>
        <Link href={task.actionHref}>
          {task.actionLabel}
          <HugeiconsIcon icon={ArrowRight01Icon} className="ml-1 h-4 w-4" />
        </Link>
      </Button>
    </motion.div>
  );
}

function NoTasksState({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("rounded-lg border border-green-200 bg-green-50 p-6", className)}
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-6 w-6 text-green-600" />
        </div>
        <h3 className={cn("font-semibold text-green-800 text-sm", geistSans.className)}>
          All caught up!
        </h3>
        <p className="mt-1 max-w-xs text-green-700 text-xs">
          No tasks requiring your attention right now. Check your bookings calendar for upcoming work.
        </p>
        <Button asChild className="mt-4" size="sm" variant="outline">
          <Link href="/dashboard/pro/bookings">
            View Bookings
            <HugeiconsIcon icon={ArrowRight01Icon} className="ml-1 h-4 w-4" />
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
        <div key={i} className="animate-pulse rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-neutral-200" />
            <div className="h-4 w-24 rounded bg-neutral-200" />
          </div>
          <div className="space-y-3">
            {[0, 1].map((j) => (
              <div key={j} className="flex items-center justify-between rounded-lg bg-white p-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-neutral-200" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 rounded bg-neutral-200" />
                    <div className="h-3 w-24 rounded bg-neutral-200" />
                  </div>
                </div>
                <div className="h-8 w-20 rounded-lg bg-neutral-200" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

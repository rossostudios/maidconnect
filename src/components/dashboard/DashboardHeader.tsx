"use client";

import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /**
   * User's name for personalized greeting
   */
  userName?: string;
  /**
   * Custom greeting text (overrides default)
   */
  greeting?: string;
  /**
   * Statistics or quick info to display
   * Example: "3 new leads, 2 follow-ups due"
   */
  stats?: string;
  /**
   * Action buttons/elements to display on the right
   */
  actions?: React.ReactNode;
}

/**
 * DashboardHeader - Welcome section for dashboards
 *
 * @example
 * ```tsx
 * <DashboardHeader
 *   userName="John"
 *   stats="3 new leads, 2 follow-ups due"
 *   actions={<Button>Download</Button>}
 * />
 * ```
 */
export function DashboardHeader({
  userName,
  greeting,
  stats,
  actions,
  className,
  ...props
}: DashboardHeaderProps) {
  const displayGreeting = greeting || (userName ? `Welcome Back, ${userName}!` : "Welcome Back!");

  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
      {...props}
    >
      {/* Left side: Greeting and stats */}
      <div className="space-y-1">
        <h1 className="font-bold text-2xl text-neutral-900 sm:text-3xl">{displayGreeting}</h1>
        {stats && (
          <p className="text-sm text-stone">
            Today you have <span className="font-medium text-neutral-700">{stats}</span>
          </p>
        )}
      </div>

      {/* Right side: Actions */}
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

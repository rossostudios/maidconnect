/**
 * User Activity Panel
 *
 * Displays real-time user activity including:
 * - Online admin count
 * - Active user metrics
 * - Recent platform activity feed
 *
 * Week 3: Real-time Features & Notifications
 */

"use client";

import {
  Alert01Icon,
  Calendar03Icon,
  UserCircleIcon,
  UserGroupIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { geistSans } from "@/app/fonts";
import { useUserActivity } from "@/hooks/use-user-activity";
import { cn } from "@/lib/utils";

type UserActivityPanelProps = {
  /**
   * Whether real-time updates are enabled
   * @default true
   */
  enabled?: boolean;

  /**
   * Current user ID for presence tracking
   */
  currentUserId?: string;
};

/**
 * Format relative time (e.g., "2 minutes ago")
 */
function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) {
    return "just now";
  }
  if (diffMins === 1) {
    return "1 minute ago";
  }
  if (diffMins < 60) {
    return `${diffMins} minutes ago`;
  }
  if (diffHours === 1) {
    return "1 hour ago";
  }
  if (diffHours < 24) {
    return `${diffHours} hours ago`;
  }
  if (diffDays === 1) {
    return "1 day ago";
  }
  return `${diffDays} days ago`;
}

/**
 * Get icon for activity type
 */
function getActivityIcon(type: string) {
  switch (type) {
    case "booking":
      return Calendar03Icon;
    case "user":
      return UserIcon;
    case "professional":
      return UserCircleIcon;
    case "dispute":
      return Alert01Icon;
    default:
      return UserGroupIcon;
  }
}

/**
 * Get color classes for activity type
 */
function getActivityColor(type: string) {
  switch (type) {
    case "booking":
      return "bg-green-50 border-green-200 text-green-700";
    case "user":
      return "bg-babu-50 border-babu-200 text-babu-700";
    case "professional":
      return "bg-rausch-50 border-rausch-500 text-rausch-700";
    case "dispute":
      return "bg-red-50 border-red-200 text-red-700";
    default:
      return "bg-neutral-50 border-neutral-200 text-neutral-700";
  }
}

/**
 * User activity panel for admin dashboard
 *
 * @example
 * ```tsx
 * // In admin dashboard
 * <UserActivityPanel currentUserId={user.id} />
 * ```
 */
export function UserActivityPanel({ enabled = true, currentUserId }: UserActivityPanelProps) {
  const { stats, onlineUsers } = useUserActivity({
    enabled,
    currentUserId,
  });

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className={cn(
              "font-medium text-2xl text-neutral-900 leading-none",
              geistSans.className
            )}
          >
            Real-time Activity
          </h2>
          <p className={cn("text-neutral-600 text-sm leading-none", geistSans.className)}>
            Monitoring active users and sessions
          </p>
        </div>
      </div>

      {/* Activity Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Online Admins */}
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg border border-rausch-200 bg-rausch-50">
            <HugeiconsIcon className="h-4 w-4 text-rausch-500" icon={UserCircleIcon} />
          </div>
          <div className={cn("font-medium text-2xl text-neutral-900", geistSans.className)}>
            {stats.onlineAdmins}
          </div>
          <p
            className={cn(
              "mt-1 font-normal text-neutral-700 text-xs tracking-wide",
              geistSans.className
            )}
          >
            Online Admins
          </p>
        </div>

        {/* Active Customers */}
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50">
            <HugeiconsIcon className="h-4 w-4 text-neutral-700" icon={UserIcon} />
          </div>
          <div className={cn("font-medium text-2xl text-neutral-900", geistSans.className)}>
            {stats.activeCustomers}
          </div>
          <p
            className={cn(
              "mt-1 font-normal text-neutral-700 text-xs tracking-wide",
              geistSans.className
            )}
          >
            Active Customers
          </p>
        </div>

        {/* Active Professionals */}
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50">
            <HugeiconsIcon className="h-4 w-4 text-neutral-700" icon={UserGroupIcon} />
          </div>
          <div className={cn("font-medium text-2xl text-neutral-900", geistSans.className)}>
            {stats.activeProfessionals}
          </div>
          <p
            className={cn(
              "mt-1 font-normal text-neutral-700 text-xs tracking-wide",
              geistSans.className
            )}
          >
            Active Professionals
          </p>
        </div>

        {/* Recent Bookings */}
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50">
            <HugeiconsIcon className="h-4 w-4 text-neutral-700" icon={Calendar03Icon} />
          </div>
          <div className={cn("font-medium text-2xl text-neutral-900", geistSans.className)}>
            {stats.recentBookings}
          </div>
          <p
            className={cn(
              "mt-1 font-normal text-neutral-700 text-xs tracking-wide",
              geistSans.className
            )}
          >
            New Bookings
          </p>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="rounded-lg border border-neutral-200 bg-white">
        {/* Header */}
        <div className="rounded-t-lg border-neutral-200 border-b px-6 py-4">
          <h3
            className={cn(
              "font-medium text-neutral-900 text-xs tracking-wider",
              geistSans.className
            )}
          >
            Recent Activity
          </h3>
        </div>

        {/* Activity List */}
        <div className="max-h-96 overflow-y-auto">
          {stats.recentActivity.length === 0 ? (
            <div className="p-8 text-center">
              <HugeiconsIcon
                className="mx-auto mb-3 h-8 w-8 text-neutral-300"
                icon={UserGroupIcon}
              />
              <p className={cn("font-medium text-neutral-500 text-sm", geistSans.className)}>
                No recent activity
              </p>
              <p
                className={cn("mt-1 text-neutral-400 text-xs tracking-wider", geistSans.className)}
              >
                Activity will appear here in real-time
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {stats.recentActivity.map((activity) => (
                <div
                  className={cn(
                    "flex items-start gap-4 border-l-2 p-4 transition-all hover:bg-neutral-50",
                    getActivityColor(activity.type)
                  )}
                  key={activity.id}
                >
                  {/* Icon */}
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white">
                    <HugeiconsIcon
                      className="h-4 w-4 text-neutral-700"
                      icon={getActivityIcon(activity.type)}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-1">
                    <p
                      className={cn(
                        "font-normal text-neutral-900 text-sm leading-relaxed",
                        geistSans.className
                      )}
                    >
                      {activity.description}
                    </p>
                    <p
                      className={cn(
                        "font-normal text-neutral-500 text-xs tracking-wide",
                        geistSans.className
                      )}
                    >
                      {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>

                  {/* Type Badge */}
                  <div className="flex-shrink-0">
                    <span
                      className={cn(
                        "rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1 font-medium text-xs tracking-wider",
                        geistSans.className
                      )}
                    >
                      {activity.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Last Updated */}
        <div className="rounded-b-lg border-neutral-200 border-t px-6 py-3">
          <p className={cn("text-neutral-500 text-xs tracking-wide", geistSans.className)}>
            Last updated:{" "}
            {stats.lastUpdated ? (
              <time dateTime={stats.lastUpdated}>
                {new Date(stats.lastUpdated).toLocaleTimeString()}
              </time>
            ) : (
              "Syncing..."
            )}
          </p>
        </div>
      </div>

      {/* Online Users List (if any) */}
      {onlineUsers.length > 0 && (
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <h3
            className={cn(
              "mb-4 font-medium text-neutral-900 text-xs tracking-wider",
              geistSans.className
            )}
          >
            Online Now ({onlineUsers.length})
          </h3>
          <div className="space-y-2">
            {onlineUsers.slice(0, 5).map((user, index) => (
              <div className="flex items-center gap-3" key={`${user.user_id}-${index}`}>
                <div className="h-2 w-2 animate-pulse bg-green-500" />
                <span className={cn("font-normal text-neutral-700 text-sm", geistSans.className)}>
                  {user.role || "User"} - {user.page || "Unknown"}
                </span>
                <span
                  className={cn(
                    "ml-auto text-neutral-500 text-xs tracking-wide",
                    geistSans.className
                  )}
                >
                  {formatRelativeTime(user.online_at)}
                </span>
              </div>
            ))}
            {onlineUsers.length > 5 && (
              <p className={cn("mt-2 text-neutral-500 text-xs tracking-wide", geistSans.className)}>
                +{onlineUsers.length - 5} more online
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

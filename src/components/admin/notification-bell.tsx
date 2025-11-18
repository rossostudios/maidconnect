/**
 * Admin Notification Bell
 *
 * Displays real-time notification count and dropdown list.
 * Shows toast alerts for critical events and maintains notification history.
 *
 * Week 3: Real-time Features & Notifications
 */

"use client";

import { Notification03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef, useState } from "react";
import { geistSans } from "@/app/fonts";
import { useAdminNotifications } from "@/hooks/use-admin-notifications";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import type { AdminNotification } from "@/types/admin-notifications";

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

  if (diffMins < 1) return "just now";
  if (diffMins === 1) return "1 minute ago";
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours === 1) return "1 hour ago";
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

/**
 * Get severity color classes for notifications
 */
function getSeverityClasses(severity: AdminNotification["severity"]) {
  switch (severity) {
    case "success":
      return "bg-green-50 border-green-200 text-green-700";
    case "error":
      return "bg-red-50 border-red-200 text-red-700";
    case "warning":
      return "bg-orange-50 border-orange-500 text-orange-700";
    default:
      return "bg-neutral-50 border-neutral-200 text-neutral-700";
  }
}

type NotificationBellProps = {
  /**
   * Whether to enable real-time notifications
   * @default true
   */
  enabled?: boolean;
};

/**
 * Admin notification bell with dropdown
 *
 * @example
 * ```tsx
 * // In admin layout header
 * <NotificationBell />
 * ```
 */
export function NotificationBell({ enabled = true }: NotificationBellProps) {
  const { notifications, unreadCount, clearNotifications, markAllAsRead } = useAdminNotifications({
    enabled,
  });

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Mark as read when opening dropdown
  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  }, [isOpen, unreadCount, markAllAsRead]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white transition-all hover:border-orange-500 hover:bg-orange-50",
          isOpen && "border-orange-500 bg-orange-50"
        )}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <HugeiconsIcon
          className={cn(
            "h-5 w-5 transition-colors",
            isOpen ? "text-orange-600" : "text-neutral-700"
          )}
          icon={Notification03Icon}
        />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="-right-1 -top-1 absolute flex h-5 w-5 items-center justify-center rounded-full bg-orange-500">
            <span className={cn("font-medium text-[10px] text-white", geistSans.className)}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 z-50 mt-2 w-96 rounded-lg border border-neutral-200 bg-white shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-neutral-200 border-b p-4">
            <h3
              className={cn(
                "font-medium text-neutral-900 text-sm tracking-wider",
                geistSans.className
              )}
            >
              Notifications
            </h3>

            {notifications.length > 0 && (
              <button
                className={cn(
                  "font-medium text-[10px] text-neutral-600 tracking-wider hover:text-orange-600",
                  geistSans.className
                )}
                onClick={() => clearNotifications()}
                type="button"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <HugeiconsIcon
                  className="mx-auto mb-3 h-8 w-8 text-neutral-300"
                  icon={Notification03Icon}
                />
                <p className={cn("font-medium text-neutral-500 text-sm", geistSans.className)}>
                  No notifications yet
                </p>
                <p
                  className={cn(
                    "mt-1 text-[10px] text-neutral-400 tracking-wider",
                    geistSans.className
                  )}
                >
                  You'll see real-time alerts here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-200">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClose={() => setIsOpen(false)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Individual notification item
 */
function NotificationItem({
  notification,
  onClose,
}: {
  notification: AdminNotification;
  onClose: () => void;
}) {
  const content = (
    <div
      className={cn(
        "border-l-2 p-4 transition-all hover:bg-neutral-50",
        getSeverityClasses(notification.severity)
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-1">
          <h4
            className={cn(
              "font-medium text-neutral-900 text-xs tracking-wider",
              geistSans.className
            )}
          >
            {notification.title}
          </h4>
          <p
            className={cn(
              "font-normal text-neutral-700 text-sm leading-relaxed",
              geistSans.className
            )}
          >
            {notification.message}
          </p>
          <p
            className={cn(
              "font-normal text-[10px] text-neutral-500 tracking-wide",
              geistSans.className
            )}
          >
            {formatRelativeTime(notification.timestamp)}
          </p>
        </div>
      </div>
    </div>
  );

  if (notification.actionUrl) {
    return (
      <Link href={notification.actionUrl} onClick={onClose}>
        {content}
      </Link>
    );
  }

  return content;
}

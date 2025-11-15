"use client";

import { formatDistanceToNow } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { sanitizeURL } from "@/lib/sanitize";

type Notification = {
  id: string;
  title: string;
  body: string;
  url: string | null;
  tag: string | null;
  read_at: string | null;
  created_at: string;
};

export function NotificationsHistory() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [totalCount, setTotalCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: "50",
        offset: "0",
      });

      if (filter === "unread") {
        params.set("unreadOnly", "true");
      }

      const response = await fetch(`/api/notifications/history?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
      setTotalCount(data.total || 0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark as read");
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notificationIds.includes(notif.id)
            ? { ...notif, read_at: new Date().toISOString() }
            : notif
        )
      );
    } catch (err) {
      // Intentionally suppress errors - UI will remain in current state
      console.warn("Failed to mark notifications as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark all as read");
      }

      // Refresh notifications
      await fetchNotifications();
    } catch (err) {
      // Intentionally suppress errors - UI will remain in current state
      console.warn("Failed to mark all notifications as read:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin border-[neutral-500] border-b-2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-[neutral-500]/30 bg-[neutral-500]/10 p-6 text-[neutral-500] text-base">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Header with filters */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            className={`font-medium text-base transition ${
              filter === "all"
                ? "text-[neutral-900]"
                : "text-[neutral-400] hover:text-[neutral-900]"
            }`}
            onClick={() => setFilter("all")}
            type="button"
          >
            All ({totalCount})
          </button>
          <button
            className={`font-medium text-base transition ${
              filter === "unread"
                ? "text-[neutral-900]"
                : "text-[neutral-400] hover:text-[neutral-900]"
            }`}
            onClick={() => setFilter("unread")}
            type="button"
          >
            Unread ({unreadCount})
          </button>
        </div>
        {unreadCount > 0 && (
          <button
            className="font-medium text-[neutral-500] text-sm transition hover:text-[neutral-500]"
            onClick={markAllAsRead}
            type="button"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications list */}
      {notifications.length === 0 ? (
        <div className="border border-[neutral-200] bg-[neutral-50] p-16 text-center">
          <div className="mx-auto max-w-md">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center bg-[neutral-50]">
                <svg
                  aria-hidden="true"
                  className="h-8 w-8 text-[neutral-400]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
            </div>
            <h3 className="font-semibold text-[neutral-900] text-xl">
              {filter === "unread" ? "All caught up!" : "No notifications yet"}
            </h3>
            <p className="mt-2 text-[neutral-400] text-base">
              {filter === "unread"
                ? "You've read all your notifications"
                : "You'll see notifications here when there's activity on your account"}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              className={`border p-6 transition hover:border-[neutral-500]/30 ${
                notification.read_at
                  ? "border-[neutral-200] bg-[neutral-50]"
                  : "border-[neutral-500]/20 bg-[neutral-500]/5"
              }`}
              key={notification.id}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {notification.url ? (
                    <Link
                      className="block"
                      // snyk:ignore javascript/DOMXSS - URLs are sanitized via sanitizeURL() from @/lib/utils/sanitize
                      href={sanitizeURL(notification.url)}
                      onClick={() => markAsRead([notification.id])}
                    >
                      <h3 className="font-semibold text-[neutral-900] text-base">
                        {notification.title}
                      </h3>
                      <p className="mt-1 text-[neutral-400] text-sm">{notification.body}</p>
                      <p className="mt-2 text-[neutral-400] text-xs">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </Link>
                  ) : (
                    <>
                      <h3 className="font-semibold text-[neutral-900] text-base">
                        {notification.title}
                      </h3>
                      <p className="mt-1 text-[neutral-400] text-sm">{notification.body}</p>
                      <p className="mt-2 text-[neutral-400] text-xs">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </>
                  )}
                </div>

                {!notification.read_at && (
                  <button
                    className="flex-shrink-0 font-medium text-[neutral-500] text-xs transition hover:text-[neutral-500]"
                    onClick={() => markAsRead([notification.id])}
                    type="button"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

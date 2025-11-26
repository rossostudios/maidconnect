"use client";

import { Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { formatDistanceToNow } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "@/components/shared/empty-state";
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
        <HugeiconsIcon className="h-8 w-8 animate-spin text-rausch-500" icon={Loading03Icon} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-base text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Header with filters */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-1">
          <button
            className={`rounded-md px-4 py-2 font-medium text-sm transition ${
              filter === "all"
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
            onClick={() => setFilter("all")}
            type="button"
          >
            All ({totalCount})
          </button>
          <button
            className={`rounded-md px-4 py-2 font-medium text-sm transition ${
              filter === "unread"
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
            onClick={() => setFilter("unread")}
            type="button"
          >
            Unread ({unreadCount})
          </button>
        </div>
        {unreadCount > 0 && (
          <button
            className="rounded-lg bg-rausch-50 px-4 py-2 font-medium text-rausch-600 text-sm transition hover:bg-rausch-100"
            onClick={markAllAsRead}
            type="button"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications list */}
      {notifications.length === 0 ? (
        <EmptyState
          description={
            filter === "unread"
              ? "You've read all your notifications"
              : "You'll see notifications here when there's activity on your account"
          }
          title={filter === "unread" ? "All caught up!" : "No notifications yet"}
          variant="notifications"
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              className={`rounded-lg border p-5 transition ${
                notification.read_at
                  ? "border-neutral-200 bg-white hover:border-neutral-300"
                  : "border-rausch-200 bg-rausch-50/50 hover:border-rausch-300"
              }`}
              key={notification.id}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {/* Unread indicator */}
                  {!notification.read_at && (
                    <span className="mb-2 inline-flex items-center rounded-full bg-rausch-100 px-2 py-0.5 font-medium text-rausch-700 text-xs">
                      New
                    </span>
                  )}
                  {notification.url ? (
                    <Link
                      className="group block"
                      // snyk:ignore javascript/DOMXSS - URLs are sanitized via sanitizeURL() from @/lib/utils/sanitize
                      href={sanitizeURL(notification.url)}
                      onClick={() => markAsRead([notification.id])}
                    >
                      <h3 className="font-semibold text-base text-neutral-900 transition group-hover:text-rausch-600">
                        {notification.title}
                      </h3>
                      <p className="mt-1 text-neutral-600 text-sm">{notification.body}</p>
                      <p className="mt-2 text-neutral-400 text-xs">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </Link>
                  ) : (
                    <>
                      <h3 className="font-semibold text-base text-neutral-900">
                        {notification.title}
                      </h3>
                      <p className="mt-1 text-neutral-600 text-sm">{notification.body}</p>
                      <p className="mt-2 text-neutral-400 text-xs">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </>
                  )}
                </div>

                {!notification.read_at && (
                  <button
                    className="flex-shrink-0 rounded-full bg-neutral-100 px-3 py-1.5 font-medium text-neutral-600 text-xs transition hover:bg-neutral-200"
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

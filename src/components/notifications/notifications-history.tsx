"use client";

import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";

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

  const fetchNotifications = async () => {
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
  };

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
    } catch (_err) {}
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
    } catch (_err) {}
  };

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-[#8B7355] border-b-2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-base text-red-600">
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
              filter === "all" ? "text-[#211f1a]" : "text-[#7d7566] hover:text-[#211f1a]"
            }`}
            onClick={() => setFilter("all")}
            type="button"
          >
            All ({totalCount})
          </button>
          <button
            className={`font-medium text-base transition ${
              filter === "unread" ? "text-[#211f1a]" : "text-[#7d7566] hover:text-[#211f1a]"
            }`}
            onClick={() => setFilter("unread")}
            type="button"
          >
            Unread ({unreadCount})
          </button>
        </div>
        {unreadCount > 0 && (
          <button
            className="font-medium text-[#8B7355] text-sm transition hover:text-[#e54d3c]"
            onClick={markAllAsRead}
            type="button"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications list */}
      {notifications.length === 0 ? (
        <div className="rounded-[28px] border border-[#ebe5d8] bg-white p-16 text-center">
          <div className="mx-auto max-w-md">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ebe5d8]">
                <svg
                  className="h-8 w-8 text-[#7d7566]"
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
            <h3 className="font-semibold text-[#211f1a] text-xl">
              {filter === "unread" ? "All caught up!" : "No notifications yet"}
            </h3>
            <p className="mt-2 text-[#5d574b] text-base">
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
              className={`rounded-2xl border p-6 transition hover:border-[#8B7355]/30 ${
                notification.read_at
                  ? "border-[#ebe5d8] bg-white"
                  : "border-[#8B7355]/20 bg-[#8B7355]/5"
              }`}
              key={notification.id}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {notification.url ? (
                    <Link
                      className="block"
                      href={notification.url}
                      onClick={() => markAsRead([notification.id])}
                    >
                      <h3 className="font-semibold text-[#211f1a] text-base">
                        {notification.title}
                      </h3>
                      <p className="mt-1 text-[#5d574b] text-sm">{notification.body}</p>
                      <p className="mt-2 text-[#7d7566] text-xs">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </Link>
                  ) : (
                    <>
                      <h3 className="font-semibold text-[#211f1a] text-base">
                        {notification.title}
                      </h3>
                      <p className="mt-1 text-[#5d574b] text-sm">{notification.body}</p>
                      <p className="mt-2 text-[#7d7566] text-xs">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </>
                  )}
                </div>

                {!notification.read_at && (
                  <button
                    className="flex-shrink-0 font-medium text-[#8B7355] text-xs transition hover:text-[#e54d3c]"
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

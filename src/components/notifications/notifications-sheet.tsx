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

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function NotificationsSheet({ isOpen, onClose }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("unread");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: "20",
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
    } catch (_err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

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

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-[#ebe5d8] border-b px-6 py-4">
          <h2 className="font-semibold text-[#211f1a] text-xl">Notifications</h2>
          <button
            className="rounded-lg p-2 text-[#7d7566] transition hover:bg-[#ebe5d8]"
            onClick={onClose}
            type="button"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M6 18L18 6M6 6l12 12"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between border-[#ebe5d8] border-b px-6 py-3">
          <div className="flex gap-4">
            <button
              className={`font-medium text-sm transition ${
                filter === "unread" ? "text-[#211f1a]" : "text-[#7d7566] hover:text-[#211f1a]"
              }`}
              onClick={() => setFilter("unread")}
              type="button"
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
            <button
              className={`font-medium text-sm transition ${
                filter === "all" ? "text-[#211f1a]" : "text-[#7d7566] hover:text-[#211f1a]"
              }`}
              onClick={() => setFilter("all")}
              type="button"
            >
              All
            </button>
          </div>
          {unreadCount > 0 && (
            <button
              className="font-medium text-[#8B7355] text-xs transition hover:text-[#e54d3c]"
              onClick={markAllAsRead}
              type="button"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="h-8 w-8 animate-spin rounded-full border-[#8B7355] border-b-2" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#ebe5d8]">
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
              <h3 className="font-semibold text-[#211f1a] text-base">
                {filter === "unread" ? "All caught up!" : "No notifications"}
              </h3>
              <p className="mt-1 text-center text-[#7d7566] text-sm">
                {filter === "unread"
                  ? "You've read all your notifications"
                  : "You'll see notifications here when there's activity"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#ebe5d8]">
              {notifications.map((notification) => (
                <div
                  className={`p-4 transition hover:bg-[#fbfaf9] ${
                    notification.read_at ? "" : "bg-[#8B7355]/5"
                  }`}
                  key={notification.id}
                >
                  {notification.url ? (
                    <Link
                      className="block"
                      href={notification.url}
                      onClick={() => {
                        markAsRead([notification.id]);
                        onClose();
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[#211f1a] text-sm">
                            {notification.title}
                          </p>
                          <p className="mt-1 text-[#5d574b] text-sm">{notification.body}</p>
                          <p className="mt-1 text-[#7d7566] text-xs">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        {!notification.read_at && (
                          <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#8B7355]" />
                        )}
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[#211f1a] text-sm">{notification.title}</p>
                        <p className="mt-1 text-[#5d574b] text-sm">{notification.body}</p>
                        <p className="mt-1 text-[#7d7566] text-xs">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      {!notification.read_at && (
                        <button
                          className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#8B7355] transition hover:bg-[#e54d3c]"
                          onClick={() => markAsRead([notification.id])}
                          type="button"
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

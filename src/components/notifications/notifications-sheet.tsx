"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

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

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, filter]);

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
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

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
      console.error("Failed to mark as read:", err);
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
      console.error("Failed to mark all as read:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ebe5d8] px-6 py-4">
          <h2 className="text-xl font-semibold text-[#211f1a]">Notifications</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#7d7566] transition hover:bg-[#ebe5d8]"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between border-b border-[#ebe5d8] px-6 py-3">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter("unread")}
              className={`text-sm font-medium transition ${
                filter === "unread"
                  ? "text-[#211f1a]"
                  : "text-[#7d7566] hover:text-[#211f1a]"
              }`}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`text-sm font-medium transition ${
                filter === "all"
                  ? "text-[#211f1a]"
                  : "text-[#7d7566] hover:text-[#211f1a]"
              }`}
            >
              All
            </button>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs font-medium text-[#ff5d46] transition hover:text-[#e54d3c]"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#ff5d46]"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#ebe5d8]">
                <svg className="h-8 w-8 text-[#7d7566]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-[#211f1a]">
                {filter === "unread" ? "All caught up!" : "No notifications"}
              </h3>
              <p className="mt-1 text-center text-sm text-[#7d7566]">
                {filter === "unread"
                  ? "You've read all your notifications"
                  : "You'll see notifications here when there's activity"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#ebe5d8]">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 transition hover:bg-[#fbfaf9] ${
                    !notification.read_at ? "bg-[#ff5d46]/5" : ""
                  }`}
                >
                  {notification.url ? (
                    <Link
                      href={notification.url}
                      onClick={() => {
                        markAsRead([notification.id]);
                        onClose();
                      }}
                      className="block"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[#211f1a]">
                            {notification.title}
                          </p>
                          <p className="mt-1 text-sm text-[#5d574b]">
                            {notification.body}
                          </p>
                          <p className="mt-1 text-xs text-[#7d7566]">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        {!notification.read_at && (
                          <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#ff5d46]" />
                        )}
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#211f1a]">
                          {notification.title}
                        </p>
                        <p className="mt-1 text-sm text-[#5d574b]">
                          {notification.body}
                        </p>
                        <p className="mt-1 text-xs text-[#7d7566]">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      {!notification.read_at && (
                        <button
                          onClick={() => markAsRead([notification.id])}
                          className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#ff5d46] transition hover:bg-[#e54d3c]"
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

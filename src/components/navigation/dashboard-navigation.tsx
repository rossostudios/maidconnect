"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUnreadCount } from "@/hooks/use-unread-count";
import { useNotificationUnreadCount } from "@/hooks/use-notification-unread-count";
import { NotificationsSheet } from "@/components/notifications/notifications-sheet";

type NavLink = {
  href: string;
  label: string;
  showBadge?: boolean;
};

type Props = {
  navLinks: NavLink[];
  userRole: "customer" | "professional";
};

export function DashboardNavigation({ navLinks, userRole }: Props) {
  const pathname = usePathname();
  const { unreadCount } = useUnreadCount();
  const { unreadCount: notificationUnreadCount, refresh } = useNotificationUnreadCount();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const handleCloseNotifications = () => {
    setIsNotificationsOpen(false);
    // Refresh count when closing to pick up any newly read notifications
    refresh();
  };

  const messagesHref = userRole === "customer" ? "/dashboard/customer/messages" : "/dashboard/pro/messages";

  const isActive = (href: string) => {
    // Handle hash links (e.g., #addresses, #favorites)
    if (href.includes("#")) {
      const basePath = href.split("#")[0];
      return pathname === basePath;
    }
    // Exact match for regular links
    return pathname === href;
  };

  return (
    <>
      <nav className="flex items-center gap-6 text-sm font-medium text-[#524d43]">
        {navLinks.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative pb-1 transition hover:text-[#ff5d46] ${
                active
                  ? "font-semibold text-[#ff5d46] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#ff5d46] after:content-['']"
                  : ""
              }`}
            >
              {item.label}
            </Link>
          );
        })}

        {/* Messages Icon */}
        <Link
          href={messagesHref}
          className={`relative rounded-lg p-1.5 transition hover:bg-[#ebe5d8] hover:text-[#ff5d46] ${
            pathname === messagesHref
              ? "bg-[#fff5f2] text-[#ff5d46]"
              : "text-[#524d43]"
          }`}
          aria-label={`Messages${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute right-0 top-0 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#ff5d46] px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {/* Notifications Icon */}
        <button
          onClick={() => setIsNotificationsOpen(true)}
          className="relative rounded-lg p-1.5 text-[#524d43] transition hover:bg-[#ebe5d8] hover:text-[#ff5d46]"
          aria-label={`Notifications${notificationUnreadCount > 0 ? ` (${notificationUnreadCount} unread)` : ""}`}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {notificationUnreadCount > 0 && (
            <span className="absolute right-0 top-0 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#ff5d46] px-1 text-[10px] font-bold text-white">
              {notificationUnreadCount > 9 ? "9+" : notificationUnreadCount}
            </span>
          )}
        </button>
      </nav>

      <NotificationsSheet isOpen={isNotificationsOpen} onClose={handleCloseNotifications} />
    </>
  );
}

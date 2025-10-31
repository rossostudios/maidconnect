"use client";

import { useEffect, useState } from "react";
import { KeyboardBadge } from "@/components/keyboard-shortcuts/keyboard-badge";
import { NotificationsSheet } from "@/components/notifications/notifications-sheet";
import { useKeyboardShortcutsContext } from "@/components/providers/keyboard-shortcuts-provider";
import { useNotificationUnreadCount } from "@/hooks/use-notification-unread-count";
import { useUnreadCount } from "@/hooks/use-unread-count";
import { Link, usePathname } from "@/i18n/routing";

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
  const { openCommandPalette } = useKeyboardShortcutsContext();
  const [isMac, setIsMac] = useState(false);

  // Detect platform on mount
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
  }, []);

  const handleCloseNotifications = () => {
    setIsNotificationsOpen(false);
    // Refresh count when closing to pick up any newly read notifications
    refresh();
  };

  const messagesHref =
    userRole === "customer" ? "/dashboard/customer/messages" : "/dashboard/pro/messages";

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
      <nav className="flex items-center gap-6 font-medium text-[#524d43] text-sm">
        {navLinks.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              className={`relative pb-1 transition hover:text-[#ff5d46] ${
                active
                  ? "font-semibold text-[#ff5d46] after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:bg-[#ff5d46] after:content-['']"
                  : ""
              }`}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          );
        })}

        {/* Search Button with ⌘K */}
        <button
          aria-label="Search"
          className="group ml-2 flex items-center gap-2 rounded-lg border border-[#dcd6c7] bg-white px-3 py-1.5 text-[#7a6d62] transition hover:border-[#ff5d46] hover:bg-[#fff5f2] hover:text-[#ff5d46]"
          onClick={openCommandPalette}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
          <span className="text-xs">Search</span>
          <KeyboardBadge className="ml-1" keys={[isMac ? "⌘" : "Ctrl", "K"]} size="sm" />
        </button>

        {/* Messages Icon */}
        <Link
          aria-label={`Messages${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
          className={`relative rounded-lg p-1.5 transition hover:bg-[#ebe5d8] hover:text-[#ff5d46] ${
            pathname === messagesHref ? "bg-[#fff5f2] text-[#ff5d46]" : "text-[#524d43]"
          }`}
          href={messagesHref}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#ff5d46] px-1 font-bold text-[10px] text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {/* Notifications Icon */}
        <button
          aria-label={`Notifications${notificationUnreadCount > 0 ? ` (${notificationUnreadCount} unread)` : ""}`}
          className="relative rounded-lg p-1.5 text-[#524d43] transition hover:bg-[#ebe5d8] hover:text-[#ff5d46]"
          onClick={() => setIsNotificationsOpen(true)}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
          {notificationUnreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#ff5d46] px-1 font-bold text-[10px] text-white">
              {notificationUnreadCount > 9 ? "9+" : notificationUnreadCount}
            </span>
          )}
        </button>
      </nav>

      <NotificationsSheet isOpen={isNotificationsOpen} onClose={handleCloseNotifications} />
    </>
  );
}

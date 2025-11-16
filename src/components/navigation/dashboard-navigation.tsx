"use client";

import { Logout01Icon, Message01Icon, Notification01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { DashboardMobileNav } from "@/components/navigation/dashboard-mobile-nav";
import { useNotificationUnreadCount } from "@/hooks/use-notification-unread-count";
import { useUnreadCount } from "@/hooks/use-unread-count";
import { Link, usePathname } from "@/i18n/routing";

// Dynamic import for sheet (lazy load on demand)
const NotificationsSheet = dynamic(
  () =>
    import("@/components/notifications/notifications-sheet").then((mod) => mod.NotificationsSheet),
  { ssr: false }
);

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

  const messagesHref =
    userRole === "customer" ? "/dashboard/customer/messages" : "/dashboard/pro/messages";

  // Hrefs for mobile nav
  const dashboardHref = userRole === "customer" ? "/dashboard/customer" : "/dashboard/pro";
  const bookingsHref =
    userRole === "customer" ? "/dashboard/customer/bookings" : "/dashboard/pro/bookings";
  const profileHref = userRole === "customer" ? "/dashboard/customer" : "/dashboard/pro";

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
      {/* Desktop Navigation - Hidden on mobile */}
      <nav className="hidden items-center gap-6 font-medium text-neutral-900 text-sm md:flex">
        {navLinks.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              className={`relative pb-1 transition hover:text-neutral-700 ${
                active
                  ? "font-semibold text-neutral-900 after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:bg-neutral-900 after:content-['']"
                  : ""
              }`}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          );
        })}

        {/* Messages Icon */}
        <Link
          aria-label={`Messages${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
          className={`relative p-1.5 transition hover:bg-neutral-100 hover:text-neutral-900 ${
            pathname === messagesHref ? "bg-neutral-100 text-neutral-900" : "text-neutral-700"
          }`}
          href={messagesHref}
        >
          <HugeiconsIcon className="h-5 w-5" icon={Message01Icon} size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-4 min-w-[16px] items-center justify-center bg-neutral-900 px-1 font-bold text-[10px] text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {/* Notifications Icon */}
        <button
          aria-label={`Notifications${notificationUnreadCount > 0 ? ` (${notificationUnreadCount} unread)` : ""}`}
          className="relative p-1.5 text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-900"
          onClick={() => setIsNotificationsOpen(true)}
          type="button"
        >
          <HugeiconsIcon className="h-5 w-5" icon={Notification01Icon} size={20} />
          {notificationUnreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-4 min-w-[16px] items-center justify-center bg-neutral-900 px-1 font-bold text-[10px] text-white">
              {notificationUnreadCount > 9 ? "9+" : notificationUnreadCount}
            </span>
          )}
        </button>

        {/* Sign Out Button */}
        <Link
          aria-label="Sign out"
          className="flex items-center gap-2 border border-neutral-200 bg-white px-3 py-1.5 text-neutral-600 transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900"
          href="/auth/sign-out"
        >
          <HugeiconsIcon className="h-4 w-4" icon={Logout01Icon} />
          <span className="text-xs">Sign out</span>
        </Link>
      </nav>

      {/* Mobile Bottom Navigation - Shown only on mobile */}
      <DashboardMobileNav
        bookingsHref={bookingsHref}
        dashboardHref={dashboardHref}
        messagesHref={messagesHref}
        onNotificationsClick={() => setIsNotificationsOpen(true)}
        profileHref={profileHref}
        userRole={userRole}
      />

      <NotificationsSheet isOpen={isNotificationsOpen} onClose={handleCloseNotifications} />
    </>
  );
}

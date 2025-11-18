"use client";

import {
  BubbleChatIcon,
  Calendar01Icon,
  Home01Icon,
  Notification02Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useNotificationUnreadCount } from "@/hooks/use-notification-unread-count";
import { useUnreadCount } from "@/hooks/use-unread-count";
import { Link, usePathname } from "@/i18n/routing";

type Props = {
  userRole: "customer" | "professional";
  dashboardHref: string;
  bookingsHref: string;
  messagesHref: string;
  profileHref: string;
  onNotificationsClick: () => void;
};

export function DashboardMobileNav({
  userRole,
  dashboardHref,
  bookingsHref,
  messagesHref,
  profileHref,
  onNotificationsClick,
}: Props) {
  const pathname = usePathname();
  const { unreadCount } = useUnreadCount();
  const { unreadCount: notificationUnreadCount } = useNotificationUnreadCount();

  const isActive = (href: string) => {
    // Handle hash links
    if (href.includes("#")) {
      const basePath = href.split("#")[0];
      return pathname === basePath;
    }
    // Handle bookings paths (includes sub-pages)
    if (href.includes("bookings")) {
      return pathname.includes("bookings");
    }
    // Handle messages paths
    if (href.includes("messages")) {
      return pathname.includes("messages");
    }
    // Exact match
    return pathname === href;
  };

  const navItems = [
    {
      href: dashboardHref,
      label: "Home",
      icon: Home01Icon,
      active: pathname === dashboardHref,
    },
    {
      href: bookingsHref,
      label: userRole === "customer" ? "Bookings" : "Jobs",
      icon: Calendar01Icon,
      active: isActive(bookingsHref),
    },
    {
      href: messagesHref,
      label: "Messages",
      icon: BubbleChatIcon,
      active: isActive(messagesHref),
      badge: unreadCount,
    },
    {
      href: null, // Button instead of link
      label: "Alerts",
      icon: Notification02Icon,
      active: false,
      badge: notificationUnreadCount,
      onClick: onNotificationsClick,
    },
    {
      href: profileHref,
      label: "Profile",
      icon: UserIcon,
      active: isActive(profileHref),
    },
  ];

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-40 border-neutral-200 border-t bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.05)] md:hidden">
      <div className="mx-auto flex max-w-screen-xl">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isItemActive = item.active;

          if (item.onClick) {
            // Button for notifications
            return (
              <button
                className="relative flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-colors active:scale-95"
                key={item.label}
                onClick={item.onClick}
                type="button"
              >
                <div className="relative">
                  <HugeiconsIcon
                    className={`h-6 w-6 ${isItemActive ? "text-neutral-900" : "text-neutral-600"}`}
                    icon={IconComponent}
                  />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="-right-1 -top-1 absolute flex h-5 min-w-[18px] items-center justify-center bg-neutral-900 px-1.5 font-bold text-white text-xs">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs ${isItemActive ? "font-semibold text-neutral-900" : "text-neutral-600"}`}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          // Link for navigation items
          return (
            <Link
              className="relative flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-colors active:scale-95"
              href={item.href!}
              key={item.label}
            >
              <div className="relative">
                <HugeiconsIcon
                  className={`h-6 w-6 ${isItemActive ? "text-neutral-900" : "text-neutral-600"}`}
                  icon={IconComponent}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="-right-1 -top-1 absolute flex h-5 min-w-[18px] items-center justify-center bg-neutral-900 px-1.5 font-bold text-white text-xs">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-xs ${isItemActive ? "font-semibold text-neutral-900" : "text-neutral-600"}`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

"use client";

import { Bell, Calendar, Home, MessageCircle, User } from "lucide-react";
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
      icon: Home,
      active: pathname === dashboardHref,
    },
    {
      href: bookingsHref,
      label: userRole === "customer" ? "Bookings" : "Jobs",
      icon: Calendar,
      active: isActive(bookingsHref),
    },
    {
      href: messagesHref,
      label: "Messages",
      icon: MessageCircle,
      active: isActive(messagesHref),
      badge: unreadCount,
    },
    {
      href: null, // Button instead of link
      label: "Alerts",
      icon: Bell,
      active: false,
      badge: notificationUnreadCount,
      onClick: onNotificationsClick,
    },
    {
      href: profileHref,
      label: "Profile",
      icon: User,
      active: isActive(profileHref),
    },
  ];

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-40 border-[#ebe5d8] border-t bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.08)] md:hidden">
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
                  <IconComponent
                    className={`h-6 w-6 ${isItemActive ? "text-[#8B7355]" : "text-[#7a6d62]"}`}
                  />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="-top-1 -right-1 absolute flex h-5 min-w-[18px] items-center justify-center rounded-full bg-[#8B7355] px-1.5 font-bold text-[10px] text-white">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs ${isItemActive ? "font-semibold text-[#8B7355]" : "text-[#7a6d62]"}`}
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
                <IconComponent
                  className={`h-6 w-6 ${isItemActive ? "text-[#8B7355]" : "text-[#7a6d62]"}`}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="-top-1 -right-1 absolute flex h-5 min-w-[18px] items-center justify-center rounded-full bg-[#8B7355] px-1.5 font-bold text-[10px] text-white">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-xs ${isItemActive ? "font-semibold text-[#8B7355]" : "text-[#7a6d62]"}`}
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

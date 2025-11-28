"use client";

/**
 * Customer Airbnb Shell Component
 *
 * Unified layout shell for customer dashboard with Airbnb-style navigation.
 * Combines sidebar (desktop), bottom nav (mobile), and header with profile dropdown.
 *
 * Layout:
 * - Desktop: 240px sidebar + content area
 * - Mobile: Bottom navigation + content area
 */

import {
  Calendar03Icon,
  FavouriteIcon,
  Home09Icon,
  Message01Icon,
  Notification02Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useLocale } from "next-intl";
import { type ReactNode, useState } from "react";
import { geistSans } from "@/app/fonts";
import { AirbnbBottomNav } from "@/components/navigation/airbnb-bottom-nav";
import {
  AirbnbProfileDropdown,
  type ProfileDropdownUser,
} from "@/components/navigation/airbnb-profile-dropdown";
import type { NavItem } from "@/components/navigation/airbnb-sidebar-item";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { NotificationsSheet } from "@/components/notifications/notifications-sheet";
import { useNotificationUnreadCount } from "@/hooks/use-notification-unread-count";
import { cn } from "@/lib/utils/core";
import { CustomerAirbnbSidebar } from "./customer-airbnb-sidebar";

export type CustomerAirbnbShellProps = {
  children: ReactNode;
  userEmail?: string;
  userName?: string;
  userAvatarUrl?: string;
  unreadMessagesCount?: number;
};

export function CustomerAirbnbShell({
  children,
  userEmail,
  userName,
  userAvatarUrl,
  unreadMessagesCount = 0,
}: CustomerAirbnbShellProps) {
  const locale = useLocale();
  const [showNotifications, setShowNotifications] = useState(false);
  const { unreadCount: notificationUnreadCount } = useNotificationUnreadCount();

  // User for profile dropdown
  const user: ProfileDropdownUser = {
    name: userName ?? "Customer",
    email: userEmail ?? "",
    avatarUrl: userAvatarUrl,
    role: "customer",
  };

  // Mobile bottom navigation items (5 max)
  const bottomNavItems: NavItem[] = [
    {
      href: `/${locale}/dashboard/customer`,
      label: "Home",
      icon: Home09Icon,
    },
    {
      href: `/${locale}/dashboard/customer/bookings`,
      label: "Bookings",
      icon: Calendar03Icon,
    },
    {
      href: `/${locale}/dashboard/customer/messages`,
      label: "Messages",
      icon: Message01Icon,
      badge: unreadMessagesCount,
    },
    {
      href: `/${locale}/dashboard/customer/favorites`,
      label: "Saved",
      icon: FavouriteIcon,
    },
    {
      href: `/${locale}/dashboard/customer/settings`,
      label: "Profile",
      icon: UserCircleIcon,
    },
  ];

  return (
    <div className={cn("flex h-screen overflow-hidden bg-white", geistSans.className)}>
      {/* Sidebar - Desktop Only (240px) */}
      <CustomerAirbnbSidebar unreadMessagesCount={unreadMessagesCount} />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 border-neutral-200 border-b bg-white">
          <div className="flex h-14 items-center justify-between px-4 lg:px-8">
            {/* Left: Breadcrumbs */}
            <div className="flex min-w-0 flex-1 items-center">
              <Breadcrumbs />
            </div>

            {/* Right: Notifications + Profile */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <button
                aria-label="Notifications"
                className="relative rounded-lg p-2 text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500 focus-visible:ring-offset-2"
                onClick={() => setShowNotifications(true)}
                type="button"
              >
                <HugeiconsIcon className="h-5 w-5" icon={Notification02Icon} />
                {notificationUnreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rausch-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-rausch-500" />
                  </span>
                )}
              </button>

              {/* Profile Dropdown */}
              <AirbnbProfileDropdown
                settingsBasePath={`/${locale}/dashboard/account`}
                user={user}
              />
            </div>
          </div>
        </header>

        {/* Main Content - Scrollable */}
        <main
          className={cn(
            "flex-1 overflow-y-auto bg-neutral-50 px-4 py-6 lg:px-8",
            "pb-20 lg:pb-6" // Extra padding on mobile for bottom nav
          )}
          id="main-content"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <AirbnbBottomNav items={bottomNavItems} />

      {/* Notifications Sheet */}
      <NotificationsSheet isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </div>
  );
}

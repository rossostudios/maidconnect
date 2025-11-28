"use client";

/**
 * Pro Airbnb Shell Component
 *
 * Unified layout shell for professional dashboard with Airbnb-style navigation.
 * Combines sidebar (desktop), bottom nav (mobile), and header with notifications.
 * Profile access is via mobile bottom nav or desktop sidebar.
 *
 * Layout:
 * - Desktop: 240px sidebar + content area
 * - Mobile: Bottom navigation + content area
 */

import {
  Calendar03Icon,
  DollarCircleIcon,
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
import type { NavItem } from "@/components/navigation/airbnb-sidebar-item";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { NotificationsSheet } from "@/components/notifications/notifications-sheet";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useNotificationUnreadCount } from "@/hooks/use-notification-unread-count";
import { cn } from "@/lib/utils/core";
import { ProAirbnbSidebar } from "./pro-airbnb-sidebar";

type OnboardingStatus =
  | "application_pending"
  | "application_in_review"
  | "approved"
  | "active"
  | "suspended";

export type ProAirbnbShellProps = {
  children: ReactNode;
  pendingLeadsCount?: number;
  unreadMessagesCount?: number;
  onboardingStatus?: OnboardingStatus;
  onboardingCompletion?: number;
};

export function ProAirbnbShell({
  children,
  pendingLeadsCount = 0,
  unreadMessagesCount = 0,
  onboardingStatus = "active",
  onboardingCompletion = 100,
}: ProAirbnbShellProps) {
  const locale = useLocale();
  const [showNotifications, setShowNotifications] = useState(false);
  const { unreadCount: notificationUnreadCount } = useNotificationUnreadCount();

  // Mobile bottom navigation items (5 max)
  const bottomNavItems: NavItem[] = [
    {
      href: `/${locale}/dashboard/pro`,
      label: "Today",
      icon: Home09Icon,
    },
    {
      href: `/${locale}/dashboard/pro/bookings`,
      label: "Bookings",
      icon: Calendar03Icon,
    },
    {
      href: `/${locale}/dashboard/pro/messages`,
      label: "Messages",
      icon: Message01Icon,
      badge: unreadMessagesCount + pendingLeadsCount,
    },
    {
      href: `/${locale}/dashboard/pro/finances`,
      label: "Finances",
      icon: DollarCircleIcon,
    },
    {
      href: `/${locale}/dashboard/pro/profile`,
      label: "Profile",
      icon: UserCircleIcon,
    },
  ];

  // Show onboarding banner if not complete
  const showOnboardingBanner = onboardingStatus !== "active" && onboardingCompletion < 100;

  return (
    <div className={cn("flex h-screen overflow-hidden bg-background", geistSans.className)}>
      {/* Sidebar - Desktop Only (240px) */}
      <ProAirbnbSidebar
        pendingLeadsCount={pendingLeadsCount}
        unreadMessagesCount={unreadMessagesCount}
      />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Onboarding Banner */}
        {showOnboardingBanner && (
          <div className="flex items-center border-rausch-200 border-b bg-rausch-50 px-4 py-3 lg:px-8 dark:border-rausch-900/50 dark:bg-rausch-900/20">
            <p className="text-rausch-700 text-sm">
              <span className="font-medium">Complete your profile</span>
              <span className="mx-2">·</span>
              <span>{onboardingCompletion}% complete</span>
              <a
                className="ml-2 font-medium text-rausch-600 underline hover:text-rausch-700"
                href={`/${locale}/dashboard/pro/onboarding`}
              >
                Continue setup →
              </a>
            </p>
          </div>
        )}

        {/* Header */}
        <header className="sticky top-0 z-30 border-border border-b bg-background">
          <div className="flex h-14 items-center justify-between px-4 lg:px-8">
            {/* Left: Breadcrumbs */}
            <div className="flex min-w-0 flex-1 items-center">
              <Breadcrumbs />
            </div>

            {/* Right: Notifications + Profile */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {/* Notifications */}
              <button
                aria-label="Notifications"
                className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500 focus-visible:ring-offset-2"
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
            </div>
          </div>
        </header>

        {/* Main Content - Scrollable */}
        <main
          className={cn(
            "flex-1 overflow-y-auto bg-muted/30 px-4 py-6 lg:px-8",
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

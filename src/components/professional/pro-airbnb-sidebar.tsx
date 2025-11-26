"use client";

/**
 * Pro Airbnb Sidebar Component
 *
 * Professional dashboard navigation configuration for the Airbnb-style sidebar.
 * 5 main items + Settings pinned to bottom.
 *
 * Navigation:
 * - Today: Dashboard overview
 * - Bookings: All bookings + calendar + availability management (via sheet)
 * - Messages: With unread badge
 * - Finances: Earnings & payouts
 * - Portfolio: Work showcase
 * - Settings: Account settings (pinned to bottom)
 *
 * Note: Availability management moved to "Update Availability" button in Bookings page
 */

import {
  Calendar03Icon,
  DollarCircleIcon,
  Home09Icon,
  Image02Icon,
  Message01Icon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";
import { useLocale } from "next-intl";
import { AirbnbSidebar } from "@/components/navigation/airbnb-sidebar";
import type { NavItem } from "@/components/navigation/airbnb-sidebar-item";

export type ProAirbnbSidebarProps = {
  /** Number of unread messages */
  unreadMessagesCount?: number;
  /** Number of pending leads (shown as badge on Messages) */
  pendingLeadsCount?: number;
  /** Base path for navigation links */
  basePath?: string;
  /** Additional CSS classes */
  className?: string;
};

export function ProAirbnbSidebar({
  unreadMessagesCount = 0,
  pendingLeadsCount = 0,
  basePath,
  className,
}: ProAirbnbSidebarProps) {
  const locale = useLocale();

  // Build basePath with locale prefix
  const resolvedBasePath = basePath ?? `/${locale}/dashboard/pro`;

  // Combined badge: unread messages + pending leads
  const messagesBadge = unreadMessagesCount + pendingLeadsCount;

  const mainItems: NavItem[] = [
    {
      href: resolvedBasePath,
      label: "Today",
      icon: Home09Icon,
    },
    {
      href: `${resolvedBasePath}/bookings`,
      label: "Bookings",
      icon: Calendar03Icon,
    },
    {
      href: `${resolvedBasePath}/messages`,
      label: "Messages",
      icon: Message01Icon,
      badge: messagesBadge > 0 ? messagesBadge : undefined,
    },
    {
      href: `${resolvedBasePath}/finances`,
      label: "Finances",
      icon: DollarCircleIcon,
    },
    {
      href: `${resolvedBasePath}/portfolio`,
      label: "Portfolio",
      icon: Image02Icon,
    },
  ];

  const bottomItems: NavItem[] = [
    {
      href: `${resolvedBasePath}/settings`,
      label: "Settings",
      icon: Settings02Icon,
      pinToBottom: true,
    },
  ];

  return (
    <AirbnbSidebar
      bottomItems={bottomItems}
      className={className}
      items={mainItems}
      logoHref={resolvedBasePath}
    />
  );
}

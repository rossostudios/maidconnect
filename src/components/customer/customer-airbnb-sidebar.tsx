"use client";

/**
 * Customer Airbnb Sidebar Component
 *
 * Customer dashboard navigation configuration for the Airbnb-style sidebar.
 * 5 main items + Settings pinned to bottom.
 *
 * Navigation:
 * - Home: Dashboard overview
 * - Bookings: All appointments
 * - Messages: With unread badge
 * - Saved: Favorite professionals
 * - Plans: Recurring plans
 * - Settings: Account settings (pinned to bottom)
 */

import {
  Calendar03Icon,
  FavouriteIcon,
  Home09Icon,
  Message01Icon,
  RepeatIcon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";
import { useLocale } from "next-intl";
import { AirbnbSidebar } from "@/components/navigation/airbnb-sidebar";
import type { NavItem } from "@/components/navigation/airbnb-sidebar-item";

export type CustomerAirbnbSidebarProps = {
  /** Number of unread messages */
  unreadMessagesCount?: number;
  /** Base path for navigation links */
  basePath?: string;
  /** Additional CSS classes */
  className?: string;
};

export function CustomerAirbnbSidebar({
  unreadMessagesCount = 0,
  basePath,
  className,
}: CustomerAirbnbSidebarProps) {
  const locale = useLocale();

  // Build basePath with locale prefix
  const resolvedBasePath = basePath ?? `/${locale}/dashboard/customer`;

  const mainItems: NavItem[] = [
    {
      href: resolvedBasePath,
      label: "Home",
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
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
    },
    {
      href: `${resolvedBasePath}/favorites`,
      label: "Saved",
      icon: FavouriteIcon,
    },
    {
      href: `${resolvedBasePath}/plans`,
      label: "Plans",
      icon: RepeatIcon,
    },
  ];

  const bottomItems: NavItem[] = [
    {
      href: `/${locale}/dashboard/account/settings`,
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

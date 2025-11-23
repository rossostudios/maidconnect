"use client";

import {
  Alert01Icon,
  Calendar03Icon,
  CreditCardIcon,
  CrownIcon,
  FavouriteIcon,
  GiftIcon,
  HelpCircleIcon,
  Home09Icon,
  Location01Icon,
  MenuTwoLineIcon,
  Message01Icon,
  Notification03Icon,
  RepeatIcon,
  Settings02Icon,
  StarIcon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useState } from "react";
import { geistSans } from "@/app/fonts";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import type { HugeIcon } from "@/types/icons";

type NavItem = {
  href: string;
  label: string;
  icon: HugeIcon;
  badge?: number;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { href: "/dashboard/customer", label: "Dashboard", icon: Home09Icon },
      { href: "/dashboard/customer/bookings", label: "Bookings", icon: Calendar03Icon },
      { href: "/dashboard/customer/messages", label: "Messages", icon: Message01Icon },
      {
        href: "/dashboard/customer/notifications",
        label: "Notifications",
        icon: Notification03Icon,
      },
    ],
  },
  {
    title: "Services",
    items: [
      { href: "/dashboard/customer/favorites", label: "Favorites", icon: FavouriteIcon },
      { href: "/dashboard/customer/reviews", label: "Reviews", icon: StarIcon },
      { href: "/dashboard/customer/recurring-plans", label: "Recurring Plans", icon: RepeatIcon },
    ],
  },
  {
    title: "Account",
    items: [
      { href: "/dashboard/customer/subscription", label: "Subscription", icon: CrownIcon },
      { href: "/dashboard/referrals", label: "Referrals", icon: GiftIcon },
      { href: "/dashboard/customer/addresses", label: "Addresses", icon: Location01Icon },
      { href: "/dashboard/customer/payments", label: "Payments", icon: CreditCardIcon },
      { href: "/dashboard/customer/disputes", label: "Disputes", icon: Alert01Icon },
      { href: "/dashboard/customer/help", label: "Help & Support", icon: HelpCircleIcon },
      { href: "/dashboard/customer/settings", label: "Settings", icon: Settings02Icon },
    ],
  },
];

type Props = {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onClose?: () => void;
  unreadMessagesCount?: number;
  userEmail?: string;
  userName?: string;
  userAvatarUrl?: string;
};

export function CustomerSidebar({
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
  onClose,
  unreadMessagesCount = 0,
  userEmail,
  userName,
  userAvatarUrl,
}: Props) {
  const pathname = usePathname();
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const handleToggle = onToggleCollapse || (() => setInternalCollapsed(!internalCollapsed));

  const isActive = (href: string) => {
    if (href === "/dashboard/customer") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`flex h-screen flex-col border-neutral-200 border-r bg-white transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div
        className={`flex h-16 items-center border-neutral-200 border-b px-6 ${
          isCollapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!isCollapsed && (
          <Link className="flex items-center" href="/">
            <span
              className={cn(
                "font-medium text-lg text-neutral-900 uppercase tracking-tight",
                geistSans.className
              )}
            >
              CASAORA®
            </span>
          </Link>
        )}
        <button
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
          onClick={onClose || handleToggle}
          type="button"
        >
          <HugeiconsIcon className="h-5 w-5" icon={MenuTwoLineIcon} />
        </button>
      </div>

      {/* User Profile Section */}
      {!isCollapsed && (userName || userEmail) && (
        <div className="border-neutral-200 border-b px-6 py-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            {userAvatarUrl ? (
              <Image
                alt={userName || "User"}
                className="h-10 w-10 rounded-lg border border-neutral-200 object-cover"
                height={40}
                src={userAvatarUrl}
                width={40}
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-orange-200 bg-orange-50">
                <HugeiconsIcon className="h-5 w-5 text-orange-600" icon={UserCircleIcon} />
              </div>
            )}

            {/* User Info */}
            <div className="min-w-0 flex-1">
              <p
                className={cn("truncate font-medium text-neutral-900 text-sm", geistSans.className)}
              >
                {userName || "Customer"}
              </p>
              {userEmail && <p className="truncate text-neutral-500 text-xs">{userEmail}</p>}
            </div>

            {/* Online Status */}
            <div className="flex-shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6">
        {navSections.map((section, idx) => (
          <div className={idx > 0 ? "mt-8" : ""} key={section.title}>
            {!isCollapsed && (
              <div className="mb-3 px-6">
                <h3 className="font-semibold text-neutral-500 text-xs uppercase tracking-wider">
                  {section.title}
                </h3>
              </div>
            )}
            <div className="space-y-1 px-3">
              {section.items.map((item) => {
                const active = isActive(item.href);
                const showBadge =
                  item.href === "/dashboard/customer/messages" && unreadMessagesCount > 0;

                return (
                  <Link
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-sm transition-all ${
                      active
                        ? "bg-orange-50 text-orange-600"
                        : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                    } ${isCollapsed ? "justify-center" : ""}`}
                    href={item.href}
                    key={item.href}
                    onClick={onClose}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <HugeiconsIcon className="h-5 w-5 flex-shrink-0" icon={item.icon} />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {showBadge && (
                          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full border border-orange-200 bg-orange-500/10 px-1.5 font-semibold text-orange-600 text-xs">
                            {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
                          </span>
                        )}
                      </>
                    )}
                    {isCollapsed && showBadge && (
                      <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-orange-500" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer - Sign Out */}
      <div className="border-neutral-200 border-t p-3">
        <SignOutButton isCollapsed={isCollapsed} showLabel={!isCollapsed} />
      </div>
    </aside>
  );
}

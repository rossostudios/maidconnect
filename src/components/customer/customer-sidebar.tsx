"use client";

import {
  Calendar03Icon,
  CreditCardIcon,
  FavouriteIcon,
  Home09Icon,
  Location01Icon,
  MenuTwoLineIcon,
  Message01Icon,
  RepeatIcon,
  Search01Icon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Link, usePathname } from "@/i18n/routing";
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
    ],
  },
  {
    title: "Services",
    items: [
      { href: "/professionals", label: "Find Professionals", icon: Search01Icon },
      { href: "/dashboard/customer/favorites", label: "Favorites", icon: FavouriteIcon },
      { href: "/dashboard/customer/recurring-plans", label: "Recurring Plans", icon: RepeatIcon },
    ],
  },
  {
    title: "Account",
    items: [
      { href: "/dashboard/customer/addresses", label: "Addresses", icon: Location01Icon },
      { href: "/dashboard/customer/payments", label: "Payments", icon: CreditCardIcon },
      { href: "/dashboard/customer/settings", label: "Settings", icon: Settings02Icon },
    ],
  },
];

type Props = {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onClose?: () => void;
  unreadMessagesCount?: number;
};

export function CustomerSidebar({
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
  onClose,
  unreadMessagesCount = 0,
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
      className={`flex h-screen flex-col border-[#E5E5E5] border-r bg-white transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div
        className={`flex h-20 items-center border-[#E5E5E5] border-b px-6 ${
          isCollapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!isCollapsed && (
          <Link className="flex items-center" href="/">
            <span className="font-bold text-[#171717] text-lg tracking-tight">CASAORA</span>
          </Link>
        )}
        <button
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="rounded-lg p-2 text-[#737373] transition-colors hover:bg-[#F5F5F5] hover:text-[#171717]"
          onClick={onClose || handleToggle}
          type="button"
        >
          <HugeiconsIcon className="h-5 w-5" icon={MenuTwoLineIcon} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6">
        {navSections.map((section, idx) => (
          <div className={idx > 0 ? "mt-8" : ""} key={section.title}>
            {!isCollapsed && (
              <div className="mb-3 px-6">
                <h3 className="font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
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
                        ? "bg-[#FEF2F2] text-[#E85D48]"
                        : "text-[#525252] hover:bg-[#F5F5F5] hover:text-[#171717]"
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
                          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#E85D48] px-1.5 font-semibold text-white text-xs">
                            {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
                          </span>
                        )}
                      </>
                    )}
                    {isCollapsed && showBadge && (
                      <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#E85D48]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer - Sign Out */}
      <div className="border-[#E5E5E5] border-t p-3">
        <SignOutButton isCollapsed={isCollapsed} showLabel={!isCollapsed} />
      </div>
    </aside>
  );
}

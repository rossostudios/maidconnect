"use client";

import {
  Calendar03Icon,
  Clock01Icon,
  DollarCircleIcon,
  FileAttachmentIcon,
  Home09Icon,
  Image02Icon,
  MenuTwoLineIcon,
  Settings02Icon,
  UserIcon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Link, usePathname } from "@/i18n/routing";
import type { HugeIcon } from "@/types/icons";
import { ProOnboardingBadge } from "./pro-onboarding-badge";

type OnboardingStatus =
  | "application_pending"
  | "application_in_review"
  | "approved"
  | "active"
  | "suspended";

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
      { href: "/dashboard/pro", label: "Dashboard", icon: Home09Icon },
      { href: "/dashboard/pro/leads", label: "Lead Queue", icon: UserMultiple02Icon },
      { href: "/dashboard/pro/bookings", label: "Bookings", icon: Calendar03Icon },
    ],
  },
  {
    title: "Business",
    items: [
      { href: "/dashboard/pro/finances", label: "Finances", icon: DollarCircleIcon },
      { href: "/dashboard/pro/availability", label: "Availability", icon: Clock01Icon },
      { href: "/dashboard/pro/portfolio", label: "Portfolio", icon: Image02Icon },
    ],
  },
  {
    title: "Profile",
    items: [
      { href: "/dashboard/pro/profile", label: "My Profile", icon: UserIcon },
      { href: "/dashboard/pro/documents", label: "Documents", icon: FileAttachmentIcon },
      { href: "/dashboard/pro/onboarding", label: "Settings", icon: Settings02Icon },
    ],
  },
];

type Props = {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onClose?: () => void;
  pendingLeadsCount?: number;
  onboardingStatus?: OnboardingStatus;
  onboardingCompletion?: number;
};

export function ProSidebar({
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
  onClose,
  pendingLeadsCount = 0,
  onboardingStatus = "active",
  onboardingCompletion = 100,
}: Props) {
  const pathname = usePathname();
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const handleToggle = onToggleCollapse || (() => setInternalCollapsed(!internalCollapsed));

  const isActive = (href: string) => {
    if (href === "/dashboard/pro") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`flex h-screen flex-col border-[neutral-200] border-r bg-[neutral-50] transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div
        className={`flex h-20 items-center border-[neutral-200] border-b px-6 ${
          isCollapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!isCollapsed && (
          <Link className="flex items-center" href="/">
            <span className="font-bold text-[neutral-900] text-lg tracking-tight">CASAORA</span>
          </Link>
        )}
        <button
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="p-2 text-[neutral-400] transition-colors hover:bg-[neutral-50] hover:text-[neutral-900]"
          onClick={onClose || handleToggle}
          type="button"
        >
          <HugeiconsIcon className="h-5 w-5" icon={MenuTwoLineIcon} />
        </button>
      </div>

      {/* Onboarding Badge */}
      {!isCollapsed && (
        <ProOnboardingBadge completionPercentage={onboardingCompletion} status={onboardingStatus} />
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6">
        {navSections.map((section, idx) => (
          <div className={idx > 0 ? "mt-8" : ""} key={section.title}>
            {!isCollapsed && (
              <div className="mb-3 px-6">
                <h3 className="font-semibold text-[neutral-400] text-xs uppercase tracking-wider">
                  {section.title}
                </h3>
              </div>
            )}
            <div className="space-y-1 px-3">
              {section.items.map((item) => {
                const active = isActive(item.href);
                const showBadge = item.href === "/dashboard/pro/leads" && pendingLeadsCount > 0;

                return (
                  <Link
                    className={`flex items-center gap-3 px-3 py-2.5 font-medium text-sm transition-all ${
                      active
                        ? "bg-[neutral-50] text-[neutral-500]"
                        : "text-[neutral-400] hover:bg-[neutral-50] hover:text-[neutral-900]"
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
                          <span className="flex h-5 min-w-[20px] items-center justify-center bg-[neutral-500] px-1.5 font-semibold text-[neutral-50] text-xs">
                            {pendingLeadsCount > 99 ? "99+" : pendingLeadsCount}
                          </span>
                        )}
                      </>
                    )}
                    {isCollapsed && showBadge && (
                      <span className="absolute top-1 right-1 h-2 w-2 bg-[neutral-500]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer - Sign Out */}
      <div className="border-[neutral-200] border-t p-3">
        <SignOutButton isCollapsed={isCollapsed} showLabel={!isCollapsed} />
      </div>
    </aside>
  );
}

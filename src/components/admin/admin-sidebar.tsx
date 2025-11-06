"use client";

import {
  Alert01Icon,
  Analytics01Icon,
  ClipboardIcon,
  DollarCircleIcon,
  MapsLocation01Icon,
  MenuTwoLineIcon,
  Message01Icon,
  StarIcon,
  UserGroupIcon,
  UserMultiple02Icon,
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
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    title: "Core",
    items: [
      { href: "/admin", label: "Vetting Queue", icon: UserMultiple02Icon },
      { href: "/admin/users", label: "Users", icon: UserGroupIcon },
      { href: "/admin/disputes", label: "Disputes", icon: Alert01Icon },
      { href: "/admin/audit-logs", label: "Audit Logs", icon: ClipboardIcon },
    ],
  },
  {
    title: "Business",
    items: [
      { href: "/admin/analytics", label: "Analytics", icon: Analytics01Icon },
      { href: "/admin/pricing", label: "Pricing", icon: DollarCircleIcon },
    ],
  },
  {
    title: "Community",
    items: [
      { href: "/admin/changelog", label: "Changelog", icon: StarIcon },
      { href: "/admin/feedback", label: "Feedback", icon: Message01Icon },
      { href: "/admin/roadmap", label: "Roadmap", icon: MapsLocation01Icon },
    ],
  },
];

type Props = {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onClose?: () => void;
};

export function AdminSidebar({
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
  onClose,
}: Props) {
  const pathname = usePathname();
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const handleToggle = onToggleCollapse || (() => setInternalCollapsed(!internalCollapsed));

  const isActive = (href: string) => {
    if (href === "/admin") {
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
      {/* Header - More spacious */}
      <div
        className={`flex h-16 items-center border-[#E5E5E5] border-b px-6 ${
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
        >
          <HugeiconsIcon className="h-5 w-5" icon={MenuTwoLineIcon} />
        </button>
      </div>

      {/* Navigation - Cleaner spacing */}
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
                return (
                  <Link
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-sm transition-all ${
                      active
                        ? "bg-[#FEF2F2] text-[#E63946]"
                        : "text-[#525252] hover:bg-[#F5F5F5] hover:text-[#171717]"
                    } ${isCollapsed ? "justify-center" : ""}`}
                    href={item.href}
                    key={item.href}
                    onClick={onClose}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <HugeiconsIcon className="h-5 w-5 flex-shrink-0" icon={item.icon} />
                    {!isCollapsed && <span>{item.label}</span>}
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

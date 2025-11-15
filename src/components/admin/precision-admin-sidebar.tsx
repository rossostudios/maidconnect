"use client";

import {
  Alert01Icon,
  Analytics01Icon,
  ClipboardIcon,
  DollarCircleIcon,
  FileIcon,
  Home01Icon,
  Logout01Icon,
  MapsLocation01Icon,
  Message01Icon,
  Settings01Icon,
  StarIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useState } from "react";
import { geistMono, geistSans } from "@/app/fonts";
import { Backdrop } from "@/components/ui/backdrop";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import type { HugeIcon } from "@/types/icons";

type NavItem = {
  href: string;
  label: string;
  icon: HugeIcon;
};

type Props = {
  userEmail?: string;
  userName?: string;
};

const navigation: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: Home01Icon },
  { href: "/admin/users", label: "Users", icon: UserGroupIcon },
  { href: "/admin/disputes", label: "Disputes", icon: Alert01Icon },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ClipboardIcon },
  { href: "/admin/analytics", label: "Analytics", icon: Analytics01Icon },
  { href: "/admin/pricing", label: "Pricing", icon: DollarCircleIcon },
  { href: "/admin/help/articles", label: "Help Center", icon: FileIcon },
  { href: "/admin/changelog", label: "Changelog", icon: StarIcon },
  { href: "/admin/feedback", label: "Feedback", icon: Message01Icon },
  { href: "/admin/roadmap", label: "Roadmap", icon: MapsLocation01Icon },
];

/**
 * PrecisionAdminSidebar - High-Contrast Design
 *
 * Inspired by Bloomberg Terminal + Swiss Design:
 * - Ultra-high contrast for maximum readability
 * - Geist Sans for all text
 * - Pure white background with deep black borders
 * - Sharp geometric shapes (no rounded corners)
 * - Electric blue accents for active states
 * - All caps typography for hierarchy
 */
export function PrecisionAdminSidebar({ userEmail, userName }: Props) {
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-full flex-col border-neutral-200 border-r bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-neutral-200 border-b bg-white px-6">
        <Link className="flex items-center gap-3 no-underline" href="/">
          <Image alt="Casaora" height={32} src="/isologo.svg" width={32} />
          <div>
            <span
              className={cn(
                "block font-semibold text-lg text-neutral-900 tracking-tight",
                geistSans.className
              )}
            >
              CASAORA
            </span>
            <span
              className={cn(
                "block font-normal text-[10px] text-neutral-500 uppercase tracking-wider",
                geistSans.className
              )}
            >
              Admin
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              className={cn(
                "group relative flex items-center gap-3 border-l-2 bg-white px-3 py-2.5 font-semibold text-xs uppercase tracking-wider transition-all",
                geistSans.className,
                active
                  ? "border-l-[#FF5200] bg-orange-50 text-[#FF5200]"
                  : "border-l-transparent text-neutral-900 hover:border-l-neutral-300 hover:text-neutral-900"
              )}
              href={item.href}
              key={item.href}
            >
              <HugeiconsIcon
                className={cn(
                  "h-[18px] w-[18px] flex-shrink-0 transition-colors",
                  active ? "text-[#FF5200]" : "text-neutral-900"
                )}
                icon={item.icon}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Account Menu */}
      <div className="relative border-neutral-200 border-t bg-white">
        <button
          aria-label="Account menu"
          className={cn(
            "flex w-full items-center gap-3 border-l-2 bg-white p-3 font-semibold text-neutral-900 text-xs uppercase tracking-wider transition-all",
            geistSans.className,
            showProfileMenu
              ? "border-l-[#FF5200]"
              : "border-l-transparent hover:border-l-neutral-300"
          )}
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          type="button"
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center border border-neutral-200 bg-neutral-900 font-semibold text-white text-xs tracking-tighter">
            {userName?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate font-semibold text-xs uppercase tracking-wider">
              {userName || "Admin User"}
            </p>
            {userEmail && (
              <p
                className={cn(
                  "mt-0.5 truncate font-normal text-[10px] text-neutral-700 tracking-tighter",
                  geistMono.className
                )}
              >
                {userEmail}
              </p>
            )}
          </div>
        </button>

        {/* Profile Dropdown */}
        {showProfileMenu && (
          <>
            <Backdrop aria-label="Close account menu" onClose={() => setShowProfileMenu(false)} />
            <div className="absolute right-0 bottom-full left-0 z-50 mb-1 overflow-hidden border border-neutral-200 bg-white shadow-sm">
              {/* Menu Items */}
              <div className="py-1">
                <Link
                  className={cn(
                    "flex items-center gap-2.5 border border-transparent bg-white px-3 py-2 font-semibold text-neutral-900 text-xs uppercase tracking-wider transition-all hover:border-neutral-200 hover:bg-neutral-50",
                    geistSans.className
                  )}
                  href="/admin/settings"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <HugeiconsIcon className="h-4 w-4" icon={Settings01Icon} />
                  <span>Settings</span>
                </Link>

                <div className="my-1 border-neutral-100 border-t" />

                <Link
                  className={cn(
                    "flex items-center gap-2.5 border border-transparent bg-white px-3 py-2 font-semibold text-neutral-900 text-xs uppercase tracking-wider transition-all hover:border-neutral-200 hover:bg-neutral-50",
                    geistSans.className
                  )}
                  href="/auth/sign-out"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <HugeiconsIcon className="h-4 w-4" icon={Logout01Icon} />
                  <span>Sign out</span>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

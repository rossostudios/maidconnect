"use client";

import {
  Alert01Icon,
  Analytics01Icon,
  ArrowDown01Icon,
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
import { geistSans } from "@/app/fonts";
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
  userAvatarUrl?: string;
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
 * LiaAdminSidebar - Lia Design System
 *
 * Inspired by Bloomberg Terminal + Swiss Design:
 * - Ultra-high contrast for maximum readability
 * - Geist Sans for all text
 * - Pure white background with deep black borders
 * - Sharp geometric shapes (no rounded corners)
 * - Electric blue accents for active states
 * - All caps typography for hierarchy
 */
export function LiaAdminSidebar({ userEmail, userName, userAvatarUrl }: Props) {
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const accountName = userName || "Admin User";
  const firstName = accountName.split(" ")[0] || accountName;
  const accountEmail = userEmail || "admin@casaora.com";
  const accountRole = "Administrator";
  const userInitials =
    accountName
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "AD";

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
                  : "border-l-transparent text-[#5A5A5A] hover:border-l-neutral-300 hover:text-[#5A5A5A]"
              )}
              href={item.href}
              key={item.href}
            >
              <HugeiconsIcon
                className={cn(
                  "h-[18px] w-[18px] flex-shrink-0 transition-colors",
                  active ? "text-[#FF5200]" : "text-[#5A5A5A]"
                )}
                icon={item.icon}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Account Menu */}
      <div className="border-neutral-200 border-t bg-white px-3 py-4">
        <div className="relative overflow-hidden border border-neutral-200 bg-white text-neutral-900 shadow-[0_12px_35px_rgba(15,23,42,0.12)]">
          <button
            aria-controls="admin-account-dropdown"
            aria-expanded={showProfileMenu}
            className="relative flex w-full flex-col gap-3 px-4 pt-4 pb-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5200] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            onClick={() => setShowProfileMenu((prev) => !prev)}
            type="button"
          >
            <div className="flex items-center gap-2.5">
              <div className="relative flex-shrink-0">
                {userAvatarUrl ? (
                  <Image
                    alt={accountName}
                    className="h-12 w-12 rounded-2xl border border-neutral-200 object-cover"
                    height={48}
                    src={userAvatarUrl}
                    width={48}
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 font-semibold text-neutral-900 text-sm">
                    {userInitials}
                  </div>
                )}
                <span className="-bottom-0.5 -right-0.5 absolute flex h-3.5 w-3.5 items-center justify-center rounded-full border border-white bg-emerald-500 shadow-[0_0_0_1px_rgba(15,23,42,0.08)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                </span>
              </div>

              <div className="min-w-0 flex-1 space-y-1.5">
                <p
                  className={cn(
                    "min-w-0 break-words font-semibold text-base text-neutral-900 leading-tight",
                    geistSans.className
                  )}
                >
                  {firstName}
                </p>
                <p className="truncate text-neutral-500 text-xs">{accountEmail}</p>
                {!showProfileMenu && (
                  <span className="inline-flex items-center rounded-full bg-neutral-900 px-2 py-0.5 font-semibold text-[9px] text-white uppercase tracking-[0.18em]">
                    {accountRole}
                  </span>
                )}
              </div>

              <HugeiconsIcon
                className={cn(
                  "h-4 w-4 flex-shrink-0 text-neutral-400 transition-transform duration-200",
                  showProfileMenu ? "rotate-180" : "rotate-0"
                )}
                icon={ArrowDown01Icon}
              />
            </div>
          </button>

          <div
            className={cn(
              "overflow-hidden px-4 pb-5 transition-[max-height,opacity] duration-300 ease-in-out",
              showProfileMenu ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            )}
            id="admin-account-dropdown"
          >
            <div className="border border-neutral-200 bg-neutral-50 px-4 py-3">
              <p className="mb-1 font-semibold text-[10px] text-neutral-500 uppercase tracking-[0.3em]">
                Workspace Role
              </p>
              <span className="inline-flex items-center border border-neutral-900 bg-neutral-900 px-2.5 py-0.5 font-semibold text-[10px] text-white uppercase tracking-[0.18em]">
                {accountRole}
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <Link
                className="flex items-center justify-between border border-neutral-200 bg-neutral-50 px-4 py-3 font-semibold text-neutral-900 text-sm transition hover:bg-white"
                href="/admin/settings"
                onClick={() => setShowProfileMenu(false)}
              >
                <span>Admin Settings</span>
                <HugeiconsIcon className="h-4 w-4 text-neutral-500" icon={Settings01Icon} />
              </Link>
              <Link
                className="flex items-center justify-between border border-transparent bg-[#FF5200] px-4 py-3 font-semibold text-sm text-white transition hover:bg-[#e64900]"
                href="/auth/sign-out"
                onClick={() => setShowProfileMenu(false)}
              >
                <span>Sign Out</span>
                <HugeiconsIcon className="h-4 w-4 text-white" icon={Logout01Icon} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

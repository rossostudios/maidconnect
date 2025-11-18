"use client";

import {
  ArrowDown01Icon,
  Calendar03Icon,
  Clock01Icon,
  DollarCircleIcon,
  FileAttachmentIcon,
  Home09Icon,
  Image02Icon,
  Logout01Icon,
  Settings02Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useState, useTransition } from "react";
import { signOutAction } from "@/app/[locale]/auth/actions";
import { geistSans } from "@/app/fonts";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
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
      // Removed Lead Queue for concierge-only migration
      // Professionals now receive curated assignments from concierge team
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
  onClose?: () => void;
  pendingLeadsCount?: number;
  onboardingStatus?: OnboardingStatus;
  onboardingCompletion?: number;
  userEmail?: string;
  userName?: string;
  userAvatarUrl?: string;
};

export function ProSidebar({
  isCollapsed,
  onClose,
  pendingLeadsCount = 0,
  onboardingStatus = "active",
  onboardingCompletion = 100,
  userEmail,
  userName,
  userAvatarUrl,
}: Props) {
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const accountName = userName || "Professional";
  const firstName = accountName.split(" ")[0] || accountName;
  const accountEmail = userEmail || "pro@casaora.com";
  const accountRole = "Professional";
  const userInitials =
    accountName
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "PR";

  const handleSignOut = () => {
    setIsSigningOut(true);
    setShowProfileMenu(false);
    startTransition(async () => {
      try {
        await signOutAction();
      } catch (_error) {
        // Error is handled by server action
        setIsSigningOut(false);
      }
    });
  };

  const isLoading = isPending || isSigningOut;

  const isActive = (href: string) => {
    if (href === "/dashboard/pro") {
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
      <div className="flex h-16 items-center gap-3 border-neutral-200 border-b bg-white px-6">
        <Link className="flex items-center gap-3 no-underline" href="/">
          <Image alt="Casaora" height={32} src="/isologo.svg" width={32} />
          {!isCollapsed && (
            <div>
              <span
                className={cn(
                  "block font-medium text-lg text-neutral-900 tracking-tight",
                  geistSans.className
                )}
              >
                CASAORA®
              </span>
              <span
                className={cn(
                  "block font-normal text-neutral-500 text-xs uppercase tracking-wider",
                  geistSans.className
                )}
              >
                Professional
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Onboarding Badge */}
      {!isCollapsed && (
        <ProOnboardingBadge completionPercentage={onboardingCompletion} status={onboardingStatus} />
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        {navSections.map((section, idx) => (
          <div className={idx > 0 ? "mt-8" : ""} key={section.title}>
            {!isCollapsed && (
              <div className="mb-3 px-3">
                <h3 className="font-semibold text-neutral-900 text-xs uppercase tracking-wider">
                  {section.title}
                </h3>
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = isActive(item.href);
                const showBadge = item.href === "/dashboard/pro/leads" && pendingLeadsCount > 0;

                return (
                  <Link
                    className={`flex items-center gap-3 px-3 py-2.5 font-medium text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5200] focus-visible:ring-offset-2 ${
                      active
                        ? "bg-neutral-900 text-white shadow-sm"
                        : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
                    } ${isCollapsed ? "justify-center" : ""}`}
                    href={item.href}
                    key={item.href}
                    onClick={onClose}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <HugeiconsIcon
                      className={`h-5 w-5 flex-shrink-0 transition-colors ${
                        active ? "text-white" : "text-neutral-500 group-hover:text-neutral-900"
                      }`}
                      icon={item.icon}
                    />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {showBadge && (
                          <span className="flex h-5 min-w-[20px] items-center justify-center bg-[#FF5200] px-1.5 font-semibold text-white text-xs">
                            {pendingLeadsCount > 99 ? "99+" : pendingLeadsCount}
                          </span>
                        )}
                      </>
                    )}
                    {isCollapsed && showBadge && (
                      <span className="absolute top-1 right-1 h-2 w-2 bg-[#FF5200]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer - Account Dropdown */}
      <div className="border-neutral-200 border-t bg-white px-3 py-4">
        <div className="relative overflow-hidden border border-neutral-200 bg-white text-neutral-900 shadow-[0_12px_35px_rgba(15,23,42,0.12)]">
          <button
            aria-controls="pro-account-dropdown"
            aria-expanded={showProfileMenu}
            className="relative flex w-full flex-col gap-3 px-4 pt-4 pb-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5200] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            onClick={() => setShowProfileMenu((prev) => !prev)}
            type="button"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-neutral-200 bg-neutral-900">
                {userAvatarUrl ? (
                  <Image
                    alt={accountName}
                    className="h-full w-full object-cover"
                    height={40}
                    src={userAvatarUrl}
                    width={40}
                  />
                ) : (
                  <span className={cn("font-semibold text-white text-xs", geistSans.className)}>
                    {userInitials}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "truncate font-semibold text-neutral-900 text-sm",
                    geistSans.className
                  )}
                >
                  {firstName}
                </p>
                <p className={cn("truncate text-neutral-700 text-xs", geistSans.className)}>
                  {accountEmail}
                </p>
              </div>
              <HugeiconsIcon
                className={cn(
                  "h-4 w-4 flex-shrink-0 text-neutral-700 transition-transform",
                  showProfileMenu && "rotate-180"
                )}
                icon={ArrowDown01Icon}
              />
            </div>
            <div className="inline-flex items-center border border-neutral-200 bg-neutral-50 px-2 py-1">
              <span
                className={cn(
                  "font-semibold text-neutral-900 text-xs uppercase tracking-wider",
                  geistSans.className
                )}
              >
                {accountRole}
              </span>
            </div>
          </button>
          <div
            className={cn(
              "overflow-hidden px-4 pb-5 transition-[max-height,opacity] duration-300 ease-in-out",
              showProfileMenu ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            )}
            id="pro-account-dropdown"
          >
            <div className="space-y-2 border-neutral-200 border-t pt-4">
              <Link
                className={cn(
                  "flex w-full items-center gap-2 border border-neutral-200 bg-white px-3 py-2 font-medium text-neutral-900 text-sm transition hover:border-[#FF5200] hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5200] focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                  geistSans.className
                )}
                href="/dashboard/pro/onboarding"
                onClick={() => setShowProfileMenu(false)}
              >
                <HugeiconsIcon className="h-4 w-4 text-neutral-700" icon={Settings02Icon} />
                Settings
              </Link>
              <button
                className={cn(
                  "flex w-full items-center gap-2 border border-neutral-200 bg-white px-3 py-2 font-medium text-neutral-900 text-sm transition hover:border-[#FF5200] hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5200] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50",
                  geistSans.className
                )}
                disabled={isLoading}
                onClick={handleSignOut}
                type="button"
              >
                <HugeiconsIcon className="h-4 w-4 text-neutral-700" icon={Logout01Icon} />
                {isLoading ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

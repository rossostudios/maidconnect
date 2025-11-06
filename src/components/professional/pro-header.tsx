"use client";

import {
  FileAttachmentIcon,
  Logout01Icon,
  Message01Icon,
  Notification02Icon,
  Search01Icon,
  Settings02Icon,
  UserCircleIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { CommandPalette } from "@/components/command-palette/command-palette";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { NotificationsSheet } from "@/components/notifications/notifications-sheet";
import { ProMobileSidebar } from "@/components/professional/pro-mobile-sidebar";
import { useNotificationUnreadCount } from "@/hooks/use-notification-unread-count";
import { Link } from "@/i18n/routing";

type OnboardingStatus =
  | "application_pending"
  | "application_in_review"
  | "approved"
  | "active"
  | "suspended";

type Props = {
  userEmail?: string;
  userName?: string;
  unreadMessagesCount?: number;
  pendingLeadsCount?: number;
  onboardingStatus?: OnboardingStatus;
  onboardingCompletion?: number;
};

export function ProHeader({
  userEmail,
  userName,
  unreadMessagesCount = 0,
  pendingLeadsCount = 0,
  onboardingStatus = "active",
  onboardingCompletion = 100,
}: Props) {
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { unreadCount } = useNotificationUnreadCount();

  // Keyboard shortcut for CMD+K / CTRL+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowCommandPalette((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <header className="flex h-20 items-center justify-between border-[#E5E5E5] border-b bg-white">
        {/* Left: Mobile Menu + Breadcrumbs */}
        <div className="flex min-w-0 flex-1 items-center gap-6 px-8">
          {/* Mobile Menu */}
          <div className="flex-shrink-0 lg:hidden">
            <ProMobileSidebar
              onboardingCompletion={onboardingCompletion}
              onboardingStatus={onboardingStatus}
              pendingLeadsCount={pendingLeadsCount}
            />
          </div>

          {/* Breadcrumbs - Desktop */}
          <div className="hidden h-full items-center lg:flex">
            <Breadcrumbs />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-shrink-0 items-center gap-3">
          {/* Search Button */}
          <button
            aria-label="Search"
            className="group hidden w-64 items-center gap-2 rounded-lg border border-[#E5E5E5] bg-[#FAFAF9] px-4 py-2 transition-colors hover:bg-white sm:flex"
            onClick={() => setShowCommandPalette(true)}
            type="button"
          >
            <HugeiconsIcon
              className="h-4 w-4 flex-shrink-0 text-[#737373] group-hover:text-[#171717]"
              icon={Search01Icon}
            />
            <span className="flex-1 text-left text-[#737373] text-sm group-hover:text-[#171717]">
              Search
            </span>
            <kbd className="inline-flex flex-shrink-0 items-center gap-1 rounded border border-[#E5E5E5] bg-white px-1.5 py-0.5 font-mono text-[#A3A3A3] text-[10px]">
              ⌘K
            </kbd>
          </button>

          {/* Messages */}
          <Link
            aria-label="Messages"
            className="group relative rounded-lg p-2.5 transition-colors hover:bg-[#F5F5F5]"
            href="/dashboard/pro/messages"
          >
            <HugeiconsIcon
              className="h-5 w-5 text-[#737373] group-hover:text-[#171717]"
              icon={Message01Icon}
            />
            {unreadMessagesCount > 0 && (
              <span className="absolute top-1 right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#E63946] px-1 font-semibold text-[10px] text-white">
                {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
              </span>
            )}
          </Link>

          {/* Notifications */}
          <button
            aria-label="Notifications"
            className="group relative rounded-lg p-2.5 transition-colors hover:bg-[#F5F5F5]"
            onClick={() => setShowNotifications(true)}
            type="button"
          >
            <HugeiconsIcon
              className="h-5 w-5 text-[#737373] group-hover:text-[#171717]"
              icon={Notification02Icon}
            />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E63946] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#E63946]" />
              </span>
            )}
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              aria-label="Profile menu"
              className="group flex items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-[#F5F5F5]"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              type="button"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E63946]/10 transition-colors group-hover:bg-[#E63946]/20">
                <HugeiconsIcon className="h-5 w-5 text-[#E63946]" icon={UserCircleIcon} />
              </div>
              <div className="hidden text-left md:block">
                <p className="font-medium text-[#171717] text-sm">{userName || "Professional"}</p>
                {userEmail && <p className="text-[#737373] text-xs">{userEmail}</p>}
              </div>
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <>
                {/* Backdrop */}
                <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />

                {/* Menu */}
                <div className="absolute top-full right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-[#E5E5E5] bg-white shadow-lg">
                  {/* User Info */}
                  <div className="border-[#E5E5E5] border-b bg-[#FAFAF9] px-4 py-3">
                    <p className="font-semibold text-[#171717] text-sm">
                      {userName || "Professional"}
                    </p>
                    {userEmail && <p className="mt-0.5 text-[#737373] text-xs">{userEmail}</p>}
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[#F5F5F5]"
                      href="/dashboard/pro/profile"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <HugeiconsIcon className="h-5 w-5 text-[#525252]" icon={UserIcon} />
                      <span className="text-[#525252] text-sm">My Profile</span>
                    </Link>

                    <Link
                      className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[#F5F5F5]"
                      href="/dashboard/pro/documents"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <HugeiconsIcon className="h-5 w-5 text-[#525252]" icon={FileAttachmentIcon} />
                      <span className="text-[#525252] text-sm">Documents</span>
                    </Link>

                    <Link
                      className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[#F5F5F5]"
                      href="/dashboard/pro/onboarding"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <HugeiconsIcon className="h-5 w-5 text-[#525252]" icon={Settings02Icon} />
                      <span className="text-[#525252] text-sm">Settings</span>
                    </Link>

                    <Link
                      className="group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[#FEF2F2]"
                      href="/auth/sign-out"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <HugeiconsIcon
                        className="h-5 w-5 text-[#525252] group-hover:text-[#E63946]"
                        icon={Logout01Icon}
                      />
                      <span className="text-[#525252] text-sm group-hover:text-[#E63946]">
                        Sign out
                      </span>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Command Palette */}
      <CommandPalette
        dashboardPath="/dashboard/pro"
        onClose={() => setShowCommandPalette(false)}
        open={showCommandPalette}
      />

      {/* Notifications Sheet */}
      <NotificationsSheet isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </>
  );
}

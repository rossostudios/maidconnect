"use client";

import {
  Logout01Icon,
  Notification02Icon,
  Search01Icon,
  Settings01Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { AdminMobileSidebar } from "@/components/admin/admin-mobile-sidebar";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { NotificationsSheet } from "@/components/notifications/notifications-sheet";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useNotificationUnreadCount } from "@/hooks/use-notification-unread-count";
import { Link } from "@/i18n/routing";

type Props = {
  userEmail?: string;
  userName?: string;
};

export function AdminHeader({ userEmail, userName }: Props) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { unreadCount } = useNotificationUnreadCount();
  const { openCommandPalette } = useKeyboardShortcuts();

  return (
    <>
      <header className="flex h-20 items-center justify-between border-[#E5E5E5] border-b bg-white">
        {/* Left: Mobile Menu + Breadcrumbs */}
        <div className="flex min-w-0 flex-1 items-center gap-6 px-8">
          {/* Mobile Menu */}
          <div className="flex-shrink-0 lg:hidden">
            <AdminMobileSidebar />
          </div>

          {/* Breadcrumbs - Desktop - Vertically centered */}
          <div className="hidden h-full items-center lg:flex">
            <Breadcrumbs />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-shrink-0 items-center gap-3">
          {/* Search Button - Wider */}
          <button
            aria-label="Search"
            className="group flex w-64 items-center gap-2 rounded-lg border border-[#E5E5E5] bg-[#FAFAF9] px-4 py-2 transition-colors hover:bg-white"
            onClick={openCommandPalette}
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
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E85D48] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#E85D48]" />
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
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E85D48]/10 transition-colors group-hover:bg-[#E85D48]/20">
                <HugeiconsIcon className="h-5 w-5 text-[#E85D48]" icon={UserCircleIcon} />
              </div>
              <div className="hidden text-left md:block">
                <p className="font-medium text-[#171717] text-sm">{userName || "Admin"}</p>
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
                      {userName || "Admin User"}
                    </p>
                    {userEmail && <p className="mt-0.5 text-[#737373] text-xs">{userEmail}</p>}
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[#F5F5F5]"
                      href="/admin/settings"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <HugeiconsIcon className="h-5 w-5 text-[#525252]" icon={Settings01Icon} />
                      <span className="text-[#525252] text-sm">Settings</span>
                    </Link>

                    <Link
                      className="group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[#FEF2F2]"
                      href="/auth/sign-out"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <HugeiconsIcon
                        className="h-5 w-5 text-[#525252] group-hover:text-[#E85D48]"
                        icon={Logout01Icon}
                      />
                      <span className="text-[#525252] text-sm group-hover:text-[#E85D48]">
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

      {/* Notifications Sheet */}
      <NotificationsSheet isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </>
  );
}

"use client";

import {
  Logout01Icon,
  Message01Icon,
  Notification02Icon,
  Settings02Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { CustomerMobileSidebar } from "@/components/customer/customer-mobile-sidebar";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { NotificationsSheet } from "@/components/notifications/notifications-sheet";
import { useNotificationUnreadCount } from "@/hooks/use-notification-unread-count";
import { Link } from "@/i18n/routing";

type Props = {
  userEmail?: string;
  userName?: string;
  unreadMessagesCount?: number;
};

export function CustomerHeader({ userEmail, userName, unreadMessagesCount = 0 }: Props) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { unreadCount } = useNotificationUnreadCount();

  return (
    <>
      <header className="flex h-20 items-center justify-between border-[#e2e8f0] border-b bg-[#f8fafc]">
        {/* Left: Mobile Menu + Breadcrumbs */}
        <div className="flex min-w-0 flex-1 items-center gap-6 px-8">
          {/* Mobile Menu */}
          <div className="flex-shrink-0 lg:hidden">
            <CustomerMobileSidebar unreadMessagesCount={unreadMessagesCount} />
          </div>

          {/* Breadcrumbs - Desktop */}
          <div className="hidden h-full items-center lg:flex">
            <Breadcrumbs />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-shrink-0 items-center gap-3 pr-8">
          {/* Messages */}
          <Link
            aria-label="Messages"
            className="group relative rounded-lg p-2.5 transition-colors hover:bg-[#f8fafc]"
            href="/dashboard/customer/messages"
          >
            <HugeiconsIcon
              className="h-5 w-5 text-[#94a3b8] group-hover:text-[#0f172a]"
              icon={Message01Icon}
            />
            {unreadMessagesCount > 0 && (
              <span className="absolute top-1 right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#64748b] px-1 font-semibold text-[#f8fafc] text-[10px]">
                {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
              </span>
            )}
          </Link>

          {/* Notifications */}
          <button
            aria-label="Notifications"
            className="group relative rounded-lg p-2.5 transition-colors hover:bg-[#f8fafc]"
            onClick={() => setShowNotifications(true)}
            type="button"
          >
            <HugeiconsIcon
              className="h-5 w-5 text-[#94a3b8] group-hover:text-[#0f172a]"
              icon={Notification02Icon}
            />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#64748b] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#64748b]" />
              </span>
            )}
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              aria-label="Profile menu"
              className="group flex items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-[#f8fafc]"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              type="button"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#64748b]/10 transition-colors group-hover:bg-[#64748b]/20">
                <HugeiconsIcon className="h-5 w-5 text-[#64748b]" icon={UserCircleIcon} />
              </div>
              <div className="hidden text-left md:block">
                <p className="font-medium text-[#0f172a] text-sm">{userName || "Customer"}</p>
                {userEmail && <p className="text-[#94a3b8] text-xs">{userEmail}</p>}
              </div>
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <>
                {/* Backdrop */}
                <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />

                {/* Menu */}
                <div className="absolute top-full right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-[#e2e8f0] bg-[#f8fafc] shadow-lg">
                  {/* User Info */}
                  <div className="border-[#e2e8f0] border-b bg-[#f8fafc] px-4 py-3">
                    <p className="font-semibold text-[#0f172a] text-sm">{userName || "Customer"}</p>
                    {userEmail && <p className="mt-0.5 text-[#94a3b8] text-xs">{userEmail}</p>}
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[#f8fafc]"
                      href="/dashboard/customer/settings"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <HugeiconsIcon className="h-5 w-5 text-[#94a3b8]" icon={Settings02Icon} />
                      <span className="text-[#94a3b8] text-sm">Settings</span>
                    </Link>

                    <Link
                      className="group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[#f8fafc]"
                      href="/auth/sign-out"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <HugeiconsIcon
                        className="h-5 w-5 text-[#94a3b8] group-hover:text-[#64748b]"
                        icon={Logout01Icon}
                      />
                      <span className="text-[#94a3b8] text-sm group-hover:text-[#64748b]">
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

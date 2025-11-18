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
import { Backdrop } from "@/components/ui/backdrop";
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
      <header className="sticky top-0 z-30 border-neutral-200 border-b bg-white">
        <div className="flex w-full items-center gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="lg:hidden">
              <AdminMobileSidebar />
            </div>
            <div className="flex items-center">
              <Breadcrumbs />
            </div>
          </div>

          <button
            aria-label="Search"
            className="group hidden w-full max-w-sm items-center gap-2 rounded border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-neutral-700 text-xs transition hover:border-neutral-300 hover:bg-white md:flex"
            onClick={openCommandPalette}
            type="button"
          >
            <HugeiconsIcon className="h-3.5 w-3.5 flex-shrink-0" icon={Search01Icon} />
            <span className="flex-1 text-left">Search</span>
            <kbd className="inline-flex flex-shrink-0 items-center gap-0.5 rounded border border-neutral-200 bg-white px-1 py-0.5 font-mono text-neutral-700 text-xs">
              ⌘K
            </kbd>
          </button>

          <div className="flex items-center gap-0.5">
            <button
              aria-label="Notifications"
              className="group relative rounded p-1.5 text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-900"
              onClick={() => setShowNotifications(true)}
              type="button"
            >
              <HugeiconsIcon className="h-4 w-4" icon={Notification02Icon} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping bg-orange-500 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 bg-orange-500" />
                </span>
              )}
            </button>

            <div className="relative flex items-center">
              <button
                aria-label="Profile menu"
                className="group flex items-center gap-1.5 rounded px-2 py-1.5 text-xs transition hover:bg-neutral-100"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                type="button"
              >
                <HugeiconsIcon className="h-4 w-4 text-neutral-700" icon={UserCircleIcon} />
                <span className="hidden font-medium text-neutral-900 md:block">
                  {userName || "Admin"}
                </span>
              </button>

              {showProfileMenu && (
                <>
                  <Backdrop
                    aria-label="Close profile menu"
                    onClose={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute top-full right-0 z-50 mt-1 w-48 border border-neutral-200 bg-white shadow-lg">
                    <div className="border-neutral-200 border-b px-3 py-2">
                      <p className="font-medium text-neutral-900 text-xs">
                        {userName || "Admin User"}
                      </p>
                      {userEmail && (
                        <p className="mt-0.5 text-neutral-700 text-xs">{userEmail}</p>
                      )}
                    </div>
                    <div className="py-0.5">
                      <Link
                        className="flex items-center gap-2 px-3 py-1.5 text-neutral-600 text-xs transition hover:bg-neutral-100 hover:text-neutral-900"
                        href="/admin/settings"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <HugeiconsIcon className="h-3.5 w-3.5" icon={Settings01Icon} />
                        <span>Settings</span>
                      </Link>
                      <div className="my-0.5 border-neutral-200 border-t" />
                      <Link
                        className="flex items-center gap-2 px-3 py-1.5 text-neutral-600 text-xs transition hover:bg-neutral-900 hover:text-white"
                        href="/auth/sign-out"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <HugeiconsIcon className="h-3.5 w-3.5" icon={Logout01Icon} />
                        <span>Sign out</span>
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <NotificationsSheet isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </>
  );
}

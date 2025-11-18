"use client";

import {
  FileAttachmentIcon,
  Logout01Icon,
  Message01Icon,
  Notification02Icon,
  Settings02Icon,
  UserCircleIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { NotificationsSheet } from "@/components/notifications/notifications-sheet";
import { ProMobileSidebar } from "@/components/professional/pro-mobile-sidebar";
import { Backdrop } from "@/components/ui/backdrop";
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
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
};

export function ProHeader({
  userEmail,
  userName,
  unreadMessagesCount = 0,
  pendingLeadsCount = 0,
  onboardingStatus = "active",
  onboardingCompletion = 100,
  isSidebarCollapsed,
  onToggleSidebar,
}: Props) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { unreadCount } = useNotificationUnreadCount();

  return (
    <>
      <header className="sticky top-0 z-30 border-neutral-200 border-b bg-white">
        <div className="flex w-full items-center gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="lg:hidden">
              <ProMobileSidebar
                onboardingCompletion={onboardingCompletion}
                onboardingStatus={onboardingStatus}
                pendingLeadsCount={pendingLeadsCount}
              />
            </div>
            <div className="flex items-center">
              <Breadcrumbs />
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            {/* Messages */}
            <Link
              aria-label="Messages"
              className="group relative p-1.5 text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-900"
              href="/dashboard/pro/messages"
            >
              <HugeiconsIcon className="h-4 w-4" icon={Message01Icon} />
              {unreadMessagesCount > 0 && (
                <span className="absolute top-1 right-1 flex h-5 min-w-[20px] items-center justify-center bg-[#FF5200] px-1 font-semibold text-white text-xs">
                  {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
                </span>
              )}
            </Link>

            {/* Notifications */}
            <button
              aria-label="Notifications"
              className="group relative p-1.5 text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-900"
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

            {/* Profile Dropdown */}
            <div className="relative flex items-center">
              <button
                aria-label="Profile menu"
                className="group flex items-center gap-1.5 px-2 py-1.5 text-xs transition hover:bg-neutral-100"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                type="button"
              >
                <HugeiconsIcon className="h-4 w-4 text-neutral-700" icon={UserCircleIcon} />
                <span className="hidden font-medium text-neutral-900 md:block">
                  {userName || "Professional"}
                </span>
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <>
                  <Backdrop
                    aria-label="Close profile menu"
                    onClose={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute top-full right-0 z-50 mt-1 w-48 border border-neutral-200 bg-white shadow-lg">
                    <div className="border-neutral-200 border-b px-3 py-2">
                      <p className="font-medium text-neutral-900 text-xs">
                        {userName || "Professional"}
                      </p>
                      {userEmail && (
                        <p className="mt-0.5 text-neutral-700 text-xs">{userEmail}</p>
                      )}
                    </div>
                    <div className="py-0.5">
                      <Link
                        className="flex items-center gap-2 px-3 py-1.5 text-neutral-600 text-xs transition hover:bg-neutral-100 hover:text-neutral-900"
                        href="/dashboard/pro/profile"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <HugeiconsIcon className="h-3.5 w-3.5" icon={UserIcon} />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        className="flex items-center gap-2 px-3 py-1.5 text-neutral-600 text-xs transition hover:bg-neutral-100 hover:text-neutral-900"
                        href="/dashboard/pro/documents"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <HugeiconsIcon className="h-3.5 w-3.5" icon={FileAttachmentIcon} />
                        <span>Documents</span>
                      </Link>

                      <Link
                        className="flex items-center gap-2 px-3 py-1.5 text-neutral-600 text-xs transition hover:bg-neutral-100 hover:text-neutral-900"
                        href="/dashboard/pro/onboarding"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <HugeiconsIcon className="h-3.5 w-3.5" icon={Settings02Icon} />
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

      {/* Notifications Sheet */}
      <NotificationsSheet isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </>
  );
}

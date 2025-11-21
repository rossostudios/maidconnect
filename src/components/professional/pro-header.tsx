"use client";

import { Message01Icon, Notification02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { NotificationsSheet } from "@/components/notifications/notifications-sheet";
import { ProMobileSidebar } from "@/components/professional/pro-mobile-sidebar";
import { Button } from "@/components/ui/button";
import { useNotificationUnreadCount } from "@/hooks/use-notification-unread-count";
import { Link } from "@/i18n/routing";

type OnboardingStatus =
  | "application_pending"
  | "application_in_review"
  | "approved"
  | "active"
  | "suspended";

type Props = {
  unreadMessagesCount?: number;
  pendingLeadsCount?: number;
  onboardingStatus?: OnboardingStatus;
  onboardingCompletion?: number;
  onToggleSidebar?: () => void;
};

export function ProHeader({
  unreadMessagesCount = 0,
  pendingLeadsCount = 0,
  onboardingStatus = "active",
  onboardingCompletion = 100,
  onToggleSidebar,
}: Props) {
  const [showNotifications, setShowNotifications] = useState(false);
  const { unreadCount } = useNotificationUnreadCount();

  return (
    <>
      <header className="sticky top-0 z-30 border-neutral-200 border-b bg-white">
        <div className="flex w-full items-center gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {onToggleSidebar && (
              <Button onClick={onToggleSidebar} size="icon" variant="ghost">
                <svg
                  aria-hidden="true"
                  className="h-5 w-5 text-neutral-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M4 6h16M4 12h16M4 18h16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </Button>
            )}
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

          <div className="flex items-center gap-2">
            {/* Messages */}
            <Link
              aria-label="Messages"
              className="group relative rounded-lg p-1.5 text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-900"
              href="/dashboard/pro/messages"
            >
              <HugeiconsIcon className="h-4 w-4" icon={Message01Icon} />
              {unreadMessagesCount > 0 && (
                <span className="absolute top-1 right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-orange-500 px-1 font-semibold text-white text-xs">
                  {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
                </span>
              )}
            </Link>

            {/* Notifications */}
            <button
              aria-label="Notifications"
              className="group relative rounded-lg p-1.5 text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-900"
              onClick={() => setShowNotifications(true)}
              type="button"
            >
              <HugeiconsIcon className="h-4 w-4" icon={Notification02Icon} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-500 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-orange-500" />
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Notifications Sheet */}
      <NotificationsSheet isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </>
  );
}

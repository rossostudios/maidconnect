"use client";

import { Message01Icon, Notification02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { CustomerMobileSidebar } from "@/components/customer/customer-mobile-sidebar";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { NotificationsSheet } from "@/components/notifications/notifications-sheet";
import { useNotificationUnreadCount } from "@/hooks/use-notification-unread-count";
import { Link } from "@/i18n/routing";

type Props = {
  unreadMessagesCount?: number;
};

export function CustomerHeader({ unreadMessagesCount = 0 }: Props) {
  const [showNotifications, setShowNotifications] = useState(false);
  const { unreadCount } = useNotificationUnreadCount();

  return (
    <>
      <header className="flex h-16 items-center justify-between border-neutral-200 border-b bg-white">
        {/* Left: Mobile Menu + Breadcrumbs */}
        <div className="flex min-w-0 flex-1 items-center gap-6 px-8">
          {/* Mobile Menu - Mobile Only */}
          <div className="flex-shrink-0 lg:hidden">
            <CustomerMobileSidebar unreadMessagesCount={unreadMessagesCount} />
          </div>

          {/* Breadcrumbs - Desktop */}
          <div className="hidden h-full items-center lg:flex">
            <Breadcrumbs />
          </div>
        </div>

        {/* Right: Actions (Messages + Notifications) */}
        <div className="flex flex-shrink-0 items-center gap-3 pr-8">
          {/* Messages */}
          <Link
            aria-label="Messages"
            className="group relative rounded-lg p-2.5 transition-colors hover:bg-neutral-50"
            href="/dashboard/customer/messages"
          >
            <HugeiconsIcon
              className="h-5 w-5 text-neutral-700 group-hover:text-neutral-900"
              icon={Message01Icon}
            />
            {unreadMessagesCount > 0 && (
              <span className="absolute top-1 right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full border border-orange-200 bg-orange-500/10 px-1 font-semibold text-orange-600 text-xs">
                {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
              </span>
            )}
          </Link>

          {/* Notifications */}
          <button
            aria-label="Notifications"
            className="group relative rounded-lg p-2.5 transition-colors hover:bg-neutral-50"
            onClick={() => setShowNotifications(true)}
            type="button"
          >
            <HugeiconsIcon
              className="h-5 w-5 text-neutral-700 group-hover:text-neutral-900"
              icon={Notification02Icon}
            />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Notifications Sheet */}
      <NotificationsSheet isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </>
  );
}

"use client";

import { Notification02Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { geistMono, geistSans } from "@/app/fonts";
import { AdminMobileSidebar } from "@/components/admin/admin-mobile-sidebar";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { NotificationsSheet } from "@/components/notifications/notifications-sheet";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useNotificationUnreadCount } from "@/hooks/use-notification-unread-count";
import { cn } from "@/lib/utils";

type Props = {
  userEmail?: string;
  userName?: string;
};

/**
 * PrecisionAdminHeader - High-Contrast Design
 *
 * Inspired by Bloomberg Terminal + Swiss Design:
 * - Ultra-high contrast for maximum readability
 * - Geist Sans for all text
 * - Pure white background with deep black borders
 * - Sharp geometric shapes (no rounded corners)
 * - Electric blue accents for active states
 */
export function PrecisionAdminHeader({ userEmail, userName }: Props) {
  const [showNotifications, setShowNotifications] = useState(false);
  const { unreadCount } = useNotificationUnreadCount();
  const { openCommandPalette } = useKeyboardShortcuts();

  return (
    <>
      <header className="sticky top-0 z-30 border-neutral-200 border-b bg-white">
        <div className="flex h-16 w-full items-center gap-4 px-6">
          {/* Left: Mobile menu + Breadcrumbs */}
          <div className="flex min-w-0 flex-1 items-center gap-4 self-center">
            <div className="flex items-center lg:hidden">
              <AdminMobileSidebar userEmail={userEmail} userName={userName} />
            </div>
            <div className="flex items-center">
              <Breadcrumbs />
            </div>
          </div>

          {/* Center: Search bar */}
          <button
            aria-label="Search"
            className={cn(
              "group hidden w-full max-w-md items-center gap-2.5 border border-neutral-200 bg-white px-3 py-2 font-semibold text-neutral-900 text-xs uppercase tracking-wider transition-all hover:bg-[#FF5200] hover:text-white md:flex",
              geistSans.className
            )}
            onClick={openCommandPalette}
            type="button"
          >
            <HugeiconsIcon className="h-4 w-4 flex-shrink-0" icon={Search01Icon} />
            <span className="flex-1 text-left">Search</span>
            <kbd
              className={cn(
                "inline-flex flex-shrink-0 items-center gap-0.5 border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-medium text-[10px] text-neutral-900 tracking-tighter group-hover:border-white group-hover:bg-white group-hover:text-[#FF5200]",
                geistMono.className
              )}
            >
              ⌘K
            </kbd>
          </button>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            {/* Notifications */}
            <button
              aria-label="Notifications"
              className="group relative border border-transparent bg-white p-2 text-neutral-900 transition-all hover:border-neutral-200 hover:bg-neutral-50"
              onClick={() => setShowNotifications(true)}
              type="button"
            >
              <HugeiconsIcon className="h-5 w-5" icon={Notification02Icon} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center border border-white bg-[#FF5200] font-medium text-[10px] text-white tracking-tighter">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <NotificationsSheet isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </>
  );
}

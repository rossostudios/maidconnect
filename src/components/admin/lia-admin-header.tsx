"use client";

import { MenuTwoLineIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { geistMono, geistSans } from "@/app/fonts";
import { AdminMobileSidebar } from "@/components/admin/admin-mobile-sidebar";
import { ConnectionStatusIndicator } from "@/components/admin/connection-status-indicator";
import { NotificationBell } from "@/components/admin/notification-bell";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { cn } from "@/lib/utils";

type Props = {
  userEmail?: string;
  userName?: string;
  userAvatarUrl?: string;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
};

/**
 * LiaAdminHeader - Lia Design System
 *
 * Inspired by Bloomberg Terminal + Swiss Design:
 * - Ultra-high contrast for maximum readability
 * - Geist Sans for all text
 * - Pure white background with deep black borders
 * - Sharp geometric shapes (no rounded corners)
 * - Electric blue accents for active states
 */
export function LiaAdminHeader({
  userEmail,
  userName,
  userAvatarUrl,
  onToggleSidebar,
  isSidebarCollapsed,
}: Props) {
  const { openCommandPalette } = useKeyboardShortcuts();

  return (
    <header className="sticky top-0 z-30 border-neutral-200 border-b bg-white">
      <div className="flex h-16 w-full items-center gap-4 px-6">
        {/* Left: Mobile menu + Breadcrumbs */}
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="lg:hidden">
            <AdminMobileSidebar
              userAvatarUrl={userAvatarUrl}
              userEmail={userEmail}
              userName={userName}
            />
          </div>
          {onToggleSidebar && (
            <button
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden border border-neutral-200 bg-white p-2 text-neutral-900 transition-colors hover:border-neutral-900 hover:bg-neutral-50 lg:flex"
              onClick={onToggleSidebar}
              type="button"
            >
              <HugeiconsIcon className="h-5 w-5" icon={MenuTwoLineIcon} />
            </button>
          )}
          <Breadcrumbs />
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
          {/* Connection Status */}
          <ConnectionStatusIndicator compact />

          {/* Notifications */}
          <NotificationBell />
        </div>
      </div>
    </header>
  );
}

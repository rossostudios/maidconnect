/**
 * LiaCustomerShell - Anthropic-Inspired Customer Dashboard Shell
 *
 * Unified shell component for the customer dashboard with dual sidebar,
 * header integration, and consistent layout patterns matching the admin panel's
 * Lia Design System implementation.
 *
 * Features:
 * - Dual sidebar (64px icon rail + 240px content sidebar = 304px total)
 * - Category-based navigation with search
 * - User profile in sidebar footer
 * - 64px header (h-16) - matches admin panel
 * - Geist Sans typography throughout
 * - Orange accent system for active states
 * - Rounded-lg for all containers (Anthropic design)
 * - Neutral-50 main content background
 */

"use client";

import type { ReactNode } from "react";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils";
import { CustomerHeader } from "./customer-header";
import { LiaCustomerDoubleSidebar } from "./lia-customer-double-sidebar";

type Props = {
  children: ReactNode;
  userEmail?: string;
  userName?: string;
  userAvatarUrl?: string;
  unreadMessagesCount?: number;
};

export function LiaCustomerShell({
  children,
  userEmail,
  userName,
  userAvatarUrl,
  unreadMessagesCount = 0,
}: Props) {
  return (
    <div className={cn("flex h-screen overflow-hidden bg-white", geistSans.className)}>
      {/* Dual Sidebar - Desktop Only (304px: 64px icon rail + 240px content sidebar) */}
      <div className="hidden lg:flex lg:w-[304px]">
        <LiaCustomerDoubleSidebar
          unreadMessagesCount={unreadMessagesCount}
          userAvatarUrl={userAvatarUrl}
          userEmail={userEmail}
          userName={userName}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <CustomerHeader unreadMessagesCount={unreadMessagesCount} />

        {/* Main Content - Scrollable */}
        <main
          className="flex-1 overflow-y-auto bg-neutral-50 px-6 py-6 lg:px-8"
          id="main-content"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

/**
 * LiaProShell - Anthropic-Inspired Professional Dashboard Shell
 *
 * Unified shell component for the professional dashboard with dual sidebar,
 * header integration, and consistent layout patterns matching the customer/admin
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
import { useState } from "react";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils";
import { LiaProDoubleSidebar } from "./lia-pro-double-sidebar";
import { ProHeader } from "./pro-header";

type OnboardingStatus =
  | "application_pending"
  | "application_in_review"
  | "approved"
  | "active"
  | "suspended";

type Props = {
  children: ReactNode;
  userEmail?: string;
  userName?: string;
  userAvatarUrl?: string;
  pendingLeadsCount?: number;
  unreadMessagesCount?: number;
  onboardingStatus?: OnboardingStatus;
  onboardingCompletion?: number;
  countryCode?: string;
};

export function LiaProShell({
  children,
  userEmail,
  userName,
  userAvatarUrl,
  pendingLeadsCount = 0,
  unreadMessagesCount = 0,
  onboardingStatus = "active",
  onboardingCompletion = 100,
  countryCode,
}: Props) {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  return (
    <div className={cn("flex h-screen overflow-hidden bg-white", geistSans.className)}>
      {/* Dual Sidebar - Desktop Only (304px: 64px icon rail + 240px content sidebar) */}
      {sidebarVisible && (
        <div className="hidden lg:flex lg:w-[304px]">
          <LiaProDoubleSidebar
            countryCode={countryCode}
            pendingLeadsCount={pendingLeadsCount}
            userAvatarUrl={userAvatarUrl}
            userEmail={userEmail}
            userName={userName}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <ProHeader
          onboardingCompletion={onboardingCompletion}
          onboardingStatus={onboardingStatus}
          onToggleSidebar={() => setSidebarVisible((prev) => !prev)}
          pendingLeadsCount={pendingLeadsCount}
          unreadMessagesCount={unreadMessagesCount}
        />

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

"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { geistSans } from "@/app/fonts";
import { ProHeader } from "@/components/professional/pro-header";
import { ProSidebar } from "@/components/professional/pro-sidebar";
import { cn } from "@/lib/utils";

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
}: Props) {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  return (
    <div className={cn("flex h-screen overflow-hidden bg-white", geistSans.className)}>
      <div
        aria-hidden={!sidebarVisible}
        className={cn(
          "hidden overflow-hidden border-neutral-200 border-r bg-white transition-[width,opacity] duration-300 lg:flex lg:flex-col",
          sidebarVisible ? "lg:w-64 lg:opacity-100" : "lg:w-0 lg:opacity-0"
        )}
        data-collapsed={!sidebarVisible}
      >
        <div className="w-64 flex-1">
          <ProSidebar
            onboardingCompletion={onboardingCompletion}
            onboardingStatus={onboardingStatus}
            pendingLeadsCount={pendingLeadsCount}
            userAvatarUrl={userAvatarUrl}
            userEmail={userEmail}
            userName={userName}
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <ProHeader
          isSidebarCollapsed={!sidebarVisible}
          onboardingCompletion={onboardingCompletion}
          onboardingStatus={onboardingStatus}
          onToggleSidebar={() => setSidebarVisible((prev) => !prev)}
          pendingLeadsCount={pendingLeadsCount}
          unreadMessagesCount={unreadMessagesCount}
          userEmail={userEmail}
          userName={userName}
        />

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

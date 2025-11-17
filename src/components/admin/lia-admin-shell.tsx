"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { geistSans } from "@/app/fonts";
import { LiaAdminHeader } from "@/components/admin/lia-admin-header";
import { LiaAdminSidebar } from "@/components/admin/lia-admin-sidebar";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  userEmail?: string;
  userName?: string;
  userAvatarUrl?: string;
};

export function LiaAdminShell({ children, userEmail, userName, userAvatarUrl }: Props) {
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
          <LiaAdminSidebar
            userAvatarUrl={userAvatarUrl}
            userEmail={userEmail}
            userName={userName}
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <LiaAdminHeader
          isSidebarCollapsed={!sidebarVisible}
          onToggleSidebar={() => setSidebarVisible((prev) => !prev)}
          userAvatarUrl={userAvatarUrl}
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

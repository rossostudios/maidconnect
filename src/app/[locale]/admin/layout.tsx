import type { ReactNode } from "react";
import { geistSans } from "@/app/fonts";
import { LiaAdminHeader } from "@/components/admin/lia-admin-header";
import { LiaAdminSidebar } from "@/components/admin/lia-admin-sidebar";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
};

/**
 * Admin Layout - Lia Design System
 *
 * Inspired by Bloomberg Terminal + Swiss Design:
 * - Ultra-high contrast for readability (WCAG AAA)
 * - Geist Sans for UI text, Geist Mono for data
 * - Pure white backgrounds with deep black borders
 * - Electric blue accents for primary actions
 * - Sharp geometric design language
 */
export default async function AdminLayout({ children }: Props) {
  const user = await requireUser({ allowedRoles: ["admin"] });

  // Fetch full profile data (name + avatar)
  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <div className={cn("flex h-screen overflow-hidden bg-white", geistSans.className)}>
      {/* Sidebar - Fixed on desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col">
        <LiaAdminSidebar
          userAvatarUrl={profile?.avatar_url ?? undefined}
          userEmail={user.email ?? undefined}
          userName={profile?.full_name ?? undefined}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <LiaAdminHeader
          userAvatarUrl={profile?.avatar_url ?? undefined}
          userEmail={user.email ?? undefined}
          userName={profile?.full_name ?? undefined}
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

import type { ReactNode } from "react";
import { LiaAdminShell } from "@/components/admin/lia-admin-shell";
import { requireUser } from "@/lib/auth";
import { AdminCountryFilterProvider } from "@/lib/contexts/AdminCountryFilterContext";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

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
    <AdminCountryFilterProvider>
      <LiaAdminShell
        userAvatarUrl={profile?.avatar_url ?? undefined}
        userEmail={user.email ?? undefined}
        userName={profile?.full_name ?? undefined}
      >
        {children}
      </LiaAdminShell>
    </AdminCountryFilterProvider>
  );
}

import type { ReactNode } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type Props = {
  children: ReactNode;
};

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
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop Sidebar - More spacious */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Enhanced Header */}
        <AdminHeader
          avatarUrl={profile?.avatar_url ?? undefined}
          userEmail={user.email ?? undefined}
          userName={profile?.full_name ?? undefined}
        />

        {/* Main Content Area - More spacious */}
        <main className="flex-1 overflow-y-auto bg-slate-50 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}

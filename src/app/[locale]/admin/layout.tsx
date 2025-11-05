import type { ReactNode } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireUser } from "@/lib/auth";

type Props = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: Props) {
  const user = await requireUser({ allowedRoles: ["admin"] });

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAF9]">
      {/* Desktop Sidebar - More spacious */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Enhanced Header */}
        <AdminHeader userEmail={user.email ?? undefined} userName={user.user_metadata?.full_name} />

        {/* Main Content Area - More spacious */}
        <main className="flex-1 overflow-y-auto bg-[#FAFAF9]">
          <div className="mx-auto max-w-[1600px] px-8 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

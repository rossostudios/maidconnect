import type { ReactNode } from "react";
import { CustomerHeader } from "@/components/customer/customer-header";
import { CustomerSidebar } from "@/components/customer/customer-sidebar";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type Props = {
  children: ReactNode;
};

export default async function CustomerLayout({ children }: Props) {
  const user = await requireUser({ allowedRoles: ["customer"] });

  // Fetch user profile data
  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  // Fetch unread messages count for badge
  const { count: unreadMessagesCount } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", user.id)
    .eq("read", false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFEEFF8E8]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <CustomerSidebar unreadMessagesCount={unreadMessagesCount ?? 0} />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <CustomerHeader
          unreadMessagesCount={unreadMessagesCount ?? 0}
          userEmail={user.email ?? undefined}
          userName={profile?.full_name ?? undefined}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#FFEEFF8E8] px-8 py-8">{children}</main>
      </div>
    </div>
  );
}

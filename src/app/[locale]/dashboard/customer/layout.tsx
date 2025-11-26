import type { ReactNode } from "react";
import { CustomerAirbnbShell } from "@/components/customer/customer-airbnb-shell";
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
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  // Fetch unread messages count for badge
  const { count: unreadMessagesCount } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", user.id)
    .eq("read", false);

  return (
    <CustomerAirbnbShell
      unreadMessagesCount={unreadMessagesCount ?? 0}
      userAvatarUrl={profile?.avatar_url ?? undefined}
      userEmail={user.email ?? undefined}
      userName={profile?.full_name ?? undefined}
    >
      {children}
    </CustomerAirbnbShell>
  );
}

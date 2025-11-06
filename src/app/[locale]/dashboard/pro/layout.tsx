import type { ReactNode } from "react";
import { ProHeader } from "@/components/professional/pro-header";
import { ProSidebar } from "@/components/professional/pro-sidebar";
import { requireUser } from "@/lib/auth";
import { calculateOnboardingCompletion } from "@/lib/onboarding/completion-calculator";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type Props = {
  children: ReactNode;
};

export default async function ProLayout({ children }: Props) {
  const user = await requireUser({ allowedRoles: ["professional"] });

  // Fetch user profile data
  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, onboarding_status")
    .eq("id", user.id)
    .maybeSingle();

  // Fetch professional profile for onboarding completion
  const { data: professionalProfile } = await supabase
    .from("professional_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // Calculate onboarding completion percentage
  const onboardingCompletion = calculateOnboardingCompletion(
    professionalProfile,
    profile?.onboarding_status
  );

  // Fetch pending leads count for badge
  const { count: pendingLeadsCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("professional_id", user.id)
    .eq("status", "pending");

  // Fetch unread messages count for badge
  const { count: unreadMessagesCount } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", user.id)
    .eq("read", false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAF9]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <ProSidebar
          onboardingCompletion={onboardingCompletion}
          onboardingStatus={profile?.onboarding_status as any}
          pendingLeadsCount={pendingLeadsCount ?? 0}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <ProHeader
          onboardingCompletion={onboardingCompletion}
          onboardingStatus={profile?.onboarding_status as any}
          pendingLeadsCount={pendingLeadsCount ?? 0}
          unreadMessagesCount={unreadMessagesCount ?? 0}
          userEmail={user.email ?? undefined}
          userName={profile?.full_name ?? undefined}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#FAFAF9] px-8 py-8">{children}</main>
      </div>
    </div>
  );
}

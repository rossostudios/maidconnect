import type { ReactNode } from "react";
import { LiaProShell } from "@/components/professional/lia-pro-shell";
import { requireUser } from "@/lib/auth";
import { calculateOnboardingCompletion } from "@/lib/onboarding/completion-calculator";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type Props = {
  children: ReactNode;
};

export default async function ProLayout({ children }: Props) {
  const user = await requireUser({ allowedRoles: ["professional"] });

  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, onboarding_status, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const { data: professionalProfile } = await supabase
    .from("professional_profiles")
    .select("*, country_code")
    .eq("user_id", user.id)
    .maybeSingle();

  const onboardingCompletion = calculateOnboardingCompletion(
    professionalProfile,
    profile?.onboarding_status
  );

  const { count: pendingLeadsCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("professional_id", user.id)
    .eq("status", "pending");

  const { count: unreadMessagesCount } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", user.id)
    .eq("read", false);

  return (
    <LiaProShell
      countryCode={professionalProfile?.country_code ?? undefined}
      onboardingCompletion={onboardingCompletion}
      onboardingStatus={profile?.onboarding_status ?? ""}
      pendingLeadsCount={pendingLeadsCount ?? 0}
      unreadMessagesCount={unreadMessagesCount ?? 0}
      userAvatarUrl={profile?.avatar_url ?? undefined}
      userEmail={user.email ?? undefined}
      userName={profile?.full_name ?? undefined}
    >
      {children}
    </LiaProShell>
  );
}

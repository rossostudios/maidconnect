import { unstable_noStore } from "next/cache";
import { geistSans } from "@/app/fonts";
import { ProProfileSettings } from "@/components/professional/pro-profile-settings";
import { EarningsBadgeSettings } from "@/components/professionals/earnings-badge-settings";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { cn } from "@/lib/utils";

export default async function ProSettingsProfilePage() {
  unstable_noStore();

  const user = await requireUser({ allowedRoles: ["professional"] });
  const supabase = await createSupabaseServerClient();

  const { data: profile } = await supabase
    .from("professional_profiles")
    .select("slug, profile_visibility")
    .eq("profile_id", user.id)
    .maybeSingle();

  const vanityBaseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://casaora.com").replace(
    /\/$/,
    ""
  );

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <p
          className={cn(
            "font-semibold text-neutral-600 text-xs uppercase tracking-[0.2em]",
            geistSans.className
          )}
        >
          Settings
        </p>
        <h1 className={cn("font-semibold text-3xl text-neutral-900", geistSans.className)}>
          Profile & visibility
        </h1>
        <p className={cn("text-base text-neutral-700 leading-relaxed", geistSans.className)}>
          Manage your public profile link, visibility, and what information shows up on your digital
          CV.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProProfileSettings
          initialSlug={profile?.slug ?? ""}
          profileVisibility={profile?.profile_visibility ?? "private"}
          vanityBaseUrl={vanityBaseUrl}
        />

        <div className="space-y-4 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="space-y-1">
            <p
              className={cn(
                "font-semibold text-neutral-600 text-xs uppercase tracking-[0.18em]",
                geistSans.className
              )}
            >
              Verification
            </p>
            <h2 className={cn("font-semibold text-neutral-900 text-xl", geistSans.className)}>
              Earnings badge visibility
            </h2>
            <p className={cn("text-neutral-600 text-sm", geistSans.className)}>
              Control whether your earnings badge appears on the public profile you share.
            </p>
          </div>
          <EarningsBadgeSettings />
        </div>
      </div>
    </section>
  );
}

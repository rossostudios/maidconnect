import { unstable_noStore } from "next/cache";
import { geistSans } from "@/app/fonts";
import { ProProfileSettings } from "@/components/professional/pro-profile-settings";
import { EarningsBadgeSettings } from "@/components/professionals/earnings-badge-settings";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { cn } from "@/lib/utils";

// Module-scope regex for performance (Biome useTopLevelRegex fix)
const TRAILING_SLASH_PATTERN = /\/$/;

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
    TRAILING_SLASH_PATTERN,
    ""
  );

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <p
          className={cn(
            "font-semibold text-muted-foreground text-xs uppercase tracking-[0.2em]",
            geistSans.className
          )}
        >
          Settings
        </p>
        <h1 className={cn("font-semibold text-3xl text-foreground", geistSans.className)}>
          Profile & visibility
        </h1>
        <p className={cn("text-base text-muted-foreground leading-relaxed", geistSans.className)}>
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

        <div className="space-y-4 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="space-y-1">
            <p
              className={cn(
                "font-semibold text-muted-foreground text-xs uppercase tracking-[0.18em]",
                geistSans.className
              )}
            >
              Verification
            </p>
            <h2 className={cn("font-semibold text-foreground text-xl", geistSans.className)}>
              Earnings badge visibility
            </h2>
            <p className={cn("text-muted-foreground text-sm", geistSans.className)}>
              Control whether your earnings badge appears on the public profile you share.
            </p>
          </div>
          <EarningsBadgeSettings />
        </div>
      </div>
    </section>
  );
}

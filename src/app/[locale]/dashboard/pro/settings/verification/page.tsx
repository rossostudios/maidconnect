import { unstable_noStore } from "next/cache";
import { getTranslations } from "next-intl/server";
import { geistSans } from "@/app/fonts";
import type { Credential } from "@/components/portfolio/credentials-manager";
import { CredentialsManager } from "@/components/portfolio/credentials-manager";
import type { TrustProfileData } from "@/components/portfolio/trust-profile-section";
import { TrustProfileSection } from "@/components/portfolio/trust-profile-section";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { cn } from "@/lib/utils";

export default async function ProSettingsVerificationPage() {
  unstable_noStore();

  const user = await requireUser({ allowedRoles: ["professional"] });
  const supabase = await createSupabaseServerClient();
  const t = await getTranslations("dashboard.pro.settings.verification");

  // Fetch verification and credentials data
  const { data: profileData, error } = await supabase
    .from("professional_profiles")
    .select(`
      credentials,
      background_check_status,
      background_check_date,
      identity_verified,
      phone_verified,
      email_verified,
      created_at
    `)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching verification data:", error);
  }

  // Fetch review summary for trust profile
  const { data: reviewData } = await supabase
    .from("reviews")
    .select("rating")
    .eq("professional_id", user.id);

  const credentials = (profileData?.credentials as Credential[]) || [];

  // Build review summary
  const reviewSummary =
    reviewData && reviewData.length > 0
      ? {
          averageRating: reviewData.reduce((sum, r) => sum + r.rating, 0) / reviewData.length,
          totalReviews: reviewData.length,
          fiveStarCount: reviewData.filter((r) => r.rating === 5).length,
          fourStarCount: reviewData.filter((r) => r.rating === 4).length,
          threeStarCount: reviewData.filter((r) => r.rating === 3).length,
          twoStarCount: reviewData.filter((r) => r.rating === 2).length,
          oneStarCount: reviewData.filter((r) => r.rating === 1).length,
        }
      : undefined;

  // Build trust profile data
  const trustProfile: TrustProfileData = {
    backgroundCheckStatus: profileData?.background_check_status || "not_started",
    backgroundCheckDate: profileData?.background_check_date || undefined,
    verifications: [
      {
        id: "email",
        type: "email",
        label: "Email Address",
        verified: profileData?.email_verified ?? false,
      },
      {
        id: "phone",
        type: "phone",
        label: "Phone Number",
        verified: profileData?.phone_verified ?? false,
      },
      {
        id: "identity",
        type: "identity",
        label: "Government ID",
        verified: profileData?.identity_verified ?? false,
      },
    ],
    trustBadges: [],
    reviewSummary,
    profileCompleteness: calculateProfileCompleteness(profileData, credentials),
    memberSince: profileData?.created_at || new Date().toISOString(),
  };

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <p
          className={cn(
            "font-semibold text-muted-foreground text-xs uppercase tracking-[0.2em]",
            geistSans.className
          )}
        >
          {t("breadcrumb")}
        </p>
        <h1 className={cn("font-semibold text-3xl text-foreground", geistSans.className)}>
          {t("title")}
        </h1>
        <p className={cn("text-base text-muted-foreground leading-relaxed", geistSans.className)}>
          {t("description")}
        </p>
      </div>

      {/* Trust Profile Section */}
      <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <TrustProfileSection professionalId={user.id} trustProfile={trustProfile} />
      </div>

      {/* Credentials Section */}
      <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-6 space-y-1">
          <h2 className={cn("font-semibold text-foreground text-xl", geistSans.className)}>
            {t("credentials.title")}
          </h2>
          <p className={cn("text-muted-foreground text-sm", geistSans.className)}>
            {t("credentials.description")}
          </p>
        </div>
        <CredentialsManager credentials={credentials} professionalId={user.id} />
      </div>
    </section>
  );
}

/**
 * Calculate profile verification completeness
 * Focuses on verification items only (not portfolio)
 */
function calculateProfileCompleteness(profileData: any, credentials: Credential[]): number {
  const checks = [
    profileData?.email_verified,
    profileData?.phone_verified,
    profileData?.identity_verified,
    profileData?.background_check_status === "passed",
    credentials.length > 0,
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

import { getTranslations } from "next-intl/server";
import type { BeforeAfterPair, PortfolioImage } from "@/app/api/professional/portfolio/route";
import { geistSans } from "@/app/fonts";
import { PortfolioDashboard } from "@/components/portfolio/portfolio-dashboard";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { cn } from "@/lib/utils";

export default async function ProPortfolioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.pro.portfolio" });

  const user = await requireUser({ allowedRoles: ["professional"] });
  const supabase = await createSupabaseServerClient();

  // Fetch portfolio data (work showcase only)
  const { data: profileData, error } = await supabase
    .from("professional_profiles")
    .select(`
      portfolio_images,
      before_after_pairs,
      featured_work,
      featured_image_id
    `)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching portfolio data:", error);
  }

  // Fetch professional's display name
  const { data: userProfile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const images = (profileData?.portfolio_images as PortfolioImage[]) || [];
  const beforeAfterPairs = (profileData?.before_after_pairs as BeforeAfterPair[]) || [];
  const featuredWork = profileData?.featured_work || "";
  const featuredImageId = profileData?.featured_image_id || undefined;
  const professionalName = userProfile?.full_name || "";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1
          className={cn(
            "font-semibold text-3xl text-foreground tracking-tight",
            geistSans.className
          )}
        >
          {t("title")}
        </h1>
        <p
          className={cn(
            "mt-1.5 font-normal text-muted-foreground text-sm tracking-wide",
            geistSans.className
          )}
        >
          {t("description")}
        </p>
      </div>

      {/* Portfolio Dashboard (Single Scrolling Page) */}
      <PortfolioDashboard
        beforeAfterPairs={beforeAfterPairs}
        featuredImageId={featuredImageId}
        featuredWork={featuredWork}
        images={images}
        professionalId={user.id}
        professionalName={professionalName}
      />
    </div>
  );
}

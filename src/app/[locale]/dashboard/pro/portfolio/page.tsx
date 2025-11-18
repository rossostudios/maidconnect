import { getTranslations } from "next-intl/server";
import type { PortfolioImage } from "@/app/api/professional/portfolio/route";
import { geistSans } from "@/app/fonts";
import { PortfolioManager } from "@/components/portfolio/portfolio-manager";
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

  const { data: profileData, error } = await supabase
    .from("professional_profiles")
    .select("portfolio_images, featured_work")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching portfolio data:", error);
  }

  const images = (profileData?.portfolio_images as PortfolioImage[]) || [];
  const featuredWork = profileData?.featured_work || "";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1
          className={cn(
            "font-semibold text-3xl text-neutral-900 uppercase tracking-tight",
            geistSans.className
          )}
        >
          {t("title")}
        </h1>
        <p
          className={cn(
            "mt-1.5 font-normal text-neutral-700 text-sm tracking-wide",
            geistSans.className
          )}
        >
          {t("description")}
        </p>
      </div>

      {/* Portfolio Manager */}
      <div className="border border-neutral-200 bg-white p-6">
        <PortfolioManager featuredWork={featuredWork} images={images} />
      </div>
    </div>
  );
}

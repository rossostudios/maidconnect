import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { PortfolioManager } from "@/components/portfolio/portfolio-manager";
import type { PortfolioImage } from "@/app/api/professional/portfolio/route";
import { getTranslations } from "next-intl/server";

export default async function ProPortfolioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.pro.portfolio" });

  const user = await requireUser({ allowedRoles: ["professional"] });
  const supabase = await createSupabaseServerClient();

  // Fetch professional profile with portfolio data
  const { data: profileData, error } = await supabase
    .from("professional_profiles")
    .select("portfolio_images, featured_work")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch portfolio:", error);
  }

  const images = (profileData?.portfolio_images as PortfolioImage[]) || [];
  const featuredWork = profileData?.featured_work || "";

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
        <h1 className="text-3xl font-semibold text-[#211f1a]">{t("title")}</h1>
        <p className="mt-2 text-base leading-relaxed text-[#5d574b]">
          {t("description")}
        </p>
      </div>

      {/* Portfolio Manager */}
      <div className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
        <PortfolioManager images={images} featuredWork={featuredWork} />
      </div>
    </section>
  );
}

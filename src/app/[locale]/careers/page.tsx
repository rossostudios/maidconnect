import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CareersHero } from "@/components/careers/careers-hero";
import { CareersPositions } from "@/components/careers/careers-positions";
import { CareersValues } from "@/components/careers/careers-values";
import { SiteFooter } from "@/components/sections/site-footer";
import { SiteHeader } from "@/components/sections/site-header";

// Revalidate daily (86400 seconds) - careers don't change frequently
export const revalidate = 86_400;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.careers.meta" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />
      <main>
        <CareersHero />
        <CareersValues />
        <CareersPositions />
      </main>
      <SiteFooter />
    </div>
  );
}

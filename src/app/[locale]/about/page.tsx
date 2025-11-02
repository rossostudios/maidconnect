import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { CompanyStory } from "@/components/about/company-story";
import { MissionVision } from "@/components/about/mission-vision";
import { TeamSection } from "@/components/about/team-section";
import { SiteHeader } from "@/components/sections/site-header";
import { SiteFooter } from "@/components/sections/site-footer";
import { Link } from "@/i18n/routing";
import { ArrowRight, CheckCircle } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about.meta" });

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
    },
  };
}

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Company Story Hero */}
        <CompanyStory />

        {/* Mission & Vision */}
        <MissionVision />

        {/* Team Section */}
        <TeamSection />

        {/* Trust Indicators Section */}
        <TrustIndicators />

        {/* CTA Section */}
        <CTASection />
      </main>

      <SiteFooter />
    </div>
  );
}

/**
 * Trust Indicators Section
 * Shows security, verification, and safety features
 */
function TrustIndicators() {
  const t = useTranslations("about.trust");

  const indicators = [
    {
      titleKey: "verification.title",
      descKey: "verification.description",
    },
    {
      titleKey: "secure.title",
      descKey: "secure.description",
    },
    {
      titleKey: "support.title",
      descKey: "support.description",
    },
    {
      titleKey: "transparency.title",
      descKey: "transparency.description",
    },
  ];

  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="mb-4 font-bold text-3xl text-[#211f1a] sm:text-4xl">{t("title")}</h2>
          <p className="text-[#5d574b] text-lg">{t("subtitle")}</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {indicators.map((indicator, index) => (
            <div key={index} className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mb-2 font-semibold text-[#211f1a]">{t(indicator.titleKey)}</h3>
              <p className="text-[#5d574b] text-sm">{t(indicator.descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * CTA Section
 * Strategic call-to-action following conversion optimization best practices
 */
function CTASection() {
  const t = useTranslations("about.cta");

  return (
    <section className="bg-gradient-to-r from-[#ff5d46] to-[#e54d36] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="mb-4 font-bold text-3xl text-white sm:text-4xl">{t("title")}</h2>
        <p className="mb-8 text-lg text-white/90">{t("subtitle")}</p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-4 font-semibold text-[#ff5d46] transition hover:bg-gray-100 active:scale-95"
            href="/professionals"
          >
            {t("browseProfessionals")}
            <ArrowRight className="h-5 w-5" />
          </Link>

          <Link
            className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white px-8 py-4 font-semibold text-white transition hover:bg-white/10 active:scale-95"
            href="/auth/sign-up"
          >
            {t("signUp")}
          </Link>
        </div>
      </div>
    </section>
  );
}

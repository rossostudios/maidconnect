import { ArrowRight01Icon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { CompanyStory, StatsSection, StoryContent } from "@/components/about/company-story";
import { MissionVision } from "@/components/about/mission-vision";
import { TeamSection } from "@/components/about/team-section";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";

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
    <div className="flex min-h-screen flex-col bg-[#FFEEFF8E8]">
      <SiteHeader />

      <main className="flex-1">
        {/* Company Story Hero */}
        <CompanyStory />

        {/* Stats Section */}
        <StatsSection />

        {/* Story Content (Problem, Solution, Journey) */}
        <StoryContent />

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
    <section className="bg-[#FFEEFF8E8] py-20 sm:py-24 lg:py-32">
      <Container>
        <div className="mb-16 text-center">
          <p className="tagline text-[#AA88AAAAC]">WHY CHOOSE US</p>
          <h2 className="serif-display-lg mt-6 text-[#116611616]">{t("title")}</h2>
          <p className="lead mx-auto mt-6 max-w-2xl text-[#116611616]/70">{t("subtitle")}</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {indicators.map((indicator, index) => (
            <div className="text-center" key={index}>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#FF4444A22]/100/10">
                <HugeiconsIcon className="h-8 w-8 text-[#FF4444A22]" icon={CheckmarkCircle01Icon} />
              </div>
              <h3 className="serif-headline-sm mb-4 text-[#116611616]">{t(indicator.titleKey)}</h3>
              <p className="text-[#116611616]/70 text-base leading-relaxed">
                {t(indicator.descKey)}
              </p>
            </div>
          ))}
        </div>
      </Container>
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
    <section className="bg-[#116611616] py-20 sm:py-24 lg:py-32">
      <Container className="max-w-4xl">
        <div className="text-center">
          <h2 className="serif-display-lg text-[#FFEEFF8E8]">{t("title")}</h2>
          <p className="lead mt-6 text-[#FFEEFF8E8]/90">{t("subtitle")}</p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FFEEFF8E8] px-8 py-4 font-semibold text-[#116611616] text-base transition hover:bg-[#EE44EE2E3]"
              href="/professionals"
            >
              {t("browseProfessionals")}
              <HugeiconsIcon className="h-5 w-5" icon={ArrowRight01Icon} />
            </Link>

            <Link
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#FFEEFF8E8] px-8 py-4 font-semibold text-[#FFEEFF8E8] text-base transition hover:bg-[#FFEEFF8E8]/10"
              href="/auth/sign-up"
            >
              {t("signUp")}
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

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
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <SiteHeader overlay />

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
 * Shows security, verification, and safety features - Airbnb-style cards
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
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <Container className="max-w-5xl">
        <div className="mb-10 text-center sm:mb-12">
          <div className="mb-4 inline-flex items-center rounded-full border border-rausch-200 bg-rausch-50 px-4 py-1.5">
            <span className="font-semibold text-rausch-600 text-xs uppercase tracking-wider">
              Why Choose Us
            </span>
          </div>
          <h2 className="font-[family-name:var(--font-geist-sans)] font-semibold text-2xl text-neutral-900 sm:text-3xl lg:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-neutral-600 sm:text-lg">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {indicators.map((indicator, index) => (
            <div
              className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-center transition-shadow hover:shadow-md"
              key={index}
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <HugeiconsIcon className="h-6 w-6 text-green-600" icon={CheckmarkCircle01Icon} />
              </div>
              <h3 className="mb-2 font-semibold text-neutral-900 text-sm">
                {t(indicator.titleKey)}
              </h3>
              <p className="text-neutral-600 text-sm leading-relaxed">{t(indicator.descKey)}</p>
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
    <section className="bg-neutral-900 py-16 sm:py-20 lg:py-24">
      <Container className="max-w-3xl">
        <div className="text-center">
          <h2 className="font-[family-name:var(--font-geist-sans)] font-bold text-2xl text-white sm:text-3xl lg:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/80 sm:text-lg">
            {t("subtitle")}
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-base text-neutral-900 transition hover:bg-neutral-100"
              href="/pros"
            >
              {t("browseProfessionals")}
              <HugeiconsIcon className="h-5 w-5" icon={ArrowRight01Icon} />
            </Link>

            <Link
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/30 px-6 py-3 font-semibold text-base text-white transition hover:border-white/50 hover:bg-white/10"
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

import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

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

export default async function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-rausch-950">
      <SiteHeader overlay />
      <main className="flex-1">
        <HeroSection />
        <StorySection />
        <MissionSection />
        <CTASection />
      </main>
      <SiteFooter />
    </div>
  );
}

/**
 * Hero Section
 * Full-bleed background image with overlay - Airbnb-style
 */
async function HeroSection() {
  const t = await getTranslations("about.hero");

  return (
    <section className="relative min-h-[60vh] sm:min-h-[70vh]">
      {/* Full-bleed Background Image */}
      <div className="absolute inset-0">
        <Image
          alt="Professional home service provider helping a family"
          className="object-cover"
          fill
          priority
          sizes="100vw"
          src="/hero.png"
        />
        {/* Gradient Overlay - always dark for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-rausch-950/80 via-rausch-950/60 to-rausch-950/90" />
      </div>

      {/* Hero Content */}
      <Container className="relative z-10 flex min-h-[60vh] items-center justify-center sm:min-h-[70vh]">
        <div className="max-w-3xl py-24 text-center sm:py-32">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center rounded-full border border-white/30 bg-white/10 px-4 py-1.5 backdrop-blur-sm">
            <span className="font-medium text-sm text-white">{t("badge")}</span>
          </div>

          {/* Headline */}
          <h1 className="font-bold text-4xl text-white leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {t("title")}
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90 sm:text-xl">{t("subtitle")}</p>
        </div>
      </Container>
    </section>
  );
}

/**
 * Story Section
 * The problem we're solving - authentic, relatable narrative
 */
async function StorySection() {
  const t = await getTranslations("about.story");

  return (
    <section className="bg-white py-16 md:py-24 dark:bg-rausch-950">
      <Container className="max-w-3xl">
        {/* The Problem */}
        <div className="mb-12">
          <h2 className="mb-6 font-bold text-2xl text-neutral-900 tracking-tight sm:text-3xl dark:text-white">
            {t("problem.title")}
          </h2>
          <p className="mb-4 text-lg text-neutral-600 leading-relaxed dark:text-rausch-100/80">
            {t("problem.paragraph1")}
          </p>
          <p className="text-lg text-neutral-600 leading-relaxed dark:text-rausch-100/80">
            {t("problem.paragraph2")}
          </p>
        </div>

        {/* Divider */}
        <div className="my-12 h-px bg-neutral-200 dark:bg-rausch-800" />

        {/* The Solution */}
        <div>
          <h2 className="mb-6 font-bold text-2xl text-neutral-900 tracking-tight sm:text-3xl dark:text-white">
            {t("solution.title")}
          </h2>
          <p className="text-lg text-neutral-600 leading-relaxed dark:text-rausch-100/80">
            {t("solution.paragraph1")}
          </p>
        </div>
      </Container>
    </section>
  );
}

/**
 * Mission Section
 * Refined Minimal design - generous whitespace, large typography, subtle texture
 */
async function MissionSection() {
  const t = await getTranslations("about.mission");

  return (
    <section className="relative bg-neutral-50 py-24 md:py-32 dark:bg-rausch-900">
      {/* Subtle dot pattern texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <Container className="relative z-10 max-w-4xl">
        <div className="text-center">
          {/* Section title - larger typography */}
          <h2 className="mb-10 font-bold text-3xl text-neutral-900 tracking-tight sm:text-4xl lg:text-5xl dark:text-white">
            {t("title")}
          </h2>

          {/* Mission statement - quote style treatment */}
          <div className="relative mx-auto max-w-3xl">
            {/* Decorative quotation mark */}
            <span
              aria-hidden="true"
              className="-top-8 -translate-x-1/2 sm:-top-12 absolute left-1/2 select-none font-serif text-8xl text-rausch-200 leading-none sm:text-9xl dark:text-rausch-700"
            >
              "
            </span>

            {/* Statement text - hero-sized */}
            <p className="relative text-2xl text-neutral-700 leading-relaxed sm:text-3xl sm:leading-relaxed dark:text-rausch-100/90">
              {t("statement")}
            </p>

            {/* Subtle decorative line */}
            <div className="mx-auto mt-10 h-1 w-16 rounded-full bg-rausch-300 dark:bg-rausch-600" />
          </div>
        </div>
      </Container>
    </section>
  );
}

/**
 * CTA Section
 * Refined Minimal design - solid background, generous whitespace, clear hierarchy
 */
async function CTASection() {
  const t = await getTranslations("about.cta");

  return (
    <section className="bg-rausch-500 py-24 md:py-32 dark:bg-rausch-700">
      <Container className="max-w-3xl">
        <div className="space-y-8 text-center">
          {/* Headline - larger for impact */}
          <h2 className="font-bold text-3xl text-white tracking-tight sm:text-4xl lg:text-5xl">
            {t("title")}
          </h2>

          {/* Subtitle with more breathing room */}
          <p className="mx-auto max-w-xl text-lg text-white/90 leading-relaxed sm:text-xl">
            {t("subtitle")}
          </p>

          {/* Button group with clear hierarchy */}
          <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row sm:gap-6">
            {/* Primary CTA - larger, bolder */}
            <Link
              className={cn(
                "inline-flex items-center justify-center gap-3 rounded-full px-10 py-4",
                "bg-white font-semibold text-lg text-rausch-600",
                "shadow-lg shadow-rausch-600/20",
                "transition-all duration-200",
                "hover:scale-[1.02] hover:bg-neutral-50 hover:shadow-xl",
                "dark:text-rausch-700"
              )}
              href="/professionals"
            >
              {t("browseProfessionals")}
              <HugeiconsIcon className="h-5 w-5" icon={ArrowRight01Icon} />
            </Link>

            {/* Secondary CTA - more subtle */}
            <Link
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-full px-10 py-4",
                "border border-white/40 font-medium text-white",
                "transition-all duration-200",
                "hover:border-white/60 hover:bg-white/10"
              )}
              href="/become-a-pro"
            >
              {t("becomePro")}
            </Link>
          </div>

          {/* Trust indicator */}
          <p className="pt-4 text-sm text-white/70">{t("trustIndicator")}</p>
        </div>
      </Container>
    </section>
  );
}

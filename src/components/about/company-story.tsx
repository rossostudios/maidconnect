"use client";

/**
 * Company Story Component
 *
 * Full-bleed hero section for About Us page with Airbnb-style design.
 * Features: background image, gradient overlay, large headline, clean typography.
 */

import { GlobeIcon, MagicWand01Icon, Shield01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";

export function CompanyStory() {
  const t = useTranslations("about.story");

  return (
    <section className="relative min-h-[70vh] sm:min-h-[80vh]">
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
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/70 via-neutral-900/50 to-neutral-900/80" />
      </div>

      {/* Hero Content */}
      <Container className="relative z-10 flex min-h-[70vh] items-center justify-center sm:min-h-[80vh]">
        <div className="max-w-4xl py-32 text-center sm:py-40">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center rounded-full border border-white/30 bg-white/20 px-4 py-1.5">
            <span className="font-semibold text-white text-xs uppercase tracking-wider">
              Our Story
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-[family-name:var(--font-geist-sans)] font-bold text-4xl text-white leading-tight sm:text-5xl lg:text-6xl">
            {t("title")}
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90 sm:text-xl lg:text-2xl">
            {t("subtitle")}
          </p>

          {/* Scroll Indicator */}
          <div className="mt-12 flex justify-center">
            <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/40 p-1">
              <div className="h-2 w-1 animate-bounce rounded-full bg-white/80" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/**
 * Stats Section Component
 *
 * Platform statistics and achievements - Airbnb-style stat cards
 */
export function StatsSection() {
  const t = useTranslations("about.stats");

  const stats = [
    {
      value: "10,000+",
      label: t("bookings"),
    },
    {
      value: "2,500+",
      label: t("professionals"),
    },
    {
      value: "4.9/5",
      label: t("rating"),
    },
    {
      value: "98%",
      label: t("satisfaction"),
    },
  ];

  return (
    <section className="bg-white py-16 sm:py-20">
      <Container className="max-w-5xl">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-center"
              key={index}
            >
              <div className="font-[family-name:var(--font-geist-mono)] font-bold text-4xl text-neutral-900 sm:text-5xl">
                {stat.value}
              </div>
              <div className="mt-2 font-medium text-neutral-600 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/**
 * Story Content Section
 *
 * Detailed story about problem, solution, and journey - Airbnb-style cards
 */
export function StoryContent() {
  const t = useTranslations("about.story");

  return (
    <section className="bg-neutral-50 py-16 sm:py-20 lg:py-24">
      <Container className="max-w-4xl">
        {/* The Problem */}
        <div className="mb-12 rounded-xl border border-neutral-200 bg-white p-8 sm:p-10">
          <h2 className="mb-4 font-[family-name:var(--font-geist-sans)] font-semibold text-neutral-900 text-xl sm:text-2xl">
            {t("problem.title")}
          </h2>
          <p className="mb-4 text-base text-neutral-600 leading-relaxed">
            {t("problem.paragraph1")}
          </p>
          <p className="text-base text-neutral-600 leading-relaxed">{t("problem.paragraph2")}</p>
        </div>

        {/* The Solution */}
        <div className="mb-12 rounded-xl border border-neutral-200 bg-white p-8 sm:p-10">
          <h2 className="mb-4 font-[family-name:var(--font-geist-sans)] font-semibold text-neutral-900 text-xl sm:text-2xl">
            {t("solution.title")}
          </h2>
          <p className="mb-8 text-base text-neutral-600 leading-relaxed">
            {t("solution.paragraph1")}
          </p>

          {/* Key Features Grid */}
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-lg bg-neutral-50 p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-rausch-100">
                <HugeiconsIcon className="h-5 w-5 text-rausch-600" icon={Shield01Icon} />
              </div>
              <h3 className="mb-2 font-semibold text-neutral-900 text-sm">
                {t("solution.feature1.title")}
              </h3>
              <p className="text-neutral-600 text-sm">{t("solution.feature1.description")}</p>
            </div>

            <div className="rounded-lg bg-neutral-50 p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-babu-100">
                <HugeiconsIcon className="h-5 w-5 text-babu-600" icon={GlobeIcon} />
              </div>
              <h3 className="mb-2 font-semibold text-neutral-900 text-sm">
                {t("solution.feature2.title")}
              </h3>
              <p className="text-neutral-600 text-sm">{t("solution.feature2.description")}</p>
            </div>

            <div className="rounded-lg bg-neutral-50 p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <HugeiconsIcon className="h-5 w-5 text-green-600" icon={MagicWand01Icon} />
              </div>
              <h3 className="mb-2 font-semibold text-neutral-900 text-sm">
                {t("solution.feature3.title")}
              </h3>
              <p className="text-neutral-600 text-sm">{t("solution.feature3.description")}</p>
            </div>
          </div>
        </div>

        {/* Our Journey */}
        <div className="rounded-xl border border-neutral-200 bg-white p-8 sm:p-10">
          <h2 className="mb-4 font-[family-name:var(--font-geist-sans)] font-semibold text-neutral-900 text-xl sm:text-2xl">
            {t("journey.title")}
          </h2>
          <p className="text-base text-neutral-600 leading-relaxed">{t("journey.paragraph1")}</p>
        </div>
      </Container>
    </section>
  );
}

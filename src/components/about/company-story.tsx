"use client";

/**
 * Company Story Component
 *
 * Hero section for About Us page telling Casaora's founding story.
 * Redesigned with SavvyCal-inspired large headlines and visual hierarchy.
 */

import { GlobeIcon, MagicWand01Icon, Shield01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";

export function CompanyStory() {
  const t = useTranslations("about.story");

  return (
    <section className="bg-[neutral-50] py-20 sm:py-24 lg:py-32">
      <Container className="max-w-5xl">
        {/* Hero Content */}
        <div className="text-center">
          <p className="tagline text-[neutral-400]">OUR STORY</p>
          <h1 className="serif-display-lg mt-6 text-[neutral-900]">{t("title")}</h1>
          <p className="lead mx-auto mt-6 max-w-3xl text-[neutral-900]/70">{t("subtitle")}</p>
        </div>
      </Container>
    </section>
  );
}

/**
 * Stats Section Component
 *
 * Platform statistics and achievements
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
    <section className="bg-[neutral-50] py-20 sm:py-24">
      <Container>
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div className="text-center" key={index}>
              <div className="serif-display-lg mb-3 text-[neutral-500]">{stat.value}</div>
              <div className="font-medium text-[neutral-900]/70 text-base">{stat.label}</div>
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
 * Detailed story about problem, solution, and journey
 */
export function StoryContent() {
  const t = useTranslations("about.story");

  return (
    <section className="bg-[neutral-50] py-20 sm:py-24 lg:py-32">
      <Container className="max-w-4xl">
        {/* The Problem */}
        <div className="mb-16">
          <h2 className="serif-headline-sm mb-6 text-[neutral-900]">{t("problem.title")}</h2>
          <p className="mb-4 text-[neutral-900]/70 text-base leading-relaxed">
            {t("problem.paragraph1")}
          </p>
          <p className="text-[neutral-900]/70 text-base leading-relaxed">
            {t("problem.paragraph2")}
          </p>
        </div>

        {/* The Solution */}
        <div className="mb-16">
          <h2 className="serif-headline-sm mb-6 text-[neutral-900]">{t("solution.title")}</h2>
          <p className="mb-8 text-[neutral-900]/70 text-base leading-relaxed">
            {t("solution.paragraph1")}
          </p>

          {/* Key Features Grid */}
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[neutral-500]/100/10">
                <HugeiconsIcon className="h-7 w-7 text-[neutral-500]" icon={Shield01Icon} />
              </div>
              <h3 className="mb-3 font-semibold text-[neutral-900] text-lg">
                {t("solution.feature1.title")}
              </h3>
              <p className="text-[neutral-900]/70 text-base">
                {t("solution.feature1.description")}
              </p>
            </div>

            <div className="flex flex-col">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[neutral-500]/100/10">
                <HugeiconsIcon className="h-7 w-7 text-[neutral-500]" icon={GlobeIcon} />
              </div>
              <h3 className="mb-3 font-semibold text-[neutral-900] text-lg">
                {t("solution.feature2.title")}
              </h3>
              <p className="text-[neutral-900]/70 text-base">
                {t("solution.feature2.description")}
              </p>
            </div>

            <div className="flex flex-col">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[neutral-500]/100/10">
                <HugeiconsIcon className="h-7 w-7 text-[neutral-500]" icon={MagicWand01Icon} />
              </div>
              <h3 className="mb-3 font-semibold text-[neutral-900] text-lg">
                {t("solution.feature3.title")}
              </h3>
              <p className="text-[neutral-900]/70 text-base">
                {t("solution.feature3.description")}
              </p>
            </div>
          </div>
        </div>

        {/* Our Journey */}
        <div>
          <h2 className="serif-headline-sm mb-6 text-[neutral-900]">{t("journey.title")}</h2>
          <p className="text-[neutral-900]/70 text-base leading-relaxed">
            {t("journey.paragraph1")}
          </p>
        </div>
      </Container>
    </section>
  );
}

"use client";

/**
 * Company Story Component
 *
 * Hero section for About Us page telling Casaora's founding story.
 * Explains why we exist and the problem we're solving for expats in Colombia.
 */

import { GlobeIcon, MagicWand01Icon, Shield01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";

export function CompanyStory() {
  const t = useTranslations("about.story");

  return (
    <section className="bg-[var(--background)] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        {/* Hero Content */}
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="type-serif-lg mb-6 text-[var(--foreground)]">{t("title")}</h1>
          <p className="mb-8 text-[var(--muted-foreground)] text-lg leading-relaxed sm:text-xl">
            {t("subtitle")}
          </p>
        </div>

        {/* Story Content */}
        <div className="mx-auto mt-12 max-w-4xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm sm:p-12">
            {/* The Problem */}
            <div className="mb-10">
              <h2 className="mb-4 font-semibold text-2xl text-[var(--foreground)]">
                {t("problem.title")}
              </h2>
              <p className="mb-4 text-[var(--muted-foreground)] leading-relaxed">
                {t("problem.paragraph1")}
              </p>
              <p className="text-[var(--muted-foreground)] leading-relaxed">
                {t("problem.paragraph2")}
              </p>
            </div>

            {/* The Solution */}
            <div className="mb-10">
              <h2 className="mb-4 font-semibold text-2xl text-[var(--foreground)]">
                {t("solution.title")}
              </h2>
              <p className="mb-6 text-[var(--muted-foreground)] leading-relaxed">
                {t("solution.paragraph1")}
              </p>

              {/* Key Features Grid */}
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="flex flex-col items-start">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--red)]/10">
                    <HugeiconsIcon className="h-6 w-6 text-[var(--red)]" icon={Shield01Icon} />
                  </div>
                  <h3 className="mb-2 font-semibold text-[var(--foreground)]">
                    {t("solution.feature1.title")}
                  </h3>
                  <p className="text-[var(--muted-foreground)] text-sm">
                    {t("solution.feature1.description")}
                  </p>
                </div>

                <div className="flex flex-col items-start">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--red)]/10">
                    <HugeiconsIcon className="h-6 w-6 text-[var(--red)]" icon={GlobeIcon} />
                  </div>
                  <h3 className="mb-2 font-semibold text-[var(--foreground)]">
                    {t("solution.feature2.title")}
                  </h3>
                  <p className="text-[var(--muted-foreground)] text-sm">
                    {t("solution.feature2.description")}
                  </p>
                </div>

                <div className="flex flex-col items-start">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--red)]/10">
                    <HugeiconsIcon className="h-6 w-6 text-[var(--red)]" icon={MagicWand01Icon} />
                  </div>
                  <h3 className="mb-2 font-semibold text-[var(--foreground)]">
                    {t("solution.feature3.title")}
                  </h3>
                  <p className="text-[var(--muted-foreground)] text-sm">
                    {t("solution.feature3.description")}
                  </p>
                </div>
              </div>
            </div>

            {/* Our Journey */}
            <div>
              <h2 className="mb-4 font-semibold text-2xl text-[var(--foreground)]">
                {t("journey.title")}
              </h2>
              <p className="text-[var(--muted-foreground)] leading-relaxed">
                {t("journey.paragraph1")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

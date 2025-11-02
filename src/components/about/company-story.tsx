"use client";

/**
 * Company Story Component
 *
 * Hero section for About Us page telling MaidConnect's founding story.
 * Explains why we exist and the problem we're solving for expats in Colombia.
 */

import { useTranslations } from "next-intl";
import { Sparkles, Globe, Shield } from "lucide-react";

export function CompanyStory() {
  const t = useTranslations("about.story");

  return (
    <section className="bg-gradient-to-b from-white to-gray-50 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        {/* Hero Content */}
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-6 font-bold text-4xl text-[#211f1a] sm:text-5xl lg:text-6xl">
            {t("title")}
          </h1>
          <p className="mb-8 text-[#5d574b] text-lg leading-relaxed sm:text-xl">
            {t("subtitle")}
          </p>
        </div>

        {/* Story Content */}
        <div className="mx-auto mt-12 max-w-4xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm sm:p-12">
            {/* The Problem */}
            <div className="mb-10">
              <h2 className="mb-4 font-semibold text-2xl text-[#211f1a]">{t("problem.title")}</h2>
              <p className="mb-4 text-[#5d574b] leading-relaxed">{t("problem.paragraph1")}</p>
              <p className="text-[#5d574b] leading-relaxed">{t("problem.paragraph2")}</p>
            </div>

            {/* The Solution */}
            <div className="mb-10">
              <h2 className="mb-4 font-semibold text-2xl text-[#211f1a]">{t("solution.title")}</h2>
              <p className="mb-6 text-[#5d574b] leading-relaxed">{t("solution.paragraph1")}</p>

              {/* Key Features Grid */}
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="flex flex-col items-start">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-[#ff5d46]/10">
                    <Shield className="h-6 w-6 text-[#ff5d46]" />
                  </div>
                  <h3 className="mb-2 font-semibold text-[#211f1a]">{t("solution.feature1.title")}</h3>
                  <p className="text-[#5d574b] text-sm">{t("solution.feature1.description")}</p>
                </div>

                <div className="flex flex-col items-start">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-[#ff5d46]/10">
                    <Globe className="h-6 w-6 text-[#ff5d46]" />
                  </div>
                  <h3 className="mb-2 font-semibold text-[#211f1a]">{t("solution.feature2.title")}</h3>
                  <p className="text-[#5d574b] text-sm">{t("solution.feature2.description")}</p>
                </div>

                <div className="flex flex-col items-start">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-[#ff5d46]/10">
                    <Sparkles className="h-6 w-6 text-[#ff5d46]" />
                  </div>
                  <h3 className="mb-2 font-semibold text-[#211f1a]">{t("solution.feature3.title")}</h3>
                  <p className="text-[#5d574b] text-sm">{t("solution.feature3.description")}</p>
                </div>
              </div>
            </div>

            {/* Our Journey */}
            <div>
              <h2 className="mb-4 font-semibold text-2xl text-[#211f1a]">{t("journey.title")}</h2>
              <p className="text-[#5d574b] leading-relaxed">{t("journey.paragraph1")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

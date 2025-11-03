"use client";

/**
 * Team Section Component
 *
 * Showcases our remote-first, distributed team approach.
 * Following GitLab model for transparency about distributed work.
 */

import { Award, Clock, Globe, MapPin, MessageSquare, Users } from "lucide-react";
import { useTranslations } from "next-intl";

export function TeamSection() {
  const t = useTranslations("about.team");

  const teamBenefits = [
    {
      icon: Globe,
      titleKey: "benefits.distributed.title",
      descKey: "benefits.distributed.description",
    },
    {
      icon: MessageSquare,
      titleKey: "benefits.bilingual.title",
      descKey: "benefits.bilingual.description",
    },
    {
      icon: Clock,
      titleKey: "benefits.available.title",
      descKey: "benefits.available.description",
    },
    {
      icon: Award,
      titleKey: "benefits.expertise.title",
      descKey: "benefits.expertise.description",
    },
  ];

  return (
    <section className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="mb-4 font-bold text-3xl text-[#211f1a] sm:text-4xl">{t("title")}</h2>
          <p className="text-[#5d574b] text-lg">{t("subtitle")}</p>
        </div>

        {/* Remote-First Philosophy */}
        <div className="mx-auto mb-12 max-w-4xl rounded-2xl border border-[#ebe5d8] bg-white p-8 shadow-[var(--shadow-card)] sm:p-12">
          <div className="mb-8 flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#8B7355]/10">
              <MapPin className="h-6 w-6 text-[#8B7355]" />
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-[#211f1a] text-xl">
                {t("remoteFirst.title")}
              </h3>
              <p className="text-[#5d574b] leading-relaxed">{t("remoteFirst.description")}</p>
            </div>
          </div>

          {/* Location Stats */}
          <div className="grid gap-6 border-[#ebe5d8] border-t pt-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 font-bold text-3xl text-[#8B7355]">{t("stats.locations")}</div>
              <p className="text-[#5d574b] text-sm">{t("stats.locationsLabel")}</p>
            </div>
            <div className="text-center">
              <div className="mb-2 font-bold text-3xl text-[#8B7355]">{t("stats.timezones")}</div>
              <p className="text-[#5d574b] text-sm">{t("stats.timezonesLabel")}</p>
            </div>
            <div className="text-center">
              <div className="mb-2 font-bold text-3xl text-[#8B7355]">{t("stats.languages")}</div>
              <p className="text-[#5d574b] text-sm">{t("stats.languagesLabel")}</p>
            </div>
          </div>
        </div>

        {/* Team Benefits Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {teamBenefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                className="rounded-xl border border-[#ebe5d8] bg-white p-6 shadow-[var(--shadow-subtle)] transition hover:shadow-[var(--shadow-card)]"
                key={index}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#8B7355]/10">
                  <Icon className="h-6 w-6 text-[#8B7355]" />
                </div>
                <h4 className="mb-2 font-semibold text-[#211f1a]">{t(benefit.titleKey)}</h4>
                <p className="text-[#5d574b] text-sm">{t(benefit.descKey)}</p>
              </div>
            );
          })}
        </div>

        {/* Join Team CTA */}
        <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-[#8B7355]/20 bg-[#8B7355]/5 p-8 text-center">
          <Users className="mx-auto mb-4 h-12 w-12 text-[#8B7355]" />
          <h3 className="mb-3 font-semibold text-[#211f1a] text-xl">{t("joinTeam.title")}</h3>
          <p className="mb-6 text-[#5d574b]">{t("joinTeam.description")}</p>
          <a
            className="inline-flex items-center justify-center rounded-lg bg-[#8B7355] px-6 py-3 font-semibold text-white transition hover:bg-[#9B8B7E] active:scale-95"
            href="/contact"
          >
            {t("joinTeam.cta")}
          </a>
        </div>
      </div>
    </section>
  );
}

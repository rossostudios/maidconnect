"use client";

/**
 * Team Section Component
 *
 * Showcases our remote-first, distributed team approach.
 * Following GitLab model for transparency about distributed work.
 */

import {
  Award01Icon,
  Clock01Icon,
  GlobeIcon,
  Location01Icon,
  Message01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";

export function TeamSection() {
  const t = useTranslations("about.team");

  const teamBenefits = [
    {
      icon: GlobeIcon,
      titleKey: "benefits.distributed.title",
      descKey: "benefits.distributed.description",
    },
    {
      icon: Message01Icon,
      titleKey: "benefits.bilingual.title",
      descKey: "benefits.bilingual.description",
    },
    {
      icon: Clock01Icon,
      titleKey: "benefits.available.title",
      descKey: "benefits.available.description",
    },
    {
      icon: Award01Icon,
      titleKey: "benefits.expertise.title",
      descKey: "benefits.expertise.description",
    },
  ];

  return (
    <section className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="mb-4 font-bold text-3xl text-[var(--foreground)] sm:text-4xl">
            {t("title")}
          </h2>
          <p className="text-[var(--muted-foreground)] text-lg">{t("subtitle")}</p>
        </div>

        {/* Remote-First Philosophy */}
        <div className="mx-auto mb-12 max-w-4xl rounded-2xl border border-[#ebe5d8] bg-white p-8 shadow-[var(--shadow-card)] sm:p-12">
          <div className="mb-8 flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--red)]/10">
              <HugeiconsIcon className="h-6 w-6 text-[var(--red)]" icon={Location01Icon} />
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-[var(--foreground)] text-xl">
                {t("remoteFirst.title")}
              </h3>
              <p className="text-[var(--muted-foreground)] leading-relaxed">
                {t("remoteFirst.description")}
              </p>
            </div>
          </div>

          {/* Location Stats */}
          <div className="grid gap-6 border-[#ebe5d8] border-t pt-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 font-bold text-3xl text-[var(--red)]">
                {t("stats.locations")}
              </div>
              <p className="text-[var(--muted-foreground)] text-sm">{t("stats.locationsLabel")}</p>
            </div>
            <div className="text-center">
              <div className="mb-2 font-bold text-3xl text-[var(--red)]">
                {t("stats.timezones")}
              </div>
              <p className="text-[var(--muted-foreground)] text-sm">{t("stats.timezonesLabel")}</p>
            </div>
            <div className="text-center">
              <div className="mb-2 font-bold text-3xl text-[var(--red)]">
                {t("stats.languages")}
              </div>
              <p className="text-[var(--muted-foreground)] text-sm">{t("stats.languagesLabel")}</p>
            </div>
          </div>
        </div>

        {/* Team Benefits Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {teamBenefits.map((benefit, index) => (
            <div
              className="rounded-xl border border-[#ebe5d8] bg-white p-6 shadow-[var(--shadow-subtle)] transition hover:shadow-[var(--shadow-card)]"
              key={index}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--red)]/10">
                <HugeiconsIcon className="h-6 w-6 text-[var(--red)]" icon={benefit.icon} />
              </div>
              <h4 className="mb-2 font-semibold text-[var(--foreground)]">{t(benefit.titleKey)}</h4>
              <p className="text-[var(--muted-foreground)] text-sm">{t(benefit.descKey)}</p>
            </div>
          ))}
        </div>

        {/* Join Team CTA */}
        <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-[var(--red)]/20 bg-[var(--red)]/5 p-8 text-center">
          <HugeiconsIcon
            className="mx-auto mb-4 h-12 w-12 text-[var(--red)]"
            icon={UserGroupIcon}
          />
          <h3 className="mb-3 font-semibold text-[var(--foreground)] text-xl">
            {t("joinTeam.title")}
          </h3>
          <p className="mb-6 text-[var(--muted-foreground)]">{t("joinTeam.description")}</p>
          <a
            className="inline-flex items-center justify-center rounded-lg bg-[var(--red)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--red-hover)] active:scale-95"
            href="/contact"
          >
            {t("joinTeam.cta")}
          </a>
        </div>
      </div>
    </section>
  );
}

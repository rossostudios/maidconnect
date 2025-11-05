"use client";

/**
 * Mission & Vision Component
 *
 * Displays company mission, vision, and core values.
 * Built following 2025 best practices for trust-building and authenticity.
 */

import {
  CheckmarkCircle01Icon,
  CompassIcon,
  FavouriteIcon,
  GlobeIcon,
  StarIcon,
  Target01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";

export function MissionVision() {
  const t = useTranslations("about.missionVision");

  const values = [
    {
      icon: CheckmarkCircle01Icon,
      titleKey: "values.trust.title",
      descKey: "values.trust.description",
    },
    {
      icon: StarIcon,
      titleKey: "values.quality.title",
      descKey: "values.quality.description",
    },
    {
      icon: GlobeIcon,
      titleKey: "values.bilingual.title",
      descKey: "values.bilingual.description",
    },
    {
      icon: FavouriteIcon,
      titleKey: "values.empowerment.title",
      descKey: "values.empowerment.description",
    },
  ];

  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 font-bold text-3xl text-[var(--foreground)] sm:text-4xl">
            {t("sectionTitle")}
          </h2>
          <p className="text-[var(--muted-foreground)] text-lg">{t("sectionSubtitle")}</p>
        </div>

        {/* Mission & Vision Cards */}
        <div className="mb-16 grid gap-8 lg:grid-cols-2">
          {/* Mission Card */}
          <div className="rounded-2xl border border-[#ebe5d8] bg-white p-10 shadow-[var(--shadow-card)]">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--red)]/10">
              <HugeiconsIcon className="h-7 w-7 text-[var(--red)]" icon={Target01Icon} />
            </div>
            <h3 className="mb-3 font-[family-name:var(--font-cinzel)] text-2xl text-[var(--foreground)] tracking-wide">
              {t("mission.title")}
            </h3>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              {t("mission.description")}
            </p>
          </div>

          {/* Vision Card */}
          <div className="rounded-2xl border border-[#ebe5d8] bg-white p-10 shadow-[var(--shadow-card)]">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--red)]/10">
              <HugeiconsIcon className="h-7 w-7 text-[var(--red)]" icon={CompassIcon} />
            </div>
            <h3 className="mb-3 font-[family-name:var(--font-cinzel)] text-2xl text-[var(--foreground)] tracking-wide">
              {t("vision.title")}
            </h3>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              {t("vision.description")}
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm sm:p-12">
          <div className="mb-8 text-center">
            <h3 className="mb-3 font-semibold text-2xl text-[var(--foreground)]">
              {t("values.title")}
            </h3>
            <p className="text-[var(--muted-foreground)]">{t("values.subtitle")}</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <div className="text-center" key={index}>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--red)]/10">
                  <HugeiconsIcon className="h-6 w-6 text-[var(--red)]" icon={value.icon} />
                </div>
                <h4 className="mb-2 font-semibold text-[var(--foreground)]">{t(value.titleKey)}</h4>
                <p className="text-[var(--muted-foreground)] text-sm">{t(value.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

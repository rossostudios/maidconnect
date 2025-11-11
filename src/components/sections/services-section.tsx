"use client";

import {
  BabyBed01Icon,
  ChefHatIcon,
  FavouriteIcon,
  Home03Icon,
  PackageIcon,
  UserLove01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { FeatureCard, FeatureGrid, FeatureSection } from "@/components/ui/feature-section";
import { Link } from "@/i18n/routing";

// Icon mapping for each service
const serviceIcons = {
  housekeeping: Home03Icon,
  childcare: BabyBed01Icon,
  relocation: PackageIcon,
  elderCare: UserLove01Icon,
  petCare: FavouriteIcon,
  lifestyle: ChefHatIcon,
} as const;

type ServiceKey = keyof typeof serviceIcons;

export function ServicesSection() {
  const t = useTranslations("services");

  const serviceKeys: ServiceKey[] = [
    "housekeeping",
    "childcare",
    "relocation",
    "elderCare",
    "petCare",
    "lifestyle",
  ];

  return (
    <FeatureSection
      align="center"
      backgroundColor="slate-50"
      description={
        t("subtitle") ||
        "Professional home services that make life easier. From cleaning to childcare, find verified professionals ready to help."
      }
      heading={t("title")}
      id="services"
      tagline={t("badge")}
      textColor="slate-900"
    >
      <FeatureGrid>
        {serviceKeys.map((key) => {
          const Icon = serviceIcons[key];

          return (
            <FeatureCard
              description={t(`items.${key}.description`)}
              href={`/professionals?service=${key}`}
              icon={<HugeiconsIcon className="h-6 w-6" icon={Icon} />}
              key={key}
              linkText={t("cta")}
              title={t(`items.${key}.title`)}
            />
          );
        })}
      </FeatureGrid>

      {/* CTA Section */}
      <div className="mt-16 text-center">
        <Link
          className="inline-flex items-center justify-center rounded-full border-2 border-slate-900 bg-transparent px-8 py-4 font-semibold text-slate-900 shadow-lg transition-all duration-300 hover:bg-slate-900 hover:text-white hover:shadow-xl active:scale-95"
          href="/professionals"
        >
          {t("viewAll") || "View All Services"}
          <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
        </Link>
      </div>
    </FeatureSection>
  );
}

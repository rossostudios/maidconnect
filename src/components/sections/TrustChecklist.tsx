"use client";

/**
 * TrustChecklist - Airbnb-Style Trust & Safety Section
 *
 * Clean, simple presentation of trust features:
 * - Background checks included
 * - ID verification
 * - Secure payments
 * - Quality guarantee
 *
 * Design: Minimal grid with icons and short copy.
 */

import {
  CheckmarkCircle02Icon,
  CreditCardIcon,
  Shield01Icon,
  UserCheck01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils/core";

type TrustItem = {
  id: string;
  icon: typeof Shield01Icon;
  titleKey: string;
  descriptionKey: string;
};

const trustItems: TrustItem[] = [
  {
    id: "background",
    icon: Shield01Icon,
    titleKey: "background.title",
    descriptionKey: "background.description",
  },
  {
    id: "identity",
    icon: UserCheck01Icon,
    titleKey: "identity.title",
    descriptionKey: "identity.description",
  },
  {
    id: "payments",
    icon: CreditCardIcon,
    titleKey: "payments.title",
    descriptionKey: "payments.description",
  },
  {
    id: "guarantee",
    icon: CheckmarkCircle02Icon,
    titleKey: "guarantee.title",
    descriptionKey: "guarantee.description",
  },
];

type TrustChecklistProps = {
  className?: string;
};

export function TrustChecklist({ className }: TrustChecklistProps) {
  const t = useTranslations("home.trustChecklist");

  return (
    <section className={cn("bg-neutral-50 py-16 sm:py-20 lg:py-24 dark:bg-neutral-900", className)}>
      <Container className="max-w-6xl">
        {/* Section Header */}
        <div className="mb-12 text-center lg:mb-16">
          <span className="mb-4 inline-block rounded-full border border-neutral-200 bg-white px-4 py-1.5 font-medium text-neutral-600 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
            {t("badge")}
          </span>
          <h2 className="font-[family-name:var(--font-geist-sans)] font-semibold text-2xl text-neutral-900 sm:text-3xl lg:text-4xl dark:text-white">
            {t("title")}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-neutral-600 sm:text-lg dark:text-neutral-400">
            {t("subtitle")}
          </p>
        </div>

        {/* Trust Items Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
          {trustItems.map((item) => (
            <div
              className="flex gap-4 rounded-xl border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-md sm:p-8 dark:border-neutral-700 dark:bg-neutral-800"
              key={item.id}
            >
              {/* Icon */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rausch-100 dark:bg-rausch-500/20">
                <HugeiconsIcon
                  className="h-6 w-6 text-rausch-600 dark:text-rausch-400"
                  icon={item.icon}
                />
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="mb-1 font-semibold text-base text-neutral-900 sm:text-lg dark:text-white">
                  {t(item.titleKey)}
                </h3>
                <p className="text-neutral-600 text-sm leading-relaxed sm:text-base dark:text-neutral-400">
                  {t(item.descriptionKey)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="mt-10 text-center sm:mt-12">
          <p className="text-neutral-500 text-sm dark:text-neutral-400">{t("footer")}</p>
        </div>
      </Container>
    </section>
  );
}

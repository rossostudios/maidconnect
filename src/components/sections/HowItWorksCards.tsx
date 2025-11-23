"use client";

/**
 * HowItWorksCards - Airbnb-Style 3-Step Process
 *
 * Clean, simple cards showing how Casaora works:
 * 1. Browse & Choose
 * 2. Book Instantly
 * 3. Enjoy Peace of Mind
 *
 * Design: Minimal cards with icons, step numbers, and clear copy.
 */

import { Calendar03Icon, CheckmarkCircle01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils/core";

type Step = {
  number: number;
  icon: typeof Search01Icon;
  titleKey: string;
  descriptionKey: string;
};

const steps: Step[] = [
  {
    number: 1,
    icon: Search01Icon,
    titleKey: "browse",
    descriptionKey: "browseDescription",
  },
  {
    number: 2,
    icon: Calendar03Icon,
    titleKey: "book",
    descriptionKey: "bookDescription",
  },
  {
    number: 3,
    icon: CheckmarkCircle01Icon,
    titleKey: "enjoy",
    descriptionKey: "enjoyDescription",
  },
];

type HowItWorksCardsProps = {
  className?: string;
};

export function HowItWorksCards({ className }: HowItWorksCardsProps) {
  const t = useTranslations("home.howItWorksCards");

  return (
    <section className={cn("bg-white py-16 sm:py-20 lg:py-24", className)} id="how-it-works">
      <Container className="max-w-6xl">
        {/* Section Header */}
        <div className="mb-12 text-center lg:mb-16">
          <h2 className="font-[family-name:var(--font-geist-sans)] font-semibold text-2xl text-neutral-900 sm:text-3xl lg:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-neutral-600 sm:text-lg">
            {t("subtitle")}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6 lg:gap-10">
          {steps.map((step) => (
            <div
              className="group relative flex flex-col items-center text-center"
              key={step.number}
            >
              {/* Step Number Badge */}
              <div className="-top-3 -translate-x-1/2 absolute left-1/2 rounded-full bg-orange-500 px-3 py-1 font-semibold text-white text-xs">
                Step {step.number}
              </div>

              {/* Card */}
              <div className="flex h-full w-full flex-col items-center rounded-xl border border-neutral-200 bg-neutral-50 px-6 pt-10 pb-6 transition-all hover:border-neutral-300 hover:shadow-md sm:px-8 sm:pt-12 sm:pb-8">
                {/* Icon */}
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 sm:h-16 sm:w-16">
                  <HugeiconsIcon
                    className="h-7 w-7 text-orange-600 sm:h-8 sm:w-8"
                    icon={step.icon}
                  />
                </div>

                {/* Title */}
                <h3 className="mb-2 font-semibold text-lg text-neutral-900 sm:text-xl">
                  {t(step.titleKey)}
                </h3>

                {/* Description */}
                <p className="text-neutral-600 text-sm leading-relaxed sm:text-base">
                  {t(step.descriptionKey)}
                </p>
              </div>

              {/* Connector Arrow (hidden on last step and mobile) */}
              {step.number < 3 && (
                <div className="-right-3 -translate-y-1/2 lg:-right-5 absolute top-1/2 hidden text-neutral-300 md:block">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M9 5l7 7-7 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 text-center sm:mt-12">
          <p className="text-neutral-500 text-sm">{t("footer")}</p>
        </div>
      </Container>
    </section>
  );
}
